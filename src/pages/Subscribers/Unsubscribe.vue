<template>
  <standalone-layout pageClass="donor-register-page">
    <div class="row d-flex justify-content-center">
      <div class="col-lg-8 col-md-8 col-sm-10 pt-5">
        <fade-render-transition>
          <card class="px-5 pb-0">
            <div slot="header" class="text-center">
              <img :src="headerImage" :alt="logoAlt" class="site-header" />
              <h3 class="card-title text-center" v-if="status === 'confirming'">
                Are you sure you want to unsubscribe?
              </h3>
              <h3 class="card-title text-center" v-if="status === 'cancelled'">
                Great choice!
              </h3>
              <h3
                class="card-title text-center"
                v-if="status === 'unsubscribed'"
              >
                You have been unsubscribed.
              </h3>
              <h3 class="card-title text-center" v-if="status === 'error'">
                There has been an error
              </h3>
            </div>

            <div
              class="row"
              v-if="isLoading"
              v-loading="isLoading"
              id="loading"
            ></div>
            <div v-if="!isLoading">
              <div v-if="status === 'confirming'">
                <div class="row">
                  <div class="col-12 col-md-12 text-center">
                    <p>
                      If you unsubscribe, you'll miss out on hamper campaign
                      launch dates, special events and much more!
                    </p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-12 col-md-12 text-center py-4">
                    <button
                      type="submit"
                      class="btn btn-info btn-fill mr-4"
                      @click.prevent="cancelUnsubscribe"
                    >
                      I'd rather stay
                    </button>
                    <a @click.prevent="doUnsubscribe" href="#"
                      >Unsubscribe me <i class="fa fa-arrow-right"
                    /></a>
                  </div>
                </div>
              </div>
              <div v-if="status === 'cancelled'">
                <div class="row">
                  <div class="col-12 col-md-12 text-center">
                    <p>Now we can keep you up to date with all things CAUSE.</p>
                  </div>
                </div>
              </div>
              <div v-if="status === 'unsubscribed'">
                <div class="row">
                  <div class="col-12 col-md-12 text-center">
                    <p>
                      You will no longer recieve updates from CAUSE and we're
                      sad to see you go.
                    </p>
                  </div>
                </div>
                <div class="row">
                  <div class="col-12 col-md-12 text-center py-4">
                    <button
                      type="submit"
                      class="btn btn-info btn-fill mr-4"
                      @click.prevent="reSubscribe"
                    >
                      I've changed my mind, i want to stay
                    </button>
                  </div>
                </div>
              </div>
              <div v-if="status === 'error'">
                <div class="row">
                  <div class="col-12 col-md-12 text-center">
                    <p>
                      The link you've followed has not been recognised. Please
                      try the link again or
                      <a
                        href="https://www.cause-foundation.org.uk/contact-us-i3"
                        >Contact Us</a
                      >
                      if the problem persists..
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div slot="footer" class="text-center">
              <a
                href="https://cause-foundation.org.uk/"
                title="A link back to the main website"
              >
                <img :src="logo" :alt="logoAlt" class="site-logo pt-4" />
              </a>
            </div>
          </card>
        </fade-render-transition>
      </div>
    </div>
  </standalone-layout>
</template>
<script>
import Vue from "vue";
import { FadeRenderTransition } from "src/components/index";
import StandaloneLayout from "../Dashboard/Pages/StandaloneLayout.vue";
import {
  checkSubscriber,
  Unsubscribe,
  Resubscribe,
} from "@/api/subscribers.api";
import { Loading } from "element-ui";

Vue.use(Loading);

export default {
  components: {
    FadeRenderTransition,
    StandaloneLayout,
  },
  data() {
    return {
      isLoading: true,
      logo: "/static/img/cause-foundation-logo.png",
      headerImage: "/static/img/envelope-green.jpeg",
      logoAlt: "CAUSE Foundation Logo",
      verificationMessage: "",
      status: "confirming",
    };
  },
  methods: {
    async cancelUnsubscribe() {
      this.status = "cancelled";
    },
    async doUnsubscribe() {
      this.isLoading = true;
      try {
        if (this?.$route?.params?.email && this?.$route?.params?.hash) {
          const resubscribe = await Unsubscribe(
            this.$route.params.email,
            this.$route.params.hash
          );

          if (resubscribe.data?.messages) {
            this.messages = Object.keys(resubscribe?.data?.messages).map(
              (k) => ({
                error: resubscribe?.data?.messages[k],
              })
            );
          }
          if (resubscribe.status == 200) {
            if (!resubscribe.data?.subscribed) {
              this.status = "unsubscribed";
            }
          } else {
            this.status = "error";
          }
        } else {
          this.status = "error";
        }
      } catch (e) {
        this.status = "error";
      }
      this.isLoading = false;
    },
    async reSubscribe() {
      this.isLoading = true;
      try {
        if (this?.$route?.params?.email && this?.$route?.params?.hash) {
          const resubscribe = await Resubscribe(
            this.$route.params.email,
            this.$route.params.hash
          );

          if (resubscribe.data?.messages) {
            this.messages = Object.keys(resubscribe?.data?.messages).map(
              (k) => ({
                error: resubscribe?.data?.messages[k],
              })
            );
          }
          if (resubscribe.status == 200) {
            if (!resubscribe.data?.subscribed) {
              this.status = "cancelled";
            }
          } else {
            this.status = "error";
          }
        } else {
          this.status = "error";
        }
      } catch (e) {
        this.status = "error";
      }
      this.isLoading = false;
    },
    async initSubscriber() {
      try {
        if (this?.$route?.params?.email && this?.$route?.params?.hash) {
          const verification = await checkSubscriber(
            this.$route.params.email,
            this.$route.params.hash
          );

          if (verification.data?.messages) {
            this.messages = Object.keys(verification?.data?.messages).map(
              (k) => ({
                error: verification?.data?.messages[k],
              })
            );
          }
          if (verification.status == 200) {
            if (!verification.data?.subscribed) {
              this.status = "unsubscribed";
            }
          } else {
            this.status = "error";
          }
        } else {
          this.status = "error";
        }
      } catch (e) {
        this.status = "error";
      }
    },
  },
  async mounted() {
    await this.initSubscriber();

    this.isLoading = false;
  },
};
</script>
<style lang="scss">
.site-logo,
.site-header {
  display: block;
}
.site-header {
  max-width: 300px;
  padding-bottom: 2rem;
  margin: 0 auto;
}
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
