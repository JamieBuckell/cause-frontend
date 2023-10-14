<template>
  <standalone-layout pageClass="donor-register-page">
    <div v-if="isLoading" class="row" v-loading="isLoading" id="loading"></div>

    <div class="row d-flex justify-content-center" v-if="!isLoading">
      <div class="col-lg-8 col-md-8 col-sm-10 pt-5">
        <fade-render-transition>
          <card>
            <div slot="header" class="text-center">
              <img :src="logo" :alt="logoAlt" class="site-logo" />
              <h3 class="card-title text-center">Pledge Confirmation</h3>
            </div>
            <div>
              <div class="row">
                <div class="col-12 col-md-12 text-center">
                  <p v-html="verificationMessage"></p>

                  <l-alert type="danger" v-for="m in messages" :key="m">
                    <span> {{ getErrorMessage(m) }}</span>
                  </l-alert>

                  <ValidationObserver
                    v-slot="{ handleSubmit }"
                    v-if="viewType === 'change'"
                  >
                    <form @submit.prevent="handleSubmit(doChangePledge)">
                      <div class="row">
                        <div class="col-12">
                          <ValidationProvider
                            name="changeDetail"
                            v-slot="{ passed }"
                          >
                            <fg-input label="What do you wish to change?">
                              <textarea
                                class="form-control"
                                placeholder="Please give as much detail as possible as to what elements of your pledge you wish to change. If you are no longer in a position to provide a hamper, please let us know."
                                rows="5"
                                :hasSuccess="passed"
                                name="changeDetail"
                                v-model="changeDetail"
                              ></textarea>
                            </fg-input>
                          </ValidationProvider>
                        </div>
                      </div>

                      <div>
                        <button
                          type="submit"
                          class="btn btn-info btn-fill btn-wd"
                        >
                          Send Changes
                        </button>
                      </div>
                      <div class="clearfix"></div>
                    </form>
                  </ValidationObserver>
                </div>
              </div>
            </div>
          </card>
        </fade-render-transition>
      </div>
    </div>
  </standalone-layout>
</template>
<script>
import Vue from "vue";
import { extend } from "vee-validate";
import { required, email, confirmed } from "vee-validate/dist/rules";
import { FadeRenderTransition } from "src/components/index";
import StandaloneLayout from "../Dashboard/Pages/StandaloneLayout.vue";
import { confirmPledge, changePledge } from "@/api/donors.api";
import { Loading, Table, TableColumn, Select, Option } from "element-ui";
import LAlert from "src/components/Alert";

extend("email", email);
extend("required", required);
extend("confirmed", confirmed);

Vue.use(Loading);

export default {
  components: {
    FadeRenderTransition,
    StandaloneLayout,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    LAlert,
  },
  data() {
    return {
      isLoading: true,
      viewType: "",
      logo: "/static/img/cause-foundation-logo.png",
      logoAlt: "CAUSE Foundation Logo",
      verificationMessage:
        "Thank you, your pledge has been confirmed.<br /><br />You will shortly recieve an email with confirmation of your families along with your labels.",
      changeDetail: "",
      messages: [],
    };
  },
  methods: {
    async doChangePledge() {
      const changeDetail = this.changeDetail.trim();
      if (!changeDetail) {
        this.messages.push({
          error: "Please detail the changes you wish to make",
        });
        return;
      }
      this.isLoading = true;
      this.messages = [];
      const res = await changePledge(
        this.$route.query.e,
        this.$route.query.v,
        changeDetail,
        this.$store.getters.getActiveCampaign
      );
      if (res?.data?.messages?.success) {
        this.verificationMessage = res?.data?.messages?.success;
        this.viewType = "complete";
      } else {
        if (res?.data?.messages) {
          this.messages = Object.keys(res?.data?.messages).map((k) => ({
            error: res?.data?.messages[k],
          }));
        }
      }
      this.isLoading = false;
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
  },
  async mounted() {
    if (
      this?.$route?.query?.e &&
      this?.$route?.query?.t &&
      this?.$route?.query?.v
    ) {
      /* */
      if (this.$route.query.t === "accept") {
        this.viewType = "accept";
        const verification = await confirmPledge(
          this.$route.query.e,
          this.$route.query.v,
          this.$route.query?.c ? this.$route.query.c : ""
        );
        if (verification?.data?.messages?.success) {
          this.verificationMessage = verification?.data?.messages?.success;
        } else if (verification?.data?.messages?.unexpected) {
          this.verificationMessage = verification?.data?.messages?.unexpected;
        } else if (verification?.data?.messages?.error) {
          this.verificationMessage = verification?.data?.messages?.error;
        }
      } else {
        this.viewType = "change";
        this.verificationMessage =
          "Please detail in the box below what changes you'd like to make and we'll accomodate as best we can";
      }
      /* */
      this.isLoading = false;
    } else {
      window.location = "https://www.cause-foundation.org.uk/";
    }
  },
};
</script>
<style lang="scss">
.form-check-label {
  text-transform: none !important;
}
.marketing-info {
  border-top: none;

  .el-collapse-item {
    .el-collapse-item__header {
      font-weight: 400;
      font-size: 12px;
    }
  }
  .el-collapse-item__content {
    color: #9a9a9a;
  }
}
.card .card-category,
.card label {
  color: #252526;
}
.form-control,
.form-group .el-input__inner,
.el-date-picker .el-input .el-input__inner {
  color: #252526;
}

.form-control::-moz-placeholder {
  color: #888888;
}
.form-control:-moz-placeholder {
  color: #888888;
}
.form-control::-webkit-input-placeholder {
  color: #888888;
}
.form-control:-ms-input-placeholder {
  color: #888888;
}

#loading {
  min-height: 200px;
  display: flex;
  align-items: center;
}

.el-loading-spinner .path {
  stroke: #66615b !important;
}

.el-loading-mask {
  background: transparent !important;
}
</style>
