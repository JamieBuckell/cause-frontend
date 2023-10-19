<template>
  <div class="row">
    <div class="col-12">
      <ListingsPage
        :paginateOptions="pagination"
        :listingsData="emailTemplatesData"
        :options="options"
        listingsType="emails"
        @editItem="handleEdit"
        :customActions="getCustomActions"
        @handleCustomAction="handleCustomAction"
      >
        <template v-slot:header> All Emails Templates </template>
      </ListingsPage>

      <el-dialog center :visible.sync="showPreview" width="80%">
        <div class="row">
          <div
            class="col-12"
            :class="hasAdditionalDetail ? 'col-xl-8 order-1 order-xl-1' : ''"
          >
            <template v-if="previewData.subject">
              <h3 class="email-subject">
                Subject:
                <span v-html="previewData.subject" />
              </h3>
            </template>
          </div>
          <div
            class="col-12"
            :class="hasAdditionalDetail ? 'col-xl-8 order-3 order-xl-2' : ''"
          >
            <EmailPreview :previewContent="getPreviewContent" />
          </div>
          <div
            class="col-12"
            :class="hasAdditionalDetail ? 'col-xl-4 order-2 order-xl-3' : ''"
          >
            <template v-if="previewData.dateAdded">
              <h3>Date Sent</h3>
              <p v-html="previewData.dateAdded" />
            </template>
            <template v-if="previewData.recipientCount">
              <h3>Recipient Count</h3>
              <p v-html="previewData.recipientCount" />
            </template>
            <template v-if="previewData.options && previewData.options.type">
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
            </template>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { sendEmail } from "@/api/communications.api";
import { getSentCommuncations } from "@/api/communications.api";
import { getEmailTemplates } from "@/api/emailTemplates.api";
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
      previewData: {
        template: "",
        title: "",
        subject: "",
        content: "",
        options: {},
        dateAdded: "",
        recipientCount: 0,
      },
      emailTemplatesData: [],
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
            prop: "description",
            label: "Email Description",
            minWidth: 200,
          },
        ],
        searchKeys: ["subject", "pageTitle", "pageContent", "description"],
        delete: false,
        edit: false,
      },
    };
  },
  computed: {
    hasAdditionalDetail() {
      return (
        this.previewData?.dateAdded ||
        this.previewData?.recipientCount ||
        (this.previewData?.options && this.previewData?.options?.type)
      );
    },
    getPreviewContent() {
      let previewContent = this.previewData?.template ?? "";
      previewContent = previewContent.replace(
        "{{pageTitle}}",
        this.previewData?.title
      );
      previewContent = previewContent.replace(
        "{{pageContent}}",
        this.previewData?.content
      );
      return previewContent;
    },
    getCustomActions() {
      const propCustomActions = [];

      if (this.isJamie()) {
        propCustomActions.push({
          emit: "previewEmail",
          type: "icon",
          icon: "nc-icon nc-paper-2",
          class: "btn-success",
          text: "Preview Email",
        });
      }
      return propCustomActions;
    },
  },
  methods: {
    async handleEdit(i, r) {
      this.showPreview = true;

      this.previewData.template = r?.template ?? "";
      this.previewData.subject = r?.subject ?? "";
      this.previewData.title = r?.pageTitle ?? "";
      this.previewData.content = r?.pageContent ?? "";
    },
    async handleCustomAction(i, k, r) {
      switch (k) {
        case "previewEmail":
          this.showPreview = true;

          this.previewData.template = r?.template ?? "";
          this.previewData.subject = r?.subject ?? "";
          this.previewData.title = r?.pageTitle ?? "";
          this.previewData.content = r?.pageContent ?? "";
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
    const res = await getEmailTemplates();
    this.emailTemplatesData = res.data;

    this.emailTemplatesData.sort((a, b) =>
      b.SK > a.SK ? 1 : a.SK > b.SK ? -1 : 0
    );
  },
};
</script>
<style scoped lang="scss">
.email-subject {
  font-size: 1.25rem;
  font-weight: 400;
  > span {
    font-weight: 700;
  }
}
</style>
