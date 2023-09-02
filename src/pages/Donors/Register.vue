<template>
  <standalone-layout pageClass="donor-register-page">
    <div
      v-if="isLoading"
      class="loading-full"
      v-loading="isLoading"
      id="loading"
    ></div>

    <div class="row d-flex justify-content-center">
      <div class="col-lg-8 col-md-8 col-sm-10">
        <fade-render-transition v-if="isOpen">
          <card>
            <div slot="header" class="text-center">
              <img :src="logo" :alt="logoAlt" class="site-logo" />
              <h3 class="card-title text-center">Donor Registration</h3>
            </div>
            <ValidationObserver v-slot="{ handleSubmit }" v-if="!submitSuccess">
              <!--You can specify transitions on initial render. The `card-hidden` class will be present initially and then it will be removed-->
              <form @submit.prevent="handleSubmit(handleRegisterSubmit)">
                <div>
                  <div class="row" v-if="messages.length">
                    <div class="col-12">
                      <l-alert type="danger" v-for="m in messages" :key="m">
                        <span> {{ m }}</span>
                      </l-alert>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12 col-md-6">
                      <ValidationProvider
                        name="firstname"
                        rules="required"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          placeholder="Your First name"
                          :error="
                            failed ? 'The First name field is required' : null
                          "
                          :hasSuccess="passed"
                          label="First name"
                          name="firstname"
                          v-model="donorData.firstname"
                        ></fg-input>
                      </ValidationProvider>
                    </div>
                    <div class="col-12 col-md-6">
                      <ValidationProvider
                        name="lastname"
                        rules="required"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          placeholder="Your Last name"
                          :error="
                            failed ? 'The Last name field is required' : null
                          "
                          :hasSuccess="passed"
                          label="Last name"
                          name="lastname"
                          v-model="donorData.lastname"
                        ></fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-6">
                      <ValidationProvider
                        name="email"
                        rules="required|email"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          type="email"
                          placeholder="Your Email address"
                          :error="failed ? 'The Email field is required' : null"
                          :hasSuccess="passed"
                          label="Email address"
                          name="email"
                          v-model="donorData.email"
                          @change="
                            donorData.email = $event.target.value.toLowerCase()
                          "
                        >
                        </fg-input>
                      </ValidationProvider>
                    </div>
                    <div class="col-6">
                      <ValidationProvider
                        name="email_confirm"
                        rules="required|email|confirmed:email"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          type="email"
                          placeholder="Your Email address"
                          :error="
                            failed ? 'The Email fields do not match' : null
                          "
                          :hasSuccess="passed"
                          label="Confirm Email address"
                          name="email_confirm"
                          v-model="donorData.email_confirm"
                          @change="
                            donorData.email_confirm =
                              $event.target.value.toLowerCase()
                          "
                        >
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <ValidationProvider name="telephone" v-slot="{ passed }">
                        <fg-input
                          type="text"
                          placeholder="Your Telephone Number"
                          :hasSuccess="passed"
                          label="Telephone Number"
                          name="telephone"
                          v-model="donorData.telephone"
                        >
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <ValidationProvider name="company" v-slot="{ passed }">
                        <fg-input
                          type="text"
                          placeholder="Company"
                          :hasSuccess="passed"
                          label="Company (If Applicable)"
                          name="company"
                          v-model="donorData.company"
                        >
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <ValidationProvider name="howHeard" v-slot="{ passed }">
                        <fg-input
                          label="How did you heard about us?"
                          class="mb-0"
                        >
                          <el-select
                            class="select-default mb-3 w-100"
                            :name="`howHeard`"
                            :hasSuccess="passed"
                            style="width: 200px"
                            placeholder="Please choose an option"
                            v-model="donorData.howHeard"
                            @change="updatedHowHeard()"
                          >
                            <el-option
                              class="select-default"
                              v-for="item in howHeardOptions"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"
                            >
                            </el-option>
                          </el-select>
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                  <div class="row" v-if="donorData.howHeard === 'other'">
                    <div class="col-12">
                      <ValidationProvider
                        name="howHeardOther"
                        v-slot="{ passed }"
                      >
                        <fg-input label="Please Specify">
                          <textarea
                            class="form-control"
                            placeholder="Please specify"
                            rows="2"
                            :hasSuccess="passed"
                            name="howHeardOther"
                            v-model="donorData.howHeardOther"
                          ></textarea>
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <ValidationProvider
                        name="families"
                        rules="required|min_value:1|max_value:300"
                        v-slot="{ passed, failed }"
                      >
                        <fg-input
                          type="number"
                          placeholder="families"
                          :hasSuccess="passed"
                          label="How many families would you like to provide for?"
                          name="families"
                          v-model="donorData.families"
                          :error="
                            failed
                              ? 'Number of families must be between 1 and 300'
                              : null
                          "
                          :min="1"
                          :max="300"
                          @input="populateDefaults()"
                        >
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>

                  <div v-if="donorData.families <= maxFamilyDetail">
                    <div
                      class="row"
                      v-for="index in parseInt(
                        donorData.families ? donorData.families : 0
                      )"
                      :key="index"
                    >
                      <div class="col-12 col-md-3">
                        <label :for="`familyDetail[${index - 1}]`"
                          >Family Preferences:</label
                        >
                      </div>
                      <div class="col-12 col-md-9">
                        <ValidationProvider
                          :name="`familyDetail[${index - 1}]`"
                          rules="required"
                          v-slot="{ passed }"
                        >
                          <el-select
                            class="select-default mb-3 w-100"
                            :name="`familyDetail[${index - 1}]`"
                            :hasSuccess="passed"
                            style="width: 200px"
                            v-model="donorData.familyDetail[index - 1]"
                            placeholder="Family Preferences"
                          >
                            <el-option
                              class="select-default"
                              v-for="item in familyOptions"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value"
                            >
                            </el-option>
                          </el-select>
                        </ValidationProvider>
                      </div>
                    </div>
                  </div>
                  <div class="row">
                    <div class="col-12">
                      <ValidationProvider
                        name="additionalInformation"
                        v-slot="{ passed }"
                      >
                        <fg-input label="Additional Information">
                          <textarea
                            class="form-control"
                            placeholder="preference regarding age/gender of children."
                            rows="5"
                            :hasSuccess="passed"
                            name="additionalInformation"
                            v-model="donorData.additionalInformation"
                          ></textarea>
                        </fg-input>
                      </ValidationProvider>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12">
                      <checkbox name="marketing" v-model="donorData.marketing"
                        >Yes, I would like CAUSE to contact me</checkbox
                      >
                      <!--
                      <el-collapse class="marketing-info">
                        <el-collapse-item
                          title="What can i expect to recieve?"
                          name="1"
                        >
                          <div>
                            <ul class="pt-4">
                              <li>Registration opening updates</li>
                              <li>Events</li>
                              <li>Stories</li>
                            </ul>
                          </div>
                        </el-collapse-item>
                      </el-collapse>
                      -->
                    </div>
                  </div>
                </div>
                <div class="text-center mt-5">
                  <button
                    type="submit"
                    class="btn btn-fill btn-info btn-round btn-wd"
                  >
                    Register
                  </button>
                </div>
              </form>
            </ValidationObserver>
            <div v-else>
              <div class="row">
                <div class="col-12 col-md-12 text-center">
                  <p>
                    Thank you for registering.<br />
                    You will now recieve an email confirming your registration.
                    <br /><br />
                    You must confirm your donation before you can be assigned a
                    family.
                    <br /><br />
                    Why not share your pledge with others?
                  </p>
                  <p>
                    <ShareNetwork
                      network="facebook"
                      url="https://www.cause-foundation.org.uk/pledge"
                      title="I've just pledged to donate a hamper to a vulnerable family this christmas with CAUSE Foundation."
                      hashtags="charity,causechristmashampers"
                      class="px-2"
                    >
                      <button
                        class="btn btn-social btn-round btn-facebook btn-outline"
                      >
                        <i class="fa fa-facebook"></i>
                      </button>
                    </ShareNetwork>
                    <ShareNetwork
                      network="twitter"
                      url="https://www.cause-foundation.org.uk/pledge"
                      title="I've just pledged to donate a hamper to a vulnerable family this christmas with @CauseHampers."
                      hashtags="charity,causechristmashampers"
                      class="px-2"
                    >
                      <button
                        class="btn btn-social btn-round btn-twitter btn-outline"
                      >
                        <i class="fa fa-twitter"></i>
                      </button>
                    </ShareNetwork>
                    <ShareNetwork
                      network="whatsapp"
                      url="https://www.cause-foundation.org.uk/pledge"
                      title="I've just pledged to donate a hamper to a vulnerable family this christmas with CAUSE Foundation."
                      hashtags="charity,causechristmashampers"
                      class="px-2"
                    >
                      <button
                        class="btn btn-social btn-round btn-whatsapp btn-outline"
                      >
                        <i class="fa fa-whatsapp"></i>
                      </button>
                    </ShareNetwork>
                    <ShareNetwork
                      network="linkedin"
                      url="https://www.cause-foundation.org.uk/pledge"
                      title="I've just pledged to donate a hamper to a vulnerable family this christmas with CAUSE Foundation."
                      hashtags="charity,causechristmashampers"
                      class="px-2"
                    >
                      <button
                        class="btn btn-social btn-round btn-linkedin btn-outline"
                      >
                        <i class="fa fa-linkedin"></i>
                      </button>
                    </ShareNetwork>
                  </p>
                </div>
              </div>
            </div>
          </card>
        </fade-render-transition>
        <p v-else>&nbsp;</p>
      </div>
    </div>
  </standalone-layout>
</template>
<script>
import Vue from "vue";
import { FadeRenderTransition, Checkbox } from "src/components/index";
import { Collapse, CollapseItem, Select, Option } from "element-ui";
import StandaloneLayout from "../Dashboard/Pages/StandaloneLayout.vue";
import { donorRegister } from "@/api/donors.api";
import { extend } from "vee-validate";
import {
  required,
  email,
  min_value,
  max_value,
  confirmed,
} from "vee-validate/dist/rules";
import LAlert from "src/components/Alert";
import { Loading } from "element-ui";

Vue.use(Loading);

extend("confirmed", confirmed);
extend("email", email);
extend("required", required);
extend("min_value", min_value);
extend("max_value", max_value);

export default {
  components: {
    LAlert,
    FadeRenderTransition,
    Checkbox,
    StandaloneLayout,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    [Select.name]: Select,
    [Option.name]: Option,
  },
  data() {
    const donorData = {
      firstname: "",
      lastname: "",
      email: "",
      email_confirm: "",
      telephone: "",
      company: "",
      families: 1,
      familyDetail: [],
      additionalInformation: "",
      howHeard: "",
      howHeardOther: "",
      marketing: false,
    };
    return {
      isOpen: true,
      isLoading: true,
      maxFamilyDetail: 5,
      logo: "/static/img/cause-foundation-logo.png",
      logoAlt: "CAUSE Foundation Logo",
      donorData,
      submitSuccess: false,
      messages: [],
      familyOptions: [
        // { label: "No Preference", value: "any" },
        { label: "Single Person", value: "single" },
        { label: "Small Family - 2 - 3 family members", value: "small" },
        { label: "Medium Family - 4 - 5 family members", value: "medium" },
        { label: "Large Family - 6 - 7 family members", value: "large" },
        {
          label: "Extra Large Family - 8+ family members",
          value: "extralarge",
        },
      ],
      howHeardOptions: [
        { label: "Previously donated", value: "donor" },
        { label: "Previously received a hamper", value: "nominee" },
        { label: "Facebook", value: "facebook" },
        { label: "LinkedIn", value: "linkedin" },
        { label: "Instagram", value: "instagram" },
        { label: "Leaflet", value: "leaflet" },
        { label: "Poster", value: "poster" },
        { label: "TV", value: "tv" },
        { label: "Radio", value: "radio" },
        { label: "Word of Mouth", value: "word-of-mouth" },
        { label: "Other", value: "other" },
      ],
    };
  },
  methods: {
    updatedHowHeard() {
      if (this.donorData.howHeard === "other") {
        this.resizeIframe();
      }
    },
    populateDefaults() {
      if (
        this.donorData &&
        this.donorData.familyDetail &&
        this.donorData.families > 0 &&
        this.donorData.families <= this.maxFamilyDetail
      ) {
        while (
          this.donorData.familyDetail.length < parseInt(this.donorData.families)
        ) {
          this.donorData.familyDetail.push("Please Choose");
        }
      }
      if (this.donorData.families > this.maxFamilyDetail) {
        this.donorData.familyDetail = [];
      }
    },
    async handleRegisterSubmit() {
      try {
        /* */
        this.isLoading = true;
        const response = await donorRegister({
          ...this.donorData,
        });
        if (response.status == 400) {
          this.submitSuccess = false;
          if (response.data.messages) {
            this.messages = [];
            for (const [key, value] of Object.entries(response.data.messages)) {
              this.messages.push(value);
            }
          }
        } else {
          this.submitSuccess = true;
        }
        /* */
        this.isLoading = false;
      } catch (e) {
        if (e.message) {
          this.messages = [];
          this.messages.push(e.message);
        }
      }

      setTimeout(() => {
        this.resizeIframe();
      }, 500);
    },
    resizeIframe() {
      if (process.env.NODE_ENV === "production") {
        var body = document.body,
          html = document.documentElement;

        var height = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          html.clientHeight,
          html.scrollHeight,
          html.offsetHeight
        );

        parent.postMessage(
          { height: `${height + 200}px` },
          "https://www.cause-foundation.org.uk"
        );
      }
    },
  },
  mounted() {
    if (this?.$route?.query?.c) {
      this.isLoading = false;
    }
    this.isLoading = false;
    this.populateDefaults();
    if (process.env.NODE_ENV === "production") {
      setTimeout(() => {
        this.resizeIframe();
      }, 500);
    }
  },
};
</script>
<style lang="scss">
.loading-full {
  position: initial !important;
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
</style>
