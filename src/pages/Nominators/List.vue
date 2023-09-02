<template>
  <div class="row nominators-list">
    <div class="col-12" v-if="messages && messages.length">
      <l-alert type="danger" v-for="m in messages" :key="m">
        <span> {{ getErrorMessage(m) }}</span>
      </l-alert>
    </div>
    <div class="col-12">
      <ListingsPage
        :paginateOptions="pagination"
        :listingsData="listingsData"
        :options="listingsOptions"
        listingsType="nominators"
        @editItem="handleEdit"
        @deleteItem="handleDelete"
        :customActions="getCustomActions"
        @handleCustomAction="handleCustomAction"
        @downloadCSV="downloadCSV"
      >
        <template v-slot:header>
          {{ heading }} ({{ listingsData.length }})
          <p class="small" v-if="getSubHeading" v-html="getSubHeading" />
        </template>
      </ListingsPage>

      <el-dialog
        center
        :visible.sync="editNominator"
        width="80%"
        style="max-width: 1000px; margin: 0 auto"
      >
        <ValidationObserver v-slot="{ handleSubmit }">
          <form @submit.prevent="handleSubmit(handleNominatorEditSubmit)">
            <div>
              <div class="row" v-if="editMessages.length">
                <div class="col-12">
                  <l-alert type="danger" v-for="m in editMessages" :key="m">
                    <span v-html="m" />
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
                      v-model="nominatorData.firstName"
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
                      :error="failed ? 'The Last name field is required' : null"
                      :hasSuccess="passed"
                      label="Last name"
                      name="lastname"
                      v-model="nominatorData.lastName"
                    ></fg-input>
                  </ValidationProvider>
                </div>
              </div>
              <div class="row">
                <div class="col-12">
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
                      v-model="nominatorData.emailAddress"
                    >
                    </fg-input>
                  </ValidationProvider>
                </div>
                <div class="col-12">
                  <ValidationProvider
                    name="telephone"
                    rules="required"
                    v-slot="{ passed, failed }"
                  >
                    <fg-input
                      type="telephone"
                      placeholder="Your Contact number"
                      :error="
                        failed ? 'The Contact number field is required' : null
                      "
                      :hasSuccess="passed"
                      label="Contact number"
                      name="telephone"
                      v-model="nominatorData.telephoneNumber"
                    >
                    </fg-input>
                  </ValidationProvider>
                </div>
              </div>
            </div>
            <div class="text-center">
              <button
                type="submit"
                class="btn btn-fill btn-info btn-round btn-wd"
              >
                Save
              </button>
            </div>
          </form>
        </ValidationObserver>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import {
  getNominators,
  approveNominator,
  updateNominator,
  resetNominatorPassword,
} from '@/api/nominators.api'
import { getOrganisations } from '@/api/organisations.api'
import { deleteUser, migrateUserPoolManual } from '@/api/users.api'
import ListingsPage from '@/components/Cards/ListingsPage.vue'
import LAlert from 'src/components/Alert'
import Swal from 'sweetalert2'
import { Dialog, MessageBox } from 'element-ui'

window.EventBus = new Vue({
  methods: {
    emit(type, payload) {
      this.$emit('$EventBusEvent', type, payload)
    },
  },
})

Vue.prototype.$confirm = MessageBox.confirm

export default {
  components: {
    ListingsPage,
    [Dialog.name]: Dialog,
    LAlert,
  },
  props: {
    heading: {
      type: String,
      default: 'All Nominators',
    },
    subHeading: {
      type: String,
      default: '',
    },
    data: {
      type: Array || null,
      default: null,
    },
    organisationId: {
      type: String,
      default: '',
    },
    paginateOptions: {
      type: Object,
      default: () => ({
        perPage: 50,
        perPageOptions: [25, 50, 100, 150, 200],
      }),
    },
    searchKeys: {
      type: Array,
      default: () => [
        'userReference',
        'fullName',
        'lastName',
        'emailAddress',
        'telephoneNumber',
      ],
    },
    options: {
      type: Object,
      default: () => ({
        create: false,
        update: false,
        delete: true,
        download: true,
        authorise: false,
        highlight: {
          unauthorised: false,
          admin: false,
        },
      }),
    },
    customActions: {
      type: Array,
      default: () => [],
    },
  },
  watch: {
    data(newVal) {
      this.tableData = newVal
    },
  },
  data() {
    const tableColumns = [
      {
        prop: 'userReference',
        label: 'Ref',
        minWidth: 70,
      },
      {
        prop: 'nominatorDetail',
        label: 'User Details',
        html: true,
        minWidth: 250,
      },
    ]
    return {
      isLoading: true,
      editMessages: [],
      messages: [],
      editNominator: false,
      tableData: [],
      fallBackSubHeading: '',
      nominatorData: {},
      pagination: {
        perPage: this.paginateOptions.perPage ?? 5,
        currentPage: 1,
        perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
        total: 0,
      },
      filters: {
        verified: 'Yes',
        verifiedOptions: ['All', 'Yes', 'No'],
        bounced: 'All',
        bouncedOptions: ['All', 'Yes', 'No'],
        familySize: 'All',
        familySizeOptions: [
          'All',
          '1',
          '2',
          '3',
          '4',
          '5',
          '6',
          '7',
          '8',
          '9',
          '10+',
        ],
        allocationStatus: 'All',
        allocationStatusOptions: ['All', 'Allocated', 'Unallocated'],
        sort: 'Reference A-Z',
        sortOptions: ['Reference A-Z', 'Reference Z-A'],
      },
      listingsOptions: {
        columns: tableColumns,
        searchKeys: this.searchKeys,
        create: this.options?.create ? this.options.create : false,
        edit: this.options?.update ? this.options.update : false,
        delete: this.options?.delete ? this.options.delete : false,
        download: this.options?.download ? this.options.download : false,
        authorise: this.options?.authorise ? this.options.authorise : false,
        highlight: this.options?.highlight ? this.options.update : {},
        search: this.options?.search ? this.options.search : true,
      },
    }
  },
  computed: {
    getSubHeading() {
      if (this.subHeading) {
        return this.subHeading
      }
      return this.fallBackSubHeading
    },
    listingsData() {
      let result = this?.tableData ?? []

      result.sort((a, b) =>
        b.firstName < a.firstName ? 1 : a.firstName < b.firstName ? -1 : 0
      )

      return result
    },
    allowMigrate() {
      return this.isJamie()
    },
    getCustomActions() {
      const propCustomActions = this.customActions
      if (!this.organisationId) {
        propCustomActions.push({
          emit: 'viewOrganisation',
          type: 'icon',
          icon: 'nc-icon nc-istanbul',
          class: 'btn-primary',
          text: 'View Organisation',
        })
      }
      if (this.userInGroup('admin')) {
        propCustomActions.push({
          emit: 'resetPassword',
          type: 'icon',
          icon: 'nc-icon nc-lock-circle-open',
          class: 'btn-info',
          text: 'Reset Password',
        })
      }
      if (this.isJamie()) {
        propCustomActions.push({
          emit: 'migrateUser',
          type: 'icon',
          icon: 'nc-icon nc-cloud-upload-94',
          class: 'btn-danger',
          text: 'Migrate User',
        })
      }
      return propCustomActions
    },
  },
  methods: {
    async handleNominatorEditSubmit() {
      try {
        const newNomData = this.tableData.slice(0)
        const res = await updateNominator(this.nominatorData)
        if (res.data.success) {
          newNomData.find((n, i) => {
            if (n.requestId === this.nominatorData.requestId) {
              this.nominatorData = { ...res.data.nominator }
              this.nominatorData.fullName = `${this.nominatorData.firstName} ${this.nominatorData.lastName}`

              this.nominatorData.nominatorDetail = this.setNominatorDetail(
                this.nominatorData
              )

              newNomData[i] = this.nominatorData
              return true // stop searching
            }
          })
          this.tableData = newNomData
          this.editNominator = false
        } else {
          this.editMessages = []
          if (res.data.editMessages) {
            this.editMessages = res.data.messages
          }
        }
      } catch (e) {
        if (e.message) {
          this.editMessages = []
          this.editMessages.push(e.message)
        }
      }
    },
    async handleEdit(i, r) {
      this.editNominator = true
      this.nominatorData = r
      this.nominatorData.originalEmail = r.emailAddress
    },
    async handleDelete(i, r) {
      const updateRes = await deleteUser(this.organisationId, r.emailAddress)
      if (updateRes?.status != 200 && updateRes?.data?.messages) {
        this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
          error: updateRes?.data?.messages[k],
        }))
      } else {
        let indexToDelete = this.tableData.findIndex(
          (tableRow) => tableRow.requestId === r.requestId
        )
        if (indexToDelete >= 0) {
          this.tableData.splice(indexToDelete, 1)
        }
      }
    },
    async migrateNom(nominator) {
      const resApprove = await migrateUserPoolManual({
        Username: nominator.emailAddress,
        Manual: true,
      })
      if (resApprove.status == 200) {
        Swal.fire({
          title: 'Success',
          text: 'User migrated successfully.',
          timer: 3000,
          showConfirmButton: false,
        })
      }
    },
    async approveNom(nominator) {
      const resApprove = await approveNominator(
        nominator.requestId,
        this.organisationId != ''
          ? this.organisationId
          : nominator.organisationId
      )
      if (resApprove.status == 200 && this.tableData) {
        nominator.status = 'Approved'
        nominator.nominatorDetail = this.setNominatorDetail(nominator)
        var foundIndex = this.tableData.findIndex(
          (n) => n.requestId == nominator.requestId
        )
        const updatedData = structuredClone(this.tableData)
        updatedData[foundIndex] = nominator

        this.tableData = updatedData
      }
    },
    async doResetPassword(i, n) {
      await Swal.fire({
        title: 'Are you sure?',
        text: `If you reset this password, the user will be emailed a new password and their old logins will cease to work.`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonClass: 'btn btn-success btn-fill',
        cancelButtonClass: 'btn btn-danger btn-fill',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No',
        buttonsStyling: false,
      }).then(async (d) => {
        if (d?.isConfirmed && !d?.isDismissed) {
          /* */
          const updateRes = await resetNominatorPassword(n.requestId)
          if (updateRes?.status != 200 && updateRes?.data?.messages) {
            this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
              error: updateRes?.data?.messages[k],
            }))
          } else {
            Swal.fire({
              title: 'Success',
              text: 'Password reset was succesful.',
              timer: 3000,
              showConfirmButton: false,
            })
          }
          /* */
        }
      })
    },
    downloadCSV() {
      let rows = [
        ['Nominator Name', 'Email Address', 'Organisation', 'Telephone'],
      ]

      const data = this.tableData.map((nominator) => {
        const userOrg = this.organisationData.find(
          (o) =>
            nominator.organisationId && o.requestId === nominator.organisationId
        )

        return [
          `"${nominator.firstName} ${nominator.lastName}"`,
          `"${nominator.emailAddress ? nominator.emailAddress : ''}"`,
          `"${userOrg?.name}"`,
          `"${nominator.telephoneNumber ? nominator.telephoneNumber : ''}"`,
        ]
      })
      rows.push(...data)

      let csvContent =
        'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')

      var encodedUri = encodeURI(csvContent)
      // window.open(encodedUri);
      /* */
      var link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute('download', `all-nominators-list.csv`)
      document.body.appendChild(link) // Required for FF

      link.click()
      link.remove()
      /* */
    },
    handleCustomAction(i, k, r) {
      switch (k) {
        case 'viewOrganisation':
          this.$router.push(`/organisations/view/${r.organisationId}`)
          break
        case 'migrateUser':
          this.migrateNom(r)
          break
        case 'resetPassword':
          this.doResetPassword(i, r)
          break
        default:
          this.$emit(k, i, r)
          break
      }
    },
    handleEventBusEvent(type, requestId) {
      const nominator = this.tableData.find((n) => n?.requestId === requestId)
      if (!nominator?.requestId) {
        return false
      }
      switch (type) {
        case 'approve':
          this.approveNom(nominator)
          return
        case 'migrate':
          this.migrateNom(nominator)
          return
      }
    },
    setNominatorDetail(nominator) {
      let nominatorDetail = `
              <div
                class="${
                  !this?.options?.highlight.unauthorised ||
                  nominator.status == 'Approved'
                    ? ''
                    : 'unauthorised'
                }"
              >
                  <div class="row">
                    <div class="col-12">
                      <span class="nominatorName">
                        <strong>
                          ${nominator.firstName}
                          ${nominator.lastName}
                        </strong>`
      if (nominator.telephoneNumber) {
        nominatorDetail += `
                        -
                        <a href="tel:${nominator.telephoneNumber}">${nominator.telephoneNumber}</a>`
      }
      nominatorDetail += `
                      </span>`
      if (nominator.emailAddress) {
        nominatorDetail += `
                      <span class="nominatorEmail">
                        <a href="mailto:${nominator.emailAddress}">${nominator.emailAddress}</a>
                      </span>`
      }
      nominatorDetail += `
                    </div>
                  </div>`
      if (this?.options?.highlight.admin && nominator?.isAdmin) {
        nominatorDetail += `
                  <div class="row always-show" v-if="">
                    <div class="col-12">
                      <span class="team-lead text-secondary">Team Lead</span>
                    </div>
                  </div>`
      }
      if (this?.options?.authorise && nominator.status != 'Approved') {
        nominatorDetail += `
                  <div class="row always-show" v-if="">
                    <div class="col-12">`
        if (this?.options?.authorise && nominator.status != 'Approved') {
          nominatorDetail += `
                      <button
                        type="submit"
                        class="btn btn-info btn-fill pull-right w-100 mt-3"
                        onclick="EventBus.emit('approve', '${nominator.requestId}')"
                      >
                        Authorise
                      </button>`
        }
        nominatorDetail += `
                    </div>
                  </div>`
      }
      nominatorDetail += `
              </div>
              `
      return nominatorDetail
    },
  },
  async mounted() {
    if (!this.userInGroup('admin') && !this.userInGroup('teamlead')) {
      this.$router.push('/')
    }
    let res = {}
    if (!this.data || typeof this.data != 'object') {
      res = await getNominators(
        this.organisationId != '' ? this.organisationId : false
      )
      this.tableData = Object.values(res?.data)

      const organisationsRes = await getOrganisations()
      this.organisationData = Object.values(organisationsRes.data)
    } else {
      this.tableData = this.data
    }

    this.$emit('resultData', 'nominators', this.tableData)
    this.isLoading = false

    this.tableData.map((o) => {
      o.fullName = `${o.firstName} ${o.lastName}`
      o.nominatorDetail = this.setNominatorDetail(o)
      return true
    })

    EventBus.$on('$EventBusEvent', this.handleEventBusEvent)
  },
}
</script>
<style lang="scss">
.nominators-list {
  .nominatorName,
  .nominatorEmail {
    display: block;
  }
}
.el-table__row {
  .unauthorised {
    & > div {
      &:not(.always-show) {
        opacity: 0.3;
      }
    }
  }
}
.team-lead {
  font-weight: bold;
}
</style>
