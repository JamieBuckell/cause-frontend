<template>
  <div>
    <div
      class="alert alert-danger clearfix align-self-center"
      role="alert"
      v-if="donor && donor.emailVerification && donor.emailVerification.bounced"
    >
      This donors email has bounced:
      {{
        getBouncedReason(
          donor && donor.emailVerification.bouncedDetail
            ? donor.emailVerification.bouncedDetail
            : {}
        )
      }}
    </div>

    <div class="global-loading" v-if="isLoading">
      <div class="center">
        <div class="spinner-border text-muted" role="status">
          <span class="sr-only">Loading...</span>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12 col-lg-3">
        <card>
          <div slot="header">
            <h4 class="title">
              {{
                donor && donor.donorDetails && donor.donorDetails.firstName
                  ? donor.donorDetails.firstName
                  : ""
              }}
              {{
                donor && donor.donorDetails && donor.donorDetails.lastName
                  ? donor.donorDetails.lastName
                  : ""
              }}
            </h4>
          </div>
          <div class="row">
            <div class="col col-12" v-if="donor.GSI3PK">
              <label>Email</label><br />
              <p v-if="!editEmailAddress">
                {{ donor.GSI3PK }}
                <button
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
                      <l-alert
                        type="danger"
                        v-for="(m, idx) in messages"
                        :key="idx"
                      >
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
                    <div class="col-6">
                      <button
                        type="button"
                        @click="editEmailAddress = false"
                        class="btn btn-fill btn-secondary w-100"
                      >
                        Cancel
                      </button>
                    </div>
                    <div class="col-6">
                      <button type="submit" class="btn btn-fill btn-info w-100">
                        Save
                      </button>
                    </div>
                  </div>
                </form>
              </ValidationObserver>
            </div>
            <div
              class="col col-12"
              v-if="donor && donor.donorDetails && donor.donorDetails.telephone"
            >
              <label>Telephone</label><br />
              <p>{{ donor.donorDetails.telephone }}</p>
            </div>
            <div
              class="col col-12"
              v-if="donor && donor.donorDetails && donor.donorDetails.company"
            >
              <label>Company</label><br />
              <p>{{ donor.donorDetails.company }}</p>
            </div>
            <div class="col col-12" v-if="donor && donor.dateAdded">
              <label>Date Registered</label><br />
              <p>{{ donor.dateAdded }}</p>
            </div>
            <div class="col col-12">
              <label>Subscribed to mailing list</label><br />
              <p>{{ donor.subscribed ? "Yes" : "No" }}</p>
            </div>
            <div class="col col-12">
              <label>Email address verified</label><br />
              <p>{{ donor.emailVerification.verified ? "Yes" : "No" }}</p>
            </div>
          </div>
        </card>
      </div>
      <div class="col-12 col-lg-9">
        <div class="row">
          <div class="col col-12">
            <card>
              <div slot="header">
                <h4 class="title">Campaigns</h4>
              </div>
              <div>
                <div class="row">
                  <div
                    class="col-12"
                    v-for="(campaign, ci) in campaigns"
                    :key="ci"
                  >
                    <div class="row">
                      <div class="col-3">
                        <label>Campaign</label>
                      </div>
                      <div class="col-1">
                        <label>Families</label>
                      </div>
                      <div class="col-4">
                        <label
                          v-if="campaign.numberOfFamilies <= maxFamilyDetail"
                          >Family Dynamics</label
                        >
                      </div>
                      <div class="col-3">
                        <label>Allocation</label>
                      </div>
                      <div class="col-1">&nbsp;</div>
                    </div>
                    <div class="row">
                      <div class="col-3">
                        <p>{{ activeCampaign.name }}</p>
                      </div>
                      <div class="col-1">
                        <p>{{ campaign.numberOfFamilies }}</p>
                      </div>

                      <div class="col-4">
                        <div
                          class="row"
                          v-if="campaign.numberOfFamilies <= maxFamilyDetail"
                        >
                          <div
                            class="col-12"
                            v-for="(f, i) in getFamilyRequests(
                              campaign.familyDetail
                            )"
                            :key="i"
                          >
                            <p class="mb-0">{{ f }}</p>
                          </div>
                        </div>
                      </div>
                      <div class="col-3">
                        {{ formatStatus(campaign) }}<br />
                        <button
                          v-if="isAllocated(campaign)"
                          @click.prevent="doConfirmAllocation(donor, campaign)"
                          class="btn btn-fill btn-secondary"
                        >
                          Manually Confirm
                        </button>
                      </div>
                      <div class="col-1">
                        <button
                          @click.prevent="doEditPledge(campaign, ci)"
                          class="btn btn-fill btn-info pull-right"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-12" v-if="campaign.additionalInfo">
                        <label>Additional Information</label>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-12" v-if="campaign.additionalInfo">
                        <p>{{ campaign.additionalInfo }}</p>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-12" v-if="canAllocate(campaign)">
                        <button
                          @click.prevent="
                            allocateFamily = true;
                            activeCampaignId = campaign.requestId;
                          "
                          class="btn btn-fill btn-info w-100"
                        >
                          Allocate Families
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="row" v-if="allocationMet(campaigns)">
                  <div class="col-12">
                    <button
                      @click.prevent="
                        activeCampaignId = campaign.requestId;
                        sendAllocationEmail();
                      "
                      class="btn btn-fill btn-info w-100"
                    >
                      Send Allocation Email
                    </button>
                  </div>

                  <div class="col-6">
                    <drop-down class="btn-group w-100 download-dropdown">
                      <button
                        slot="title"
                        href="#"
                        type="button"
                        class="btn btn-fill btn-secondary w-100 dropdown-toggle"
                        data-toggle="dropdown"
                      >
                        Download Labels
                        <span class="caret"></span>
                      </button>
                      <li class="pb-1 pt-2 px-3">
                        <a href="#" @click.prevent="downloadPDF('full')"
                          >Full PDF</a
                        >
                      </li>
                      <li class="pt-1 pb-2 px-3">
                        <a href="#" @click.prevent="downloadPDF('basic')"
                          >Basic PDF</a
                        >
                      </li>
                    </drop-down>
                  </div>
                </div>

                <el-dialog center :visible.sync="editPledge" z-index="1050">
                  <ValidationObserver v-slot="{ handleSubmit }">
                    <form @submit.prevent="handleSubmit(savePledge)">
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
                              v-model="editPledgeData.numberOfFamilies"
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

                      <div
                        v-if="
                          editPledgeData.numberOfFamilies <= maxFamilyDetail
                        "
                      >
                        <div
                          class="row"
                          v-for="(fi, idx) in parseInt(
                            editPledgeData.numberOfFamilies
                              ? editPledgeData.numberOfFamilies
                              : 0
                          )"
                          :key="idx"
                        >
                          <div class="col-12 col-md-3">
                            <label :for="`familyDetail[${fi - 1}]`"
                              >Family Preferences:</label
                            >
                          </div>
                          <div class="col-12 col-md-9">
                            <ValidationProvider
                              :name="`familyDetail[${fi - 1}]`"
                              v-slot="{ passed }"
                            >
                              <el-select
                                class="select-default mb-3 w-100"
                                :name="`familyDetail[${fi - 1}]`"
                                :hasSuccess="passed"
                                style="width: 200px"
                                v-model="editPledgeData.familyDetail[fi - 1]"
                                placeholder="Family Preferences"
                              >
                                <el-option
                                  class="select-default"
                                  v-for="(item, i) in familyOptions"
                                  :key="i"
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
                                placeholder="preference regarding age/gender of children or if you would be happy to provide more than one hamper or if you would be happy to provide food voucher/provide cash donation."
                                rows="5"
                                :hasSuccess="passed"
                                name="additionalInformation"
                                v-model="editPledgeData.additionalInfo"
                              ></textarea>
                            </fg-input>
                          </ValidationProvider>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-6">
                          <button
                            type="button"
                            @click="editPledge = false"
                            class="btn btn-fill btn-secondary w-100"
                          >
                            Cancel
                          </button>
                        </div>
                        <div class="col-6">
                          <button
                            type="submit"
                            class="btn btn-fill btn-info w-100"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                      <div class="row">
                        <div class="col-12">
                          <button
                            type="button"
                            @click="savePledge(true)"
                            class="btn btn-fill btn-danger w-100"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </form>
                  </ValidationObserver>
                </el-dialog>
              </div>
            </card>
          </div>
        </div>

        <el-dialog
          center
          :visible.sync="allocateFamily"
          width="80%"
          z-index="1050"
        >
          <div class="global-loading" v-if="allocationLoading">
            <div class="center">
              <div class="spinner-border text-muted" role="status">
                <span class="sr-only">Loading...</span>
              </div>
            </div>
          </div>
          <FamiliesList
            heading="Families"
            :subHeading="grabAdditionalInfo"
            :options="familyListOptions"
            :customActions="customActions"
            @allocateFamily="doAllocateFamily"
            listKey="Allocate"
          />
        </el-dialog>

        <div class="row">
          <div class="col col-12">
            <FamiliesList
              heading="Assigned Families"
              :options="assignedFamilyListOptions"
              :customActions="customActionsAllocated"
              @unallocateFamily="doUnallocateFamily"
              :data="assignedFamilies"
              listKey="Assigned"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import {
  getHash,
  downloadFile,
  donorEmailUpdate,
  donorPledgeUpdate,
  confirmPledgeManual,
} from "@/api/donors.api";
import {
  allocateFamily,
  unallocateFamily,
  emailFamilyAssignment,
} from "@/api/families.api";
import FamiliesList from "@/pages/Families/List.vue";
import Swal from "sweetalert2";
import { MessageBox } from "element-ui";
import LAlert from "src/components/Alert";
import DropDown from "src/components/Dropdown.vue";
import { Dialog, Select, Option } from "element-ui";
import { extend } from "vee-validate";
import { required, min_value, max_value } from "vee-validate/dist/rules";

extend("required", required);
extend("min_value", min_value);
extend("max_value", max_value);

Vue.prototype.$confirm = MessageBox.confirm;
export default {
  components: {
    LAlert,
    DropDown,
    [Dialog.name]: Dialog,
    [Select.name]: Select,
    [Option.name]: Option,
    FamiliesList,
  },
  data() {
    return {
      isLoading: false,
      allocationLoading: false,
      activeCampaign: {},
      downloadPending: false,
      familyListOptions: {
        create: false,
        update: true,
        delete: false,
        download: false,
        showDonor: false,
      },
      assignedFamilyListOptions: {
        create: false,
        update: false,
        delete: false,
        download: true,
      },
      assignedFamilies: [],
      baseUrl: this.$hostname,
      campaigns: [],
      campaign: {},
      activeCampaignId: "",
      allocateFamily: false,
      editEmailAddress: false,
      editPledge: false,
      editPledgeData: {},
      messages: [],
      updatedEmail: "",
      maxFamilyDetail: 4,
      customActions: [
        {
          emit: "allocateFamily",
          type: "button",
          text: "Allocate",
          condition: "notAllocated",
          removeRow: true,
        },
      ],
      customActionsAllocated: [
        {
          emit: "unallocateFamily",
          type: "button",
          text: "Unallocate",
          removeRow: true,
        },
      ],
      familyOptions: [
        { label: "No Preference", value: "any" },
        { label: "Single Person", value: "single" },
        { label: "Small Family - 2 - 3 family members", value: "small" },
        { label: "Medium Family - 4 - 5 family members", value: "medium" },
        { label: "Large Family - 6 - 7 family members", value: "large" },
        {
          label: "Extra Large Family - 8+ family members",
          value: "extralarge",
        },
      ],
      donor: {
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
    grabAdditionalInfo() {
      const allNotes = this.campaigns.reduce((string, campaign) => {
        return `${string} ${campaign.additionalInfo}${
          string.length ? "<br />" : ""
        }`;
      }, "");
      return `<strong>Donor Notes</strong>: ${allNotes}`;
    },
    platformData() {
      return this.$store.getters.getPlatformData;
    },
    platformFamilies() {
      return this.$store.getters.getPlatformFamilies;
    },
  },
  methods: {
    isAllocated(campaign) {
      const status = this.formatStatus(campaign);
      return (
        status.indexOf(" Allocated") >= 0 && status.indexOf("- Confirmed") < 0
      );
    },
    formatStatus(campaign) {
      const filterCheck = (type) => {
        return (family) => {
          if (family?.campaignRequestId) {
            if (family.campaignRequestId !== campaign.requestId) {
              return false;
            }
          }

          switch (family.status) {
            case "allocated-sent":
            case "allocated-unconfirmed":
              return type === "allocated" ? true : false;
            case "allocated-confirmed":
              return type === "allocated-confirmed" || type === "allocated"
                ? true
                : false;
            case "unallocated":
            default:
              return type === "unallocated" ? true : false;
          }
        };
      };

      const statusCheck = (hamperStatus, type) => {
        switch (hamperStatus) {
          case "allocated-sent":
          case "allocated-unconfirmed":
            return type === "allocated" ? true : false;
          case "allocated-confirmed":
            return type === "allocated-confirmed" || type === "allocated"
              ? true
              : false;
          case "unallocated":
          default:
            return type === "unallocated" ? true : false;
        }
      };

      const allocations = campaign?.numberOfFamilies; // this.assignedFamilies.length
      const c = campaign.allocation
        ? campaign.allocation.filter((hamper) =>
            this.platformFamilies.find(
              (f) =>
                f.GSI2SK === `SK#${hamper.hamperId}` &&
                statusCheck(f.status, "allocated-confirmed")
            )
          ).length
        : 0;

      const a = campaign.allocation ? campaign.allocation.length : 0;

      const allocation =
        a === allocations
          ? "Fully Allocated"
          : a > 0
          ? "Part Allocated"
          : "Unallocated";
      const confirmation =
        c === allocations
          ? "Confirmed"
          : c > 0
          ? "Part Confirmed"
          : "Unconfirmed";

      return `${allocation}${
        allocation === "Unallocated" ? "" : " - " + confirmation
      }`;
    },
    async doConfirmAllocation(donor, hamperId) {
      /* */
      const verification = await confirmPledgeManual(
        donor.GSI3PK,
        "v",
        this.$store.getters.getActiveCampaign
      );
      const verifyResponse = {
        title: "Error",
        message: "",
      };
      if (verification.status == 200) {
        const requestIndex = this.donor?.familyDetails?.request.findIndex(
          (r) => r.requestId === hamperId.requestId
        );
        if (this.donor?.familyDetails?.request[requestIndex]?.allocation) {
          const pFamilyData = this.platformFamilies;
          for (const [i, a] of this.donor?.familyDetails?.request[
            requestIndex
          ]?.allocation.entries()) {
            const pFamilyIndex = pFamilyData.findIndex(
              (pf) => pf.allocatedTo === this.donor.GSI2PK
            );

            if (pFamilyData[pFamilyIndex]) {
              pFamilyData[pFamilyIndex].status = "allocated-confirmed";
            }
          }
          await this.$store.dispatch("setPlatformFamilyData", [...pFamilyData]);
        }
      }
      if (verification?.data?.messages?.success) {
        verifyResponse.title = "Success";
        verifyResponse.message =
          "This donors pledged has been confirmed successfully.";
      } else if (verification?.data?.messages?.unexpected) {
        verifyResponse.message = verification?.data?.messages?.unexpected;
      } else if (verification?.data?.messages?.error) {
        verifyResponse.message = verification?.data?.messages?.error;
      }

      Swal.fire({
        title: verifyResponse.title,
        html: verifyResponse.message,
        timer: 2000,
        showConfirmButton: false,
      });
      /* */
    },
    async downloadPDF(type) {
      Swal.fire({
        title: "Generating PDF",
        text: "Please wait while your PDF is generated.",
        showConfirmButton: false,
        allowEscapeKey: false,
        backdrop: false,
      });

      const allocateRes = await downloadFile({
        campaign: this.$store.getters.getActiveCampaign,
        donorId: this.donor.GSI2PK,
        type: "pdf",
        version: type,
      });
      Swal.close();
      if (allocateRes.status == 200) {
        const linkSource = `data:application/pdf;base64,${allocateRes.data}`;
        const downloadLink = document.createElement("a");
        const fileName = `${this.donor.donorDetails.firstName.toLowerCase()}-${this.donor.donorDetails.lastName.toLowerCase()}-labels-${type.toLowerCase()}-pdf`;

        downloadLink.href = linkSource;
        downloadLink.download = fileName;
        downloadLink.click();
        this.downloadPending = false;
      } else {
        if (allocateRes?.data?.messages) {
          Swal.fire({
            title: "Error",
            text: Object.keys(allocateRes?.data?.messages)
              .map((k) => allocateRes?.data?.messages[k])
              .join(),
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }

      Swal.close();
    },
    async doAllocateFamily(i, f) {
      this.allocationLoading = true;
      const allocateRes = await allocateFamily({
        campaignId: this.$store.getters.getActiveCampaign,
        requestId: this.activeCampaignId,
        hamperId: f.reference,
        donorId: this.donor.GSI2PK,
      });
      if (allocateRes.status == 200) {
        const requestIndex = this.donor?.familyDetails?.request.findIndex(
          (r) => r.requestId === this.activeCampaignId
        );
        if (!this.donor?.familyDetails?.request[requestIndex]?.allocation) {
          this.donor.familyDetails.request[requestIndex].allocation = [];
        }

        const pFamilyData = this.platformFamilies;
        const pFamilyIndex = pFamilyData.findIndex(
          (pf) => pf.GSI2SK === `SK#${f.reference}`
        );
        if (pFamilyData[pFamilyIndex]) {
          pFamilyData[pFamilyIndex].allocatedTo = this.donor.GSI2PK;
          pFamilyData[pFamilyIndex].status = "allocated-unconfirmed";

          await this.$store.dispatch("setPlatformFamilyData", [...pFamilyData]);
        }

        const allocatedFamily = pFamilyData[pFamilyIndex];
        this.donor?.familyDetails?.request[requestIndex]?.allocation.push({
          hamperId: f.reference,
          members: allocatedFamily?.members,
        });

        this.campaigns = this.donor?.familyDetails?.request ?? [];
        this.assignedFamilies.push(allocatedFamily);

        const numberOfFamilies = this.donor?.familyDetails?.request
          ? this.donor.familyDetails.request.reduce(
              (a, b) => a + b.numberOfFamilies,
              0
            )
          : 0;

        const allocationComplete =
          this.assignedFamilies.length === numberOfFamilies;

        this.allocationLoading = false;

        Swal.fire({
          title: "Success",
          text: `Family allocated.${
            allocationComplete
              ? " This donor is now ready for their allocation email"
              : ""
          }`,
          timer: 2000,
          showConfirmButton: false,
        });
        if (allocationComplete) {
          this.allocateFamily = false;
        }
      } else {
        this.allocationLoading = false;
        if (allocateRes?.data?.messages) {
          Swal.fire({
            title: "Error",
            text: Object.keys(allocateRes?.data?.messages)
              .map((k) => allocateRes?.data?.messages[k])
              .join(),
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }
    },
    async doUnallocateFamily(i, f) {
      if (f.reference) {
        this.isLoading = true;

        const allocation = this.donor?.familyDetails?.request
          ? this.donor.familyDetails.request.find((r) =>
              r?.allocation
                ? r.allocation.find((a) => f?.reference === a?.hamperId)
                    ?.hamperId
                : false
            )
          : {};

        const unallocateRes = await unallocateFamily({
          campaignId: this.$store.getters.getActiveCampaign,
          requestId: allocation?.requestId ?? null,
          hamperId: f.reference,
          donorId: this.donor.GSI2PK,
        });
        if (unallocateRes.status == 200) {
          const requestIndex = this.donor?.familyDetails?.request.findIndex(
            (r) => r.requestId === (allocation?.requestId ?? null)
          );
          const allocationIndex = this.donor?.familyDetails?.request[
            requestIndex
          ]?.allocation.findIndex((a) => a.hamperId === f.reference);

          this.donor?.familyDetails?.request[requestIndex]?.allocation.splice(
            allocationIndex,
            1
          );

          const assignedIndex = this.assignedFamilies.findIndex(
            (pf) => pf.GSI2SK === `SK#${f.reference}`
          );
          this.assignedFamilies.splice(assignedIndex, 1);

          const allocationComplete =
            this.assignedFamilies.length === this.campaign?.numberOfFamilies;

          const pFamilyData = this.platformFamilies;
          const pFamilyIndex = pFamilyData.findIndex(
            (pf) => pf.GSI2SK === `SK#${f.reference}`
          );
          if (pFamilyData[pFamilyIndex]) {
            pFamilyData[pFamilyIndex].allocatedTo = "unallocated";
            pFamilyData[pFamilyIndex].status = "unallocated";

            await this.$store.dispatch("setPlatformFamilyData", [
              ...pFamilyData,
            ]);
          }

          this.isLoading = false;
          Swal.fire({
            title: "Success",
            text: "Family unallocated.",
            timer: 2000,
            showConfirmButton: false,
          });
          this.allocateFamily = allocationComplete;
        } else {
          this.isLoading = false;
          if (unallocateRes?.data?.messages) {
            Swal.fire({
              title: "Error",
              text: Object.keys(unallocateRes?.data?.messages)
                .map((k) => unallocateRes?.data?.messages[k])
                .join(),
              timer: 2000,
              showConfirmButton: false,
            });
          }
        }
      } else {
        this.messages = [{ error: "Error with family data" }];
      }
    },
    async sendAllocationEmail(i, f) {
      await Swal.fire({
        title: "Are you sure?",
        text: `If you send this allocation, the process cannot be undone.`,
        confirmButtonClass: "btn btn-success btn-fill",
        cancelButtonClass: "btn btn-danger btn-fill",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        buttonsStyling: false,
      }).then(async (d) => {
        if (d?.isConfirmed && !d?.isDismissed) {
          const updateRes = await emailFamilyAssignment({
            donorId: this.donor.GSI2PK,
            campaignId: this.$store.getters.getActiveCampaign,
          });
          if (updateRes?.status != 200 && updateRes?.data?.messages) {
            this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
              error: updateRes?.data?.messages[k],
            }));
          } else {
            Swal.fire({
              title: "Success",
              text: "Email sent successfully.",
              timer: 2000,
              showConfirmButton: false,
            });
          }
        }
      });
    },

    canAllocate(c) {
      return (
        //this.isJamie() ||
        !c?.allocation || c.allocation.length < c.numberOfFamilies
      );
    },
    allocationMet(c) {
      let allocationMet = c.length > 0;
      for (const [i, a] of c.entries()) {
        if (!allocationMet) {
          break;
        }
        allocationMet =
          a?.allocation && a.allocation.length >= a.numberOfFamilies;
      }
      return allocationMet;
    },
    populateDefaults() {
      if (
        this.editPledgeData &&
        this.editPledgeData.familyDetail &&
        this.editPledgeData.numberOfFamilies > 0 &&
        this.editPledgeData.numberOfFamilies <= this.maxFamilyDetail
      ) {
        while (
          this.editPledgeData.familyDetail.length <
          parseInt(this.editPledgeData.numberOfFamilies)
        ) {
          this.editPledgeData.familyDetail.push("any");
        }
      }
      if (this.editPledgeData.numberOfFamilies > this.maxFamilyDetail) {
        this.editPledgeData.familyDetail = [];
      }
    },
    async saveEmail() {
      if (this.updatedEmail != this.donor.GSI3PK) {
        await Swal.fire({
          title: "Do you want to resend the verification email?",
          text: `As you have updated this users email, you should also ask them to verify it unless you're confident the email is correct.`,
          showCancelButton: true,
          confirmButtonText: "Yes, resend it!",
          cancelButtonText: "No, just save",
          buttonsStyling: false,
        }).then(async (d) => {
          const sendEmail = d.isConfirmed || d.dismiss === "esc";
          if (!d.isDismissed || d.dismiss === "cancel") {
            const updateRes = await donorEmailUpdate({
              campaign: this.$store.getters.getActiveCampaign,
              donorId: this.donor.GSI2PK,
              previousEmail: this.donor.GSI3PK,
              updatedEmail: this.updatedEmail,
              sendEmail,
            });
            if (updateRes.data?.messages) {
              this.messages = Object.keys(updateRes?.data?.messages).map(
                (k) => ({
                  error: updateRes?.data?.messages[k],
                })
              );
            }
            if (updateRes.status == 200) {
              const pData = this.$store.getters.getPlatformData;

              const i = pData.donors.findIndex(
                (d) => d.GSI3PK === this.donor.GSI3PK
              );
              const donorUpdates = { ...pData.donors[i] };

              if (donorUpdates.PK) {
                donorUpdates.GSI3PK = this.updatedEmail;
                donorUpdates.GSI2SK = `EMAIL#${this.updatedEmail}`;

                if (sendEmail) {
                  donorUpdates.emailVerification.dateVerified = "";
                  donorUpdates.emailVerification.verified = false;
                }
                this.donor = donorUpdates;

                pData.donors[i] = donorUpdates;

                await this.$store.dispatch("setPlatformData", {
                  ...pData,
                });
              }
            }
          }
        });
      }
      if (!this.messages.length) {
        this.editEmailAddress = false;
      }
    },
    async savePledge(delteItem = false) {
      await Swal.fire({
        title: "Do you want to send a pledge updated email?",
        text: `As you have updated this users pledge details, you should send a confirmation of the updated details to the donor.`,
        type: "warning",
        showCancelButton: true,
        showDenyButton: true,
        confirmButtonClass: "btn btn-success btn-fill",
        denyButtonClass: "btn btn-danger btn-fill",
        cancelButtonClass: "btn btn-secondary btn-fill",
        confirmButtonText: "Yes, send it!",
        denyButtonText: "No, just save",
        cancelButtonText: "Cancel",
        buttonsStyling: false,
      }).then(async (d) => {
        const sendEmail = d.isConfirmed;
        if (d.isConfirmed || d.isDenied) {
          const ci = this.editPledgeData?.campaignIndex ?? false;
          if (ci >= 0) {
            if (
              this.editPledgeData.familyDetail.length >
              this.editPledgeData.numberOfFamilies
            ) {
              this.editPledgeData.familyDetail =
                this.editPledgeData.familyDetail.slice(
                  0,
                  this.editPledgeData.numberOfFamilies
                );
            }

            this.campaigns[ci] = this.editPledgeData;
            if (delteItem) {
              this.campaigns.splice(ci, 1);
            }

            const updateRes = await donorPledgeUpdate({
              campaignData: JSON.stringify(this.campaigns),
              donorId: this.donor.GSI2PK,
              sendEmail,
              campaignId: this.$store.getters.getActiveCampaign,
            });

            if (updateRes?.data?.messages) {
              this.messages = Object.keys(updateRes?.data?.messages).map(
                (k) => ({
                  error: updateRes?.data?.messages[k],
                })
              );
            }
            if (updateRes.status == 200) {
              const pData = this.$store.getters.getPlatformData;

              const i = pData.donors.findIndex(
                (d) => d.GSI3PK === this.donor.GSI3PK
              );
              const donorUpdates = { ...pData.donors[i] };

              if (donorUpdates.PK) {
                donorUpdates.familyDetails.request = this.campaigns;

                pData.donors[i] = donorUpdates;

                await this.$store.dispatch("setPlatformData", {
                  ...pData,
                });
              }
            }
          }
        }
      });
      if (!this.messages.length) {
        this.editPledge = false;
      }
    },
    doEditPledge(c, ci) {
      this.editPledge = true;
      this.editPledgeData = { ...c };
      this.editPledgeData.familyDetail =
        typeof c.familyDetail === "string"
          ? JSON.parse(c.familyDetail)
          : c.familyDetail;
      this.editPledgeData.campaignIndex = ci;
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
    getBouncedReason(bouncedData) {
      const obj = JSON.parse(bouncedData);
      return obj?.detail;
    },
    getFamilyRequests(req) {
      const preferences = typeof req === "string" ? JSON.parse(req) : req;
      const returnArray = [];
      if (preferences.length) {
        for (const p of preferences) {
          switch (p.toLowerCase()) {
            case "single":
              returnArray.push("Single Person");
              break;
            case "small":
              returnArray.push("Small Family - 2 - 3 family members");
              break;
            case "medium":
              returnArray.push("Medium Family - 4 - 5 family members");
              break;
            case "large":
              returnArray.push("Large Family - 6 - 7 family members");
              break;
            case "extralarge":
              returnArray.push("Extra Large Family - 8+ family members");
              break;

            default:
              returnArray.push("No Preference");
              break;
          }
        }
      }

      return returnArray;
    },
    async getDonorData() {
      var pData = this.$store.getters.getPlatformData;
      if (pData?.donors) {
        this.donor = pData.donors.find(
          (d) =>
            d.GSI2PK === this.$route.params.donorId &&
            d.PK === this.$store.getters.getActiveCampaign
        );
        if (!this.donor) {
          this.$router.push("/donors");
        }

        if (pData?.subscribers) {
          const subscriber = pData.subscribers.find((s) => s.PK === this.donor?.GSI3PK);
          console.log(subscriber);
          this.donor.subscribed = subscriber?.subscribed;
        }
        
        this.updatedEmail = this.donor?.GSI3PK;

        this.activeCampaign = this.$store.getters.getAllCampaigns.find(
          (c) => c.campaignId === this.$store.getters.getActiveCampaign
        );
        this.campaigns = this.donor?.familyDetails?.request ?? [];

        this.assignedFamilies = this.platformFamilies.filter((f) =>
          this.donor?.familyDetails?.request
            ? this.donor.familyDetails.request.filter((r) =>
                r?.allocation
                  ? r.allocation.filter((a) => f.GSI2SK === `SK#${a?.hamperId}`)
                      .length
                  : false
              ).length
            : false
        );
      }
    },
  },
  async mounted() {
    if (!this.userInGroup("admin")) {
      this.$router.push("/");
    }
    await this.getDonorData();
  },
  watch: {
    async platformData() {
      await this.getDonorData();
    },
    async platformFamilies() {
      await this.getDonorData();
    },
  },
};
</script>

<style lang="scss" scoped>
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
<style lang="scss">
.download-dropdown {
  .nav-link {
    width: 100%;
    padding: 0;
    margin: 0;
  }
  .dropdown-menu {
    width: 100%;
  }
}
</style>
