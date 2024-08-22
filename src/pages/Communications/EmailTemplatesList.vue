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
        :dataLoading="false"
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

      <el-dialog center :visible.sync="showEdit" width="80%">
        <div class="global-loading" v-if="isLoading">
          <div class="center">
            <div class="spinner-border text-muted" role="status">
              <span class="sr-only">Loading...</span>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <card>
              <div slot="header">
                <h4 class="title mt-0">Email Template Edit</h4>
                <div class="container">
                  <div class="row">
                    <div class="col-12">
                      <label for="description">Email Description:</label>
                      <el-input
                        type="text"
                        id="description"
                        class="mb-3 w-100"
                        style="width: 200px"
                        placeholder="Email Description"
                        v-model="previewData.description"
                      />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <label for="subject">Email Subject:</label>
                      <el-input
                        type="text"
                        id="subject"
                        class="mb-3 w-100"
                        style="width: 200px"
                        placeholder="Email Subject"
                        v-model="previewData.subject"
                      />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <label for="title">Email Title:</label>
                      <el-input
                        type="text"
                        id="title"
                        class="mb-3 w-100"
                        style="width: 200px"
                        placeholder="Email Title"
                        v-model="previewData.title"
                      />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <label for="content">Content:</label>
                      <wysiwyg v-model="previewData.content" class="mb-4" />
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <button
                        type="submit"
                        class="btn btn-fill btn-wd pull-right btn-info"
                        @click.prevent="doSaveTemplate"
                      >
                        Save Template
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </card>
          </div>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import {
  getEmailTemplates,
  updateEmailTemplate,
} from "@/api/emailTemplates.api";
import ListingsPage from "@/components/Cards/ListingsPage.vue";
import EmailPreview from "@/components/Communications/EmailPreview.vue";
import { Dialog } from "element-ui";
import Swal from "sweetalert2";
import { MessageBox } from "element-ui";

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
      isLoading: true,
      showEdit: false,
      showPreview: false,
      previewData: {
        template: "",
        title: "",
        subject: "",
        description: "",
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
            prop: "pageTitle",
            label: "Email Title",
            minWidth: 200,
          },
          {
            prop: "description",
            label: "Email Description",
            minWidth: 200,
          },
        ],
        searchKeys: [
          "subject",
          "description",
          "pageTitle",
          "pageContent",
          "description",
        ],
        delete: false,
        edit: true,
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
      this.showEdit = true;

      this.previewData.key = r?.PK ?? "";
      this.previewData.template = r?.template ?? "";
      this.previewData.subject = r?.subject ?? "";
      this.previewData.description = r?.description ?? "";
      this.previewData.title = r?.pageTitle ?? "";
      this.previewData.content = r?.pageContent ?? "";
    },
    async handleCustomAction(i, k, r) {
      switch (k) {
        case "previewEmail":
          this.showPreview = true;

          this.previewData.key = r?.PK ?? "";
          this.previewData.template = r?.template ?? "";
          this.previewData.subject = r?.subject ?? "";
          this.previewData.description = r?.description ?? "";
          this.previewData.title = r?.pageTitle ?? "";
          this.previewData.content = r?.pageContent ?? "";
          break;
        default:
          this.$emit(k, i, r);
          break;
      }
    },
    async doSaveTemplate() {
      this.isLoading = true;
      const saveTemplateRes = await updateEmailTemplate({
        key: this.previewData.key,
        subject: this.previewData.subject,
        description: this.previewData.description,
        pageTitle: this.previewData.title,
        pageContent: this.previewData.content,
      });

      if (saveTemplateRes.status == 200) {
        Swal.fire({
          title: "Success",
          text: "Email template saved successfully.",
          timer: 3000,
          showConfirmButton: false,
        });

        const res = await getEmailTemplates();
        this.emailTemplatesData = res.data;

        this.showEdit = false;
      } else {
        Swal.fire({
          title: "Error",
          text: "An unexpected error occurred",
          timer: 3000,
          showConfirmButton: false,
        });
      }

      this.isLoading = false;
    },
  },
  async mounted() {
    if (!this.userInGroup("admin") && !this.organisationId) {
      this.$router.push("/");
    }
    const res = await getEmailTemplates();
    this.emailTemplatesData = res.data;

    this.emailTemplatesData.sort((a, b) =>
      b.SK < a.SK ? 1 : a.SK < b.SK ? -1 : 0
    );
    this.isLoading = false;
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

.global-loading {
  padding: 30px 15px;
  min-height: 100%;
  position: absolute;
  background: rgba(255, 255, 255, 0.7);
  width: 100%;
  max-width: -webkit-fill-available;
  z-index: 1000;
  padding-top: 90px;
  text-align: center;
  .center {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .spinner-border {
      z-index: 1001;
      width: 4rem;
      height: 4rem;
      border-width: 0.5em;
    }
  }
}
</style>

<style lang="css">
@import "~vue-wysiwyg/dist/vueWysiwyg.css";
.editr {
  background: #fff;
}
</style>
