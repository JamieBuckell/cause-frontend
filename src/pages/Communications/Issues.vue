<template>
  <div class="card email-issues">
    <div class="card-header">
      <h4 class="card-title">Email Issues</h4>
      <p>Review delivery problems and unsubscribe requests. Notes and review status do not change subscriptions or send emails.</p>
    </div>
    <div class="card-body">
      <div class="issue-filters">
        <label>View
          <select v-model="source" class="form-control" :disabled="loading" @change="refresh">
            <option value="events">Bounces, complaints and delivery events</option>
            <option value="failures">Sending failures and uncertain sends</option>
            <option value="unsubscribes">Unsubscribes</option>
          </select>
        </label>
        <label>Review status
          <select v-model="status" class="form-control">
            <option value="all">All</option><option value="open">Open</option><option value="resolved">Resolved</option>
          </select>
        </label>
        <label>Search loaded issues
          <input v-model="search" class="form-control" type="search" placeholder="Email, subject or issue type">
        </label>
        <button class="btn btn-info" :disabled="loading" @click="refresh">Refresh</button>
      </div>
      <p v-if="source === 'events'" class="text-muted">Events are collected from portal emails sent after issue tracking was enabled. Older delivery events are not backfilled.</p>
      <p v-if="source === 'failures'" class="text-muted">Includes failed sends, uncertain results, and sends still waiting after five minutes. Check delivery before considering another send.</p>
      <p v-if="source === 'unsubscribes'" class="text-muted">Shows subscribers currently opted out with a recorded unsubscribe date. Resolving a review keeps them unsubscribed.</p>
      <div v-if="error" class="alert alert-danger" role="alert">{{ error }}</div>
      <p aria-live="polite">{{ filtered.length }} shown · {{ issues.length }} loaded<span v-if="nextCursor"> · More records available</span></p>
      <div class="table-responsive">
        <table class="table table-striped">
          <thead><tr><th>Date</th><th>Email address</th><th>Issue</th><th>Subject / detail</th><th>Review</th><th><span class="sr-only">Actions</span></th></tr></thead>
          <tbody>
            <tr v-for="issue in filtered" :key="issue.id">
              <td class="issue-date">{{ formatDate(issue.occurredAt) }}</td>
              <td>{{ issue.email }}</td><td>{{ issue.kind }}</td>
              <td class="issue-detail"><strong v-if="issue.subject">{{ issue.subject }}</strong><div>{{ issue.detail }}</div></td>
              <td><span :class="['badge', issue.reviewStatus === 'resolved' ? 'badge-success' : 'badge-warning']">{{ issue.reviewStatus === 'resolved' ? 'Resolved' : 'Open' }}</span></td>
              <td><button class="btn btn-sm btn-outline-info" @click="openReview(issue)">Review<span class="sr-only"> {{ issue.email }}</span></button></td>
            </tr>
            <tr v-if="!filtered.length && !loading"><td colspan="6">No matching issues in the loaded records.<span v-if="nextCursor"> Load more to check the remaining records.</span></td></tr>
          </tbody>
        </table>
      </div>
      <button v-if="nextCursor" class="btn btn-info" :disabled="loading" @click="loadMore">{{ loading ? 'Loading…' : 'Load more records' }}</button>
      <p v-else-if="loading" role="status">Loading email issues…</p>
      <el-dialog title="Review email issue" :visible.sync="showReview" width="90%" :before-close="closeReview" :close-on-click-modal="false">
        <div v-if="selected" class="review-form">
          <h5>{{ selected.kind }} · {{ selected.email }}</h5>
          <p v-if="selected.subject"><strong>Subject:</strong> {{ selected.subject }}</p>
          <p>{{ selected.detail }}</p>
          <p v-if="selected.messageId"><strong>SES message ID:</strong> {{ selected.messageId }}</p>
          <p v-if="selected.runId"><strong>Mailing reference:</strong> {{ selected.runId }}</p>
          <p v-if="selected.emailId"><strong>Email reference:</strong> {{ selected.emailId }}</p>
          <label for="issue-status">Review status</label>
          <select id="issue-status" v-model="draftStatus" class="form-control" :disabled="saving"><option value="open">Open</option><option value="resolved">Resolved</option></select>
          <label for="issue-note">Review notes</label>
          <textarea id="issue-note" v-model="draftNote" class="form-control" rows="6" maxlength="4000" :disabled="saving" placeholder="Record what you checked and any follow-up needed"></textarea>
          <p class="text-muted">Saving a review does not retry a send, block an address or change subscription preferences.</p>
          <p v-if="selected.reviewedAt">Last reviewed by {{ selected.reviewedBy }} on {{ formatDate(selected.reviewedAt) }}</p>
          <div v-if="saveError" class="alert alert-danger" role="alert">{{ saveError }}</div>
          <button class="btn btn-info" :disabled="saving" @click="saveReview">{{ saving ? 'Saving…' : 'Save review' }}</button>
          <button class="btn btn-secondary" :disabled="saving" @click="showReview = false">Cancel</button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import { Dialog } from "element-ui";
import { getEmailIssues, reviewEmailIssue } from "@/api/communications.api";
export default {
  components: { [Dialog.name]: Dialog },
  data() {
    return { source: "events", status: "all", search: "", issues: [], nextCursor: null,
      loading: false, error: "", showReview: false, selected: null, draftStatus: "open", draftNote: "", saving: false, saveError: "" };
  },
  computed: {
    filtered() {
      const search = this.search.trim().toLowerCase();
      return this.issues.filter(issue => (this.status === "all" || issue.reviewStatus === this.status) &&
        [issue.email, issue.subject, issue.kind, issue.detail].join(" ").toLowerCase().includes(search))
        .sort((a, b) => String(b.occurredAt).localeCompare(String(a.occurredAt)));
    },
  },
  mounted() { this.refresh(); },
  methods: {
    formatDate(value) {
      if (!value) return "Date unavailable";
      // Historical subscription dates have no timezone; preserve their stored value.
      if (!value.includes("T")) return value;
      const date = new Date(value);
      return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-GB");
    },
    async refresh() {
      if (this.loading) return;
      this.issues = []; this.nextCursor = null;
      await this.loadMore();
    },
    async loadMore() {
      if (this.loading) return;
      this.loading = true; this.error = "";
      try {
        const { data } = await getEmailIssues({ source: this.source, ...(this.nextCursor ? { cursor: this.nextCursor } : {}) });
        const merged = new Map(this.issues.map(issue => [issue.id, issue]));
        data.issues.forEach(issue => merged.set(issue.id, issue));
        this.issues = [...merged.values()]; this.nextCursor = data.nextCursor;
      } catch (error) { this.error = error.response?.data?.message || "Could not load issues. Please try refreshing."; }
      finally { this.loading = false; }
    },
    openReview(issue) {
      this.selected = issue; this.draftStatus = issue.reviewStatus; this.draftNote = issue.note;
      this.saveError = ""; this.showReview = true;
    },
    closeReview(done) { if (!this.saving) done(); },
    async saveReview() {
      if (this.saving) return;
      this.saving = true; this.saveError = "";
      try {
        const { source, key, id, version } = this.selected;
        const { data } = await reviewEmailIssue({ source, key, id, version, status: this.draftStatus, note: this.draftNote });
        this.issues = this.issues.map(issue => issue.id === id ? data.issue : issue);
        this.showReview = false;
      } catch (error) { this.saveError = error.response?.data?.message || "Could not save review. Refresh before trying again."; }
      finally { this.saving = false; }
    },
  },
};
</script>
<style scoped>
.issue-filters { display: flex; flex-wrap: wrap; gap: 16px; align-items: end; }
.issue-filters label { flex: 1 1 200px; }
.issue-filters .btn { margin-bottom: 10px; }
.issue-date { min-width: 145px; }
.issue-detail { max-width: 450px; white-space: normal; overflow-wrap: anywhere; }
.review-form { max-width: 900px; margin: auto; overflow-wrap: anywhere; }
.review-form label { margin-top: 16px; }
.review-form .text-muted { margin-top: 12px; }
</style>
