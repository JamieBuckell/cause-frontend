<template>
  <div>
    <div class="row">
      <div class="col-12">
        <card>
          <div slot="header">
            <h4 class="title mt-0">CAUSE Foundation Communications</h4>
            <div
              class="spinner-border text-muted"
              role="status"
              v-if="isLoading"
            >
              <span class="sr-only">Loading...</span>
            </div>
            <div class="container" v-if="!isLoading">
              <div class="row">
                <div class="col-4">
                  <label for="sendFrom">Send From:</label>
                  <el-input
                    type="text"
                    id="sendFrom"
                    class="mb-3 w-100"
                    style="width: 200px"
                    placeholder="Send From"
                    v-model="sendFrom"
                  />
                </div>
                <div class="col-8">
                  <label
                    for="sendFrom"
                    style="padding-top: 2rem; font-size: 1rem"
                    >@cause-foundation.org.uk</label
                  >
                </div>
                <div class="col-4">
                  <label for="singleAddress">Email Type:</label>
                  <el-select
                    name="type"
                    class="select-default w-100"
                    v-model="emailType"
                  >
                    <el-option
                      class="select-default"
                      v-for="item in emailTypes"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </div>
                <div class="col-8" v-if="emailType === 'specific'">
                  <fg-input
                    label="Email Address"
                    type="text"
                    class="mb-3 w-100"
                    :class="emailError ? 'has-error' : ''"
                    placeholder="Email Address"
                    v-model="specificAddress"
                    @keyup.enter="handleInputConfirm"
                    @blur="handleInputConfirm"
                  >
                  </fg-input>

                  <el-tag
                    :key="address"
                    id="specificAddresses"
                    v-for="address in specificAddresses"
                    size="small"
                    type="success"
                    :closable="true"
                    :close-transition="false"
                    @close="handleClose(address)"
                  >
                    {{ address }}
                  </el-tag>
                </div>
                <div class="col-8" v-if="emailType === 'subscribers'">
                  <label for="includePledged"
                    >Include Pledged Subscribers:</label
                  >
                  <el-select
                    name="includePledged"
                    class="select-default w-100"
                    v-model="includePledged"
                  >
                    <el-option
                      class="select-default"
                      v-for="item in genericOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                </div>
                <div class="col-8" v-if="emailType === 'nominators'">
                  <label for="includeTeamLeads">Include Team Leads:</label>
                  <el-select
                    name="includeTeamLeads"
                    class="select-default w-100"
                    v-model="includeTeamLeads"
                  >
                    <el-option
                      class="select-default"
                      v-for="item in genericOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
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
                    v-model="emailSubject"
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
                    v-model="emailTitle"
                  />
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <label for="content">Content:</label>
                  <wysiwyg v-model="htmlContent" class="mb-4" />
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <button
                    type="submit"
                    class="btn btn-fill btn-wd pull-right btn-info"
                    @click.prevent="sendEmail"
                    :disabled="isLoading"
                  >
                    Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </card>
      </div>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { sendEmail } from '@/api/communications.api'
import Swal from 'sweetalert2'
import { MessageBox, Select, Option, Tag } from 'element-ui'

Vue.prototype.$confirm = MessageBox.confirm

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
    [Tag.name]: Tag,
  },
  data() {
    return {
      isLoading: true,
      genericOptions: [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },
      ],
      emailTypes: [
        { value: 'specific', label: 'Specific Email Address(es)' },
        { value: 'donors', label: 'All Donors' },
        { value: 'subscribers', label: 'All Subscribers' },
        { value: 'nominators', label: 'All Nominators' },
        { value: 'teamleads', label: 'All Team Leads' },
      ],
      emailType: 'specific',
      specificAddresses: [],
      specificAddress: '',
      emailError: false,
      includePledged: false,
      includeTeamLeads: true,
      sendFrom: `hampers`,
      emailSubject: ``,
      emailTitle: ``,
      htmlContent: ``,
    }
  },
  computed: {},
  methods: {
    handleClose(address) {
      this.specificAddresses.splice(this.specificAddresses.indexOf(address), 1)
    },
    handleInputConfirm() {
      const re = new RegExp(
        /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/
      )

      this.specificAddress = this.specificAddress
        .toLowerCase()
        .replace(/[ \u00A0]/, ' ')
        .replace(/\s\s+/g, ' ')

      let inputValue = this.specificAddress

      const allItems = inputValue.split(' ')

      let hasError = false

      for (const emailKey in allItems) {
        const emailValue = allItems[emailKey]

        if (emailValue) {
          if (re.test(emailValue)) {
            if (!this.specificAddresses.find((e) => e === emailValue)) {
              this.specificAddresses.push(emailValue)
            }
            this.specificAddress = this.specificAddress.replace(
              `${emailValue}`,
              ''
            )
          } else if (!hasError) {
            hasError = true
          }
        }
      }

      if (!hasError) {
        this.specificAddress = ''
      }
      this.specificAddress = this.specificAddress.replace(/\s\s+/g, ' ').trim()
      this.emailError = hasError
    },
    async sendEmail() {
      await Swal.fire({
        title: 'Are you sure?',
        text: `If you hit yes, this email will be sent to your specified emails. The process cannot be undone.`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success btn-fill',
        cancelButtonClass: 'btn btn-danger btn-fill',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        buttonsStyling: false,
      }).then(async (d) => {
        this.isLoading = true
        if (d?.isConfirmed && !d?.isDismissed) {
          const emailSendRes = await sendEmail({
            options: {
              type: this.emailType,
              toAddresses: this.specificAddresses,
              excludeTeamLeads: !this.includeTeamLeads,
              excludePledged: !this.includePledged,
            },
            email: {
              fromAddress: this.sendFrom,
              subject: this.emailSubject,
              title: this.emailTitle,
              content: this.htmlContent,
            },
          })
          if (emailSendRes.status == 200) {
            Swal.fire({
              title: 'Success',
              text: 'Email sent successfully.',
              timer: 3000,
              showConfirmButton: false,
            })
            /* *
            this.emailSubject = `CAUSE Foundation: `;
            this.emailTitle = "";
            this.htmlContent = "";
            this.toAddresses = [];
            /* */
          } else {
            Swal.fire({
              title: 'Error',
              text: 'An unexpected error occurred',
              timer: 3000,
              showConfirmButton: false,
            })
          }
        }
        this.isLoading = false
      })
    },
  },
  async mounted() {
    if (!this.userInGroup('admin')) {
      this.$router.push('/')
    }

    this.isLoading = false
  },
}
</script>
<style lang="css">
@import '~vue-wysiwyg/dist/vueWysiwyg.css';
.editr {
  background: #fff;
}
</style>
