<template>
  <div class="row">
    <div class="col-12">
      <ListingsPage
        :paginateOptions="pagination"
        :listingsData="sentEmailsData"
        :options="options"
        listingsType="emails"
        :customActions="getCustomActions"
        @handleCustomAction="handleCustomAction"
        :dataLoading="false"
      >
        <template v-slot:header>
          All Sent Emails

          <button
            type="submit"
            class="btn btn-info btn-fill btn-wd pull-right"
            @click.prevent="handleCreate"
          >
            Send Email
          </button>
        </template>
      </ListingsPage>

      <el-dialog center :visible.sync="showPreview" width="80%">
        <div class="row">
          <div class="col-12 col-xl-8 order-2 order-xl-1">
            <EmailPreview :previewContent="getPreviewContent" />
          </div>
          <div class="col-12 col-xl-4 order-1 order-xl-2">
            <h3>Subject</h3>
            <p v-html="previewData.subject" />
            <h3>Date Sent</h3>
            <p v-html="previewData.dateAdded" />
            <h3>Recipient Count</h3>
            <p v-html="previewData.recipientCount" />
            <h3>Additional Options</h3>
            <p>
              <small v-if="previewData.options.type"
                ><strong>Recipient Type:</strong> {{ previewData.options.type
                }}<br
              /></small>
              <small
                v-if="
                  previewData.options.toAddresses &&
                  previewData.options.toAddresses.length
                "
                ><strong>To:</strong>
                {{ previewData.options.toAddresses.join("; ") }}<br
              /></small>
              <small v-if="previewData.options.excludePledged"
                ><strong>Exclude Pledged Subscribers:</strong>
                {{ previewData.options.excludePledged }}<br
              /></small>
              <small v-if="previewData.options.excludeTeamLeads"
                ><strong>Exclude Team Leads:</strong>
                {{ previewData.options.excludeTeamLeads }}<br
              /></small>
            </p>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { previewAndSendEmail } from "@/services/communicationsSend";
import { getSentCommuncations } from "@/api/communications.api";
import ListingsPage from "@/components/Cards/ListingsPage.vue";
import EmailPreview from "@/components/Communications/EmailPreview.vue";
import { Dialog } from "element-ui";
import Swal from "sweetalert2";
import { MessageBox } from "element-ui";
import parseJson from "parse-json";

Vue.prototype.$confirm = MessageBox.confirm;

export default {
  components: {
    ListingsPage,
    EmailPreview,
    [Dialog.name]: Dialog,
  },
  props: {
    organisationId: {
      type: String,
      default: "",
    },
    paginateOptions: {
      type: Object,
      default: () => ({
        perPage: 50,
        perPageOptions: [25, 50, 100, 150, 200],
      }),
    },
  },
  data() {
    return {
      showPreview: false,
      isSending: false,
      previewData: {
        template: "",
        title: "",
        subject: "",
        content: "",
        options: {},
        dateAdded: "",
        recipientCount: 0,
      },
      sentEmailsData: [],
      pagination: {
        perPage: this.paginateOptions.perPage ?? 50,
        currentPage: 1,
        perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
        total: 0,
      },
      options: {
        columns: [
          {
            prop: "subject",
            label: "Email Subject",
            minWidth: 150,
          },
          {
            prop: "dateAdded",
            label: "Date Sent",
            minWidth: 70,
          },
          {
            prop: "recipientCount",
            label: "Selected Recipients",
            minWidth: 60,
          },
          { prop: "deliveryStatus", label: "Sending status", minWidth: 180 },
        ],
        searchKeys: ["subject", "title", "content"],
        delete: false,
        edit: false,
      },
    };
  },
  computed: {
    getPreviewContent() {
      let previewContent = this.previewData.template;
      previewContent = previewContent.replace(
        "{{pageTitle}}",
        this.previewData.title
      );
      previewContent = previewContent.replace(
        "{{pageContent}}",
        this.previewData.content
      );
      return previewContent;
    },
    getCustomActions() {
      const propCustomActions = [];

      if (this.isJamie()) {
        propCustomActions.push({
          emit: "resendComms",
          type: "icon",
          icon: "nc-icon nc-send",
          class: "btn-danger",
          text: "Resend Email",
        });
      }

      propCustomActions.push({
        emit: "previewEmail",
        type: "icon",
        icon: "nc-icon nc-paper-2",
        class: "btn-success",
        text: "Preview Email",
      });
      return propCustomActions;
    },
  },
  methods: {
    async loadEmails() {
      const res = await getSentCommuncations();
      this.sentEmailsData = Object.values(res.data?.emails || {}).map((e) => ({
        dateAdded: e.dateAdded,
        requestId: e.GSI1PK,
        deliveryStatus: e.deliveryStatus || "Historical send records",
        ...e.email,
      }));

      this.previewData.template = res.data?.template;

      this.sentEmailsData.sort((a, b) =>
        b.dateAdded > a.dateAdded ? 1 : a.dateAdded > b.dateAdded ? -1 : 0
      );
    },
    async handleCreate(i, r) {
      this.$router.push(`/communications/create`);
    },
    async handleCustomAction(i, k, r) {
      switch (k) {
        case "previewEmail":
          this.showPreview = true;

          this.previewData.subject = r.subject;
          this.previewData.title = r.title;
          this.previewData.content = r.content;
          this.previewData.dateAdded = r.dateAdded;
          this.previewData.recipientCount = r.recipientCount;
          this.previewData.options = r?.options ? JSON.parse(r.options) : "";
          break;
        case "resendComms":
          if (this.isSending) return;
          this.isSending = true;
          try {
            const choice = await Swal.fire({
              title: "Choose recipients for this resend",
              input: "radio",
              inputOptions: {
                remaining: "Only recipients not already sent this email",
                all: "Everyone — send another copy to previous recipients",
              },
              inputValue: "remaining",
              showCancelButton: true,
              confirmButtonText: "Preview recipients",
            });
            if (choice.isConfirmed) {
              const emailOptions = r.options ? parseJson(r.options) : {};
              await previewAndSendEmail({
                options: {
                  ...emailOptions,
                  campaignId: emailOptions.campaignId,
                  ignorePreviouslySent: choice.value === "all",
                },
                existingEmailId: r.requestId,
                email: { fromAddress: r.sendFrom || r.fromAddress || "hampers",
                  subject: r.subject, title: r.title, content: r.content },
              });
              await this.loadEmails();
            }
          } catch (error) {
            await Swal.fire({ title: "Mailing not confirmed", text: error.message, type: "error" });
          } finally {
            this.isSending = false;
          }
          break;
        default:
          this.$emit(k, i, r);
          break;
      }
    },
  },
  async mounted() {
    if (!this.userInGroup("admin") && !this.organisationId) {
      this.$router.push("/");
    }
    await this.loadEmails();
  },
};
</script>
