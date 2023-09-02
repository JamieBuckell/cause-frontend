<template>
  <div>
    <div
      class="alert alert-danger clearfix align-self-center"
      role="alert"
      v-if="donor.bounced"
    >
      This donors email has bounced: {{ getBouncedReason(donor.bouncedDetail) }}
    </div>
    <div class="row">
      <div class="col-12 col-lg-3">
        <card>
          <div slot="header">
            <h4 class="title">{{ donor.firstName }} {{ donor.lastName }}</h4>
          </div>
          <div class="row">
            <div class="col col-12" v-if="donor.email">
              <label>Email</label><br />
              <p v-if="!editEmailAddress">
                {{ donor.email }}
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
            <div class="col col-12" v-if="donor.telephone">
              <label>Telephone</label><br />
              <p>{{ donor.telephone }}</p>
            </div>
            <div class="col col-12" v-if="donor.company">
              <label>Company</label><br />
              <p>{{ donor.company }}</p>
            </div>
            <div class="col col-12" v-if="donor.dateAdded">
              <label>Date Registered</label><br />
              <p>{{ donor.dateAdded }}</p>
            </div>
            <div class="col col-12">
              <label>Subscribed to mailing list</label><br />
              <p>{{ donor.subscribed ? 'Yes' : 'No' }}</p>
            </div>
            <div class="col col-12">
              <label>Email address verified</label><br />
              <p>{{ donor.verified ? 'Yes' : 'No' }}</p>
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
                        <p>{{ campaign.campaignName }}</p>
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
                          @click.prevent="doConfirmAllocation(donor)"
                          class="btn btn-fill btn-secondary"
                        >
                          Manually Confirm
                        </button>
                      </div>
                      <div class="col-1">
                        <button
                          @click.prevent="doEditPledge(campaign)"
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
                            allocateFamily = true
                            activeCampaignId = campaign.requestId
                          "
                          class="btn btn-fill btn-info w-100"
                        >
                          Allocate Families
                        </button>
                      </div>
                      <div class="col-12" v-if="allocationMet(campaign)">
                        <button
                          @click.prevent="
                            activeCampaignId = campaign.requestId
                            sendAllocationEmail()
                          "
                          class="btn btn-fill btn-info w-100"
                        >
                          Send Allocation Email
                        </button>
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-6" v-if="allocationMet(campaign)">
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
                      <!--
                      <div class="col-6" v-if="allocationMet(campaign)">
                        <button
                          @click.prevent="downloadCSV('full')"
                          class="btn btn-fill btn-secondary w-100"
                        >
                          Download CSV
                        </button>
                      </div>
                      -->
                    </div>
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
                          v-for="fi in parseInt(
                            editPledgeData.numberOfFamilies
                              ? editPledgeData.numberOfFamilies
                              : 0
                          )"
                          :key="fi"
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
import Vue from 'vue'
import {
  downloadFile,
  getDonorById,
  donorEmailUpdate,
  donorPledgeUpdate,
  confirmPledgeManual,
} from '@/api/donors.api'
import {
  allocateFamily,
  unallocateFamily,
  emailFamilyAssignment,
} from '@/api/families.api'
import FamiliesList from '@/pages/Families/List.vue'
import Swal from 'sweetalert2'
import { MessageBox } from 'element-ui'
import LAlert from 'src/components/Alert'
import DropDown from 'src/components/Dropdown.vue'
import { Dialog, Select, Option } from 'element-ui'
import { extend } from 'vee-validate'
import { required, min_value, max_value } from 'vee-validate/dist/rules'

extend('required', required)
extend('min_value', min_value)
extend('max_value', max_value)

Vue.prototype.$confirm = MessageBox.confirm
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
      activeCampaignId: '',
      allocateFamily: false,
      editEmailAddress: false,
      editPledge: false,
      editPledgeData: {},
      messages: [],
      updatedEmail: '',
      maxFamilyDetail: 4,
      customActions: [
        {
          emit: 'allocateFamily',
          type: 'button',
          text: 'Allocate',
          condition: 'notAllocated',
          removeRow: true,
        },
      ],
      customActionsAllocated: [
        {
          emit: 'unallocateFamily',
          type: 'button',
          text: 'Unallocate',
          removeRow: true,
        },
      ],
      familyOptions: [
        { label: 'No Preference', value: 'any' },
        { label: 'Single Person', value: 'single' },
        { label: 'Small Family - Maximum 3 family members', value: 'small' },
        { label: 'Medium Family - Maximum 5 family members', value: 'medium' },
        { label: 'Large Family - 6+ family members', value: 'large' },
      ],
      donor: {
        requestId: '',
        firstName: '',
        lastName: '',
        email: '',
        telephone: '',
        company: '',
        dateAdded: '',
        dateSubcribed: '',
        dateUnsubcribed: '',
        dateVerified: '',
        dateBounced: '',
        subscribed: false,
        verified: false,
        bounced: false,
      },
    }
  },
  computed: {
    grabAdditionalInfo() {
      const allNotes = this.campaigns.reduce((string, campaign) => {
        return `${string} ${campaign.additionalInfo}${
          string.length ? '<br />' : ''
        }`
      }, '')
      return `<strong>Donor Notes</strong>: ${allNotes}`
    },
  },
  methods: {
    isAllocated(campaign) {
      const status = this.formatStatus(campaign)
      return (
        status.indexOf(' Allocated') >= 0 && status.indexOf('- Confirmed') < 0
      )
    },
    formatStatus(campaign) {
      const filterCheck = (type) => {
        return (family) => {
          if (family?.campaignRequestId) {
            if (family.campaignRequestId !== campaign.requestId) {
              return false
            }
          }

          switch (family.status) {
            case 'allocated-sent':
            case 'allocated-unconfirmed':
              return type === 'allocated' ? true : false
            case 'allocated-confirmed':
              return type === 'allocated-confirmed' || type === 'allocated'
                ? true
                : false
            case 'unallocated':
            default:
              return type === 'unallocated' ? true : false
          }
        }
      }

      const allocations = campaign?.numberOfFamilies // this.assignedFamilies.length
      const c = this.assignedFamilies.filter(
        filterCheck('allocated-confirmed')
      ).length
      const a = this.assignedFamilies.filter(filterCheck('allocated')).length

      const allocation =
        a === allocations
          ? 'Fully Allocated'
          : a > 0
          ? 'Part Allocated'
          : 'Unallocated'
      const confirmation =
        c === allocations
          ? 'Confirmed'
          : c > 0
          ? 'Part Confirmed'
          : 'Unconfirmed'

      return `${allocation}${
        allocation === 'Unallocated' ? '' : ' - ' + confirmation
      }`
    },
    async doConfirmAllocation(donor) {
      const verification = await confirmPledgeManual(donor.email, 'v')

      const verifyResponse = {
        title: 'Error',
        message: '',
      }
      if (verification?.data?.messages?.success) {
        verifyResponse.title = 'Success'
        verifyResponse.message =
          'This donors pledged has been confirmed successfully.'
      } else if (verification?.data?.messages?.unexpected) {
        verifyResponse.message = verification?.data?.messages?.unexpected
      } else if (verification?.data?.messages?.error) {
        verifyResponse.message = verification?.data?.messages?.error
      }

      Swal.fire({
        title: verifyResponse.title,
        html: verifyResponse.message,
        timer: 2000,
        showConfirmButton: false,
      })
    },
    async downloadPDF(type) {
      Swal.fire({
        title: 'Generating PDF',
        text: 'Please wait while your PDF is generated.',
        showConfirmButton: false,
        allowEscapeKey: false,
        backdrop: false,
      })

      const allocateRes = await downloadFile({
        donorId: this.donor.requestId,
        type: 'pdf',
        version: type,
      })
      if (allocateRes.status == 200) {
        const linkSource = `data:application/pdf;base64,${allocateRes.data}`
        const downloadLink = document.createElement('a')
        const fileName = `${this.donor.firstName.toLowerCase()}-${this.donor.lastName.toLowerCase()}-labels-${type.toLowerCase()}-pdf`

        downloadLink.href = linkSource
        downloadLink.download = fileName
        downloadLink.click()
        this.downloadPending = false
      } else {
        if (allocateRes?.data?.messages) {
          Swal.fire({
            title: 'Error',
            text: Object.keys(allocateRes?.data?.messages)
              .map((k) => allocateRes?.data?.messages[k])
              .join(),
            timer: 2000,
            showConfirmButton: false,
          })
        }
      }

      Swal.close()
    },
    async doAllocateFamily(i, f) {
      const allocateRes = await allocateFamily({
        campaignRequestId: this.activeCampaignId,
        familyId: f.requestId,
        donorId: this.donor.requestId,
      })
      if (allocateRes.status == 200) {
        const assignedFamilies = this.assignedFamilies.filter(
          (f) =>
            !f?.campaignRequestId ||
            f.campaignRequestId === this.campaign.requestId
        )

        const allocationComplete =
          assignedFamilies.length === this.campaign?.numberOfFamilies
        this.assignedFamilies.push(f)
        Swal.fire({
          title: 'Success',
          text: `Family allocated.${
            allocationComplete
              ? ' This donor is now ready for their allocation email'
              : ''
          }`,
          timer: 2000,
          showConfirmButton: false,
        })
        if (allocationComplete) {
          this.allocateFamily = false
        }
      } else {
        if (allocateRes?.data?.messages) {
          Swal.fire({
            title: 'Error',
            text: Object.keys(allocateRes?.data?.messages)
              .map((k) => allocateRes?.data?.messages[k])
              .join(),
            timer: 2000,
            showConfirmButton: false,
          })
        }
      }
    },
    async doUnallocateFamily(i, f) {
      await unallocateFamily({
        familyId: f.requestId,
        donorId: this.donor.requestId,
      })
      Swal.fire({
        title: 'Success',
        text: 'Family unallocated.',
        timer: 2000,
        showConfirmButton: false,
      })
    },
    async sendAllocationEmail(i, f) {
      await Swal.fire({
        title: 'Are you sure?',
        text: `If you send this allocation, the process cannot be undone.`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success btn-fill',
        cancelButtonClass: 'btn btn-danger btn-fill',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        buttonsStyling: false,
      }).then(async (d) => {
        if (d?.isConfirmed && !d?.isDismissed) {
          const updateRes = await emailFamilyAssignment({
            donorId: this.donor.requestId,
            campaignRequestId: this.activeCampaignId
              ? this.activeCampaignId
              : '',
          })
          if (updateRes?.status != 200 && updateRes?.data?.messages) {
            this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
              error: updateRes?.data?.messages[k],
            }))
          } else {
            Swal.fire({
              title: 'Success',
              text: 'Email sent successfully.',
              timer: 2000,
              showConfirmButton: false,
            })
          }
        }
      })
    },

    canAllocate(c) {
      const assignedFamilies = this.assignedFamilies.filter(
        (f) => !f?.campaignRequestId || f.campaignRequestId === c.requestId
      )
      return this.isJamie() || assignedFamilies.length < c.numberOfFamilies
    },
    allocationMet(c) {
      const assignedFamilies = this.assignedFamilies.filter(
        (f) => !f?.campaignRequestId || f.campaignRequestId === c.requestId
      )
      return assignedFamilies.length >= c.numberOfFamilies
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
          this.editPledgeData.familyDetail.push('any')
        }
      }
      if (this.editPledgeData.numberOfFamilies > this.maxFamilyDetail) {
        this.editPledgeData.familyDetail = []
      }
    },
    async saveEmail() {
      if (this.updatedEmail != this.donor.email) {
        await Swal.fire({
          title: 'Do you want to resend the verification email?',
          text: `As you have updated this users email, you should also ask them to verify it unless you're confident the email is correct.`,
          type: 'warning',
          showCancelButton: true,
          confirmButtonClass: 'btn btn-success btn-fill',
          cancelButtonClass: 'btn btn-danger btn-fill',
          confirmButtonText: 'Yes, resend it!',
          cancelButtonText: 'No, just save',
          buttonsStyling: false,
        }).then(async (d) => {
          const sendEmail = d.isConfirmed || d.dismiss === 'esc'
          if (!d.isDismissed || d.dismiss === 'cancel') {
            const updateRes = await donorEmailUpdate({
              donorId: this.donor.requestId,
              previousEmail: this.donor.email,
              updatedEmail: this.updatedEmail,
              sendEmail,
            })
            if (updateRes.data.status != 200 && updateRes.data?.messages) {
              this.messages = Object.keys(updateRes?.data?.messages).map(
                (k) => ({
                  error: updateRes?.data?.messages[k],
                })
              )
            } else {
              this.donor.email = this.updatedEmail
              this.subscriber.bounced = false
              this.subscriber.bouncedDetail = ''
            }
          }
        })
      }
      if (!this.messages.length) {
        this.editEmailAddress = false
      }
    },
    async savePledge() {
      await Swal.fire({
        title: 'Do you want to send a pledge updated email?',
        text: `As you have updated this users pledge details, you should send a confirmation of the updated details to toe donor.`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success btn-fill',
        cancelButtonClass: 'btn btn-danger btn-fill',
        confirmButtonText: 'Yes, send it!',
        cancelButtonText: 'No, just save',
        buttonsStyling: false,
      }).then(async (d) => {
        const sendEmail = d.isConfirmed || d.dismiss === 'esc'
        if (!d.isDismissed || d.dismiss === 'cancel') {
          const updateRes = await donorPledgeUpdate({
            ...this.editPledgeData,
            donorId: this.donor.requestId,
            donorEmail: this.donor.email,
            sendEmail,
          })
          if (updateRes.data.status != 200 && updateRes.data?.messages) {
            this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
              error: updateRes?.data?.messages[k],
            }))
          }
        }
      })
      if (!this.messages.length) {
        this.editPledge = false
      }
    },
    doEditPledge(c) {
      this.editPledge = true
      this.editPledgeData = { ...c }
      this.editPledgeData.familyDetail = JSON.parse(c.familyDetail)
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`
      }
    },
    getBouncedReason(bouncedData) {
      const obj = JSON.parse(bouncedData)
      return obj?.detail
    },
    getFamilyRequests(req) {
      const preferences = typeof req === 'string' ? JSON.parse(req) : req
      const returnArray = []
      if (preferences.length) {
        for (const p of preferences) {
          switch (p.toLowerCase()) {
            case 'single':
              returnArray.push('Single Person')
              break
            case 'small':
              returnArray.push('Small Family - Maximum 3 family members')
              break
            case 'medium':
              returnArray.push('Medium Family - Maximum 5 family members')
              break
            case 'large':
              returnArray.push('Large Family - 6+ family members')
              break
            default:
              returnArray.push('No Preference')
              break
          }
        }
      }

      return returnArray
    },
  },
  async mounted() {
    if (!this.userInGroup('admin')) {
      this.$router.push('/')
    }

    const donorRes = await getDonorById(this.$route.params.donorId)

    this.donor = donorRes?.data?.donor
    this.updatedEmail = this.donor?.email

    const activeCampaignId = this.$store.getters.getActiveCampaign
    this.campaigns = donorRes?.data?.campaigns.filter(function (c) {
      return c.campaignId === activeCampaignId
    })
    this.campaign = this.campaigns.length ? this.campaigns[0] : {}

    this.assignedFamilies = donorRes?.data?.families
  },
}
</script>
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
