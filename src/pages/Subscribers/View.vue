<template>
  <div>
    <div
      class="alert alert-danger clearfix align-self-center"
      role="alert"
      v-if="subscriber.bounced"
    >
      <strong>This subscribers email has bounced:</strong>
      {{ getBouncedReason(subscriber.bouncedDetail) }}
    </div>

    <div class="row">
      <div class="col-5">
        <card>
          <div slot="header">
            <h4 class="title">
              {{ subscriber.firstName }} {{ subscriber.lastName }}
            </h4>
          </div>
          <div class="row">
            <div class="col col-12" v-if="subscriber.PK">
              <label>Email</label><br />
              <p v-if="!editEmailAddress">
                {{ subscriber.PK }}
                <button
                  v-if="1 === 2"
                  @click.prevent="editEmailAddress = true"
                  class="btn btn-fill btn-info pull-right"
                >
                  Edit
                </button>
              </p>
              <ValidationObserver
                v-slot="{ handleSubmit }"
                v-if="editEmailAddress"
              >
                <form @submit.prevent="handleSubmit(saveEmail)">
                  <div class="row">
                    <div class="col-12">
                      <l-alert type="danger" v-for="m in messages" :key="m">
                        <span> {{ getErrorMessage(m) }}</span>
                      </l-alert>
                      <ValidationProvider
                        name="email"
                        rules="required|email"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          type="email"
                          :error="failed ? 'The Email field is required' : null"
                          :hasSuccess="passed"
                          name="email"
                          v-model="updatedEmail"
                          class="mb-0"
                        >
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <button type="submit" class="btn btn-fill btn-info w-100">
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </ValidationObserver>
            </div>
            <div class="col col-12" v-if="subscriber.telephone">
              <label>Telephone</label><br />
              <p>{{ subscriber.telephone }}</p>
            </div>
            <div class="col col-12" v-if="subscriber.company">
              <label>Company</label><br />
              <p>{{ subscriber.company }}</p>
            </div>
            <div class="col col-12">
              <label>Email address verified</label><br />
              <p>{{ subscriber.verified ? "Yes" : "No" }}</p>
            </div>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { getDonorById, donorEmailUpdate } from "@/api/donors.api";
import Swal from "sweetalert2";
import { MessageBox } from "element-ui";
import LAlert from "src/components/Alert";

Vue.prototype.$confirm = MessageBox.confirm;
export default {
  components: {
    LAlert,
  },
  data() {
    return {
      baseUrl: this.$hostname,
      editEmailAddress: false,
      messages: [],
      updatedEmail: "",
      subscriber: {
        requestId: "",
        firstName: "",
        lastName: "",
        email: "",
        telephone: "",
        company: "",
        dateAdded: "",
        dateSubcribed: "",
        dateUnsubcribed: "",
        dateVerified: "",
        dateBounced: "",
        subscribed: false,
        verified: false,
        bounced: false,
      },
    };
  },
  computed: {
    platformData() {
      return this.$store.getters.getPlatformData;
    },
  },
  methods: {
    async saveEmail() {
      if (this.updatedEmail != this.subscriber.email) {
        await Swal.fire({
          title: "Do you want to resend the verification email?",
          text: `As you have updated this users email, you should also ask them to verify it unless you're confident the email is correct.`,
          type: "warning",
          showCancelButton: true,
          confirmButtonClass: "btn btn-success btn-fill",
          cancelButtonClass: "btn btn-danger btn-fill",
          confirmButtonText: "Yes, resent it!",
          cancelButtonText: "No, just save",
          buttonsStyling: false,
        }).then(async (d) => {
          const sendEmail = d.isConfirmed || d.dismiss === "esc";
          if (!d.isDismissed || d.dismiss === "cancel") {
            const updateRes = await donorEmailUpdate({
              donorId: this.subscriber.requestId,
              previousEmail: this.subscriber.email,
              updatedEmail: this.updatedEmail,
              sendEmail,
            });
            if (updateRes?.data?.status != 200 && updateRes?.data?.messages) {
              this.messages = Object.keys(updateRes?.data?.messages).map(
                (k) => ({
                  error: updateRes?.data?.messages[k],
                })
              );
            } else {
              this.subscriber.email = this.updatedEmail;
              this.subscriber.bounced = false;
              this.subscriber.bouncedDetail = "";
            }
          }
        });
      }
      if (!this.messages.length) {
        this.editEmailAddress = false;
      }
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
    getBouncedReason(bouncedData) {
      const obj = JSON.parse(bouncedData);
      return obj?.detail?.diagnosticCode;
    },
  },
  async mounted() {
    if (!this.userInGroup("admin")) {
      this.$router.push("/");
    }
    const pData = this.$store.getters.getPlatformData;
    this.subscriber = pData.subscribers.find(
      (s) => s?.PK === this.$route.params.subscriberId
    );

    this.updatedEmail = this.subscriber?.PK;
  },
};
</script>
<style></style>
