<template>
  <div class="row donors-list">
    <div class="col-12">
      <ListingsPage
        :paginateOptions="pagination"
        :listingsData="listingsData"
        :options="listingsOptions"
        listingsType="donors"
        @editItem="handleEdit"
        @deleteItem="handleDelete"
        @downloadCSV="downloadCSV"
      >
        <template v-slot:header> All Donors </template>
        <template v-slot:filters>
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Email Verified</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.verified"
              @change="filtersChanged()"
              placeholder="Verified"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.verifiedOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Number Pledged</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.pledged"
              @change="filtersChanged()"
              placeholder="Pledged"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.pledgedOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Allocation Status</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.allocated"
              @change="filtersChanged()"
              placeholder="Allocated"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.allocatedOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2">Sort By</span>
            <el-select
              class="select-default w-100"
              v-model="filters.sort"
              @change="filtersChanged()"
              placeholder="Sort By"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.sortOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Email Bounced</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.bounced"
              @change="filtersChanged()"
              placeholder="Bounced"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.bouncedOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2"
              >Additional Information Supplied</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.hasAdditionalInformation"
              @change="filtersChanged()"
              placeholder="Has additional information"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.hasAdditionalInformationOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
        </template>
      </ListingsPage>
    </div>
  </div>
</template>
<script>
import Vue from 'vue'
import { Select, Option } from 'element-ui'
import {
  getDonorsByCampaign,
  deletePledge,
  resendVerification,
} from '@/api/donors.api'
import ListingsPage from '@/components/Cards/ListingsPage.vue'
import moment from 'moment'
import Swal from 'sweetalert2'
import { MessageBox } from 'element-ui'

Vue.prototype.$confirm = MessageBox.confirm

window.EventBus = new Vue({
  methods: {
    emit(payload) {
      this.$emit('$EventBusEvent', payload)
    },
  },
})

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
    ListingsPage,
  },
  props: {
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
        'email',
        'firstName',
        'lastName',
        'company',
        'telephone',
        'additionalInfo',
      ],
    },
    options: {
      type: Object,
      default: () => ({
        create: false,
        update: true,
        delete: true,
        download: true,
      }),
    },
  },
  data() {
    const tableColumns = [
      {
        prop: 'donorDetail',
        label: 'Donor Details',
        html: true,
        minWidth: 450,
      },
      {
        prop: 'pledgeDetail',
        label: 'Pledged',
        html: true,
        minWidth: 450,
        align: 'center',
      },
      {
        prop: 'dateAdded',
        label: 'Date Pledged',
        minWidth: 160,
        align: 'center',
      },
    ]
    const savedFilters = this.$store.getters.getGenericData('donorsFilters')
    return {
      tableData: [],
      pagination: {
        perPage: this.paginateOptions.perPage ?? 5,
        currentPage: 1,
        perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
        total: 0,
      },
      filters: {
        verified: savedFilters?.verified ? savedFilters.verified : 'Yes',
        verifiedOptions: ['All', 'Yes', 'No'],
        bounced: savedFilters?.bounced ? savedFilters.bounced : 'All',
        bouncedOptions: ['All', 'Yes', 'No'],
        pledged: savedFilters?.pledged ? savedFilters.pledged : 'Any',
        pledgedOptions: ['Any', '1', '2', '3', '4', '5+'],
        allocated: savedFilters?.allocated ? savedFilters.allocated : 'All',
        allocatedOptions: [
          'All',
          'Not Allocated',
          'Part Allocated',
          'Fully Allocated',
        ],
        hasAdditionalInformation: savedFilters?.hasAdditionalInformation
          ? savedFilters.hasAdditionalInformation
          : 'Any',
        hasAdditionalInformationOptions: ['All', 'Yes', 'No'],
        sort: savedFilters?.sort ? savedFilters.sort : 'Newest First',
        sortOptions: ['Newest First', 'Oldest First'],
      },
      listingsOptions: {
        columns: tableColumns,
        searchKeys: this.searchKeys,
        modalMessages: {
          delete: {
            message: 'If you delete this donor, the process cannot be undone.',
          },
        },
        create: this.options?.create ? this.options.create : false,
        edit: this.options?.update ? this.options.update : false,
        delete: this.options?.delete ? this.options.delete : false,
        download: this.options?.download ? this.options.download : false,
        search: this.options?.search ? this.options.search : true,
      },
    }
  },
  computed: {
    listingsData() {
      let result = this?.tableData ?? []
      if (result.length) {
        if (this.filters.verified && this.filters.verified != 'All') {
          result = result.filter(
            (d) => d.verified === (this.filters.verified === 'Yes')
          )
        }
        if (this.filters.bounced && this.filters.bounced != 'All') {
          result = result.filter(
            (d) =>
              d.bounced === (this.filters.bounced === 'Yes') ||
              (!d.bounced && this.filters.bounced === 'No')
          )
        }
        if (this.filters.pledged && this.filters.pledged != 'Any') {
          result = result.filter((d) =>
            this.filters.pledged != '5+'
              ? d.numberOfFamilies == this.filters.pledged
              : d.numberOfFamilies >= 5
          )
        }
        if (this.filters.allocated && this.filters.allocated != 'All') {
          result = result.filter((d) => {
            switch (this.filters.allocated.toLowerCase()) {
              case 'not allocated':
                return !d?.allocatedFamilies || d.allocatedFamilies === 0
              case 'part allocated':
                return (
                  d?.allocatedFamilies &&
                  d.allocatedFamilies > 0 &&
                  d.allocatedFamilies < d.numberOfFamilies
                )
              case 'fully allocated':
                return (
                  d?.allocatedFamilies &&
                  d.allocatedFamilies > 0 &&
                  d.allocatedFamilies === d.numberOfFamilies
                )
              default:
                return true
            }
          })
        }

        if (
          this.filters.hasAdditionalInformation &&
          this.filters.hasAdditionalInformation != 'Any'
        ) {
          result = result.filter((d) =>
            this.filters.hasAdditionalInformation === 'Yes'
              ? d.additionalInfo !== ''
              : d.additionalInfo === ''
          )
        }
      }

      if (this.filters.sort && this.filters.sort === 'Oldest First') {
        result.sort((a, b) =>
          a.dateAddedSort > b.dateAddedSort
            ? 1
            : b.dateAddedSort > a.dateAddedSort
            ? -1
            : 0
        )
      } else {
        result.sort((a, b) =>
          a.dateAddedSort < b.dateAddedSort
            ? 1
            : b.dateAddedSort < a.dateAddedSort
            ? -1
            : 0
        )
      }

      return result
    },
  },
  methods: {
    downloadCSV() {
      let rows = [
        [
          'Donor Name',
          'Email Address',
          'Telephone',
          'Company',
          'Families Pledged',
          'Family Detail',
          'Additional Information',
          'Source',
          'Verified',
          'Date Pledged',
        ],
      ]

      const data = this.tableData.map((donor) => {
        return [
          `"${donor.firstName} ${donor.lastName}"`,
          `"${donor.email ? donor.email : ''}"`,
          `"${donor.telephone ? donor.telephone : ''}"`,
          `"${donor.company ? donor.company : ''}"`,
          `"${donor.numberOfFamilies ? donor.numberOfFamilies : ''}"`,
          `"${
            donor.familyDetail ? JSON.parse(donor.familyDetail).join(', ') : ''
          }"`,
          `"${donor.additionalInfo ? donor.additionalInfo : ''}"`,
          `"${donor.howHeard ? donor.howHeard : ''}"`,
          `"${donor.verified ? donor.verified : ''}"`,
          `"${donor.dateAdded ? donor.dateAdded : ''}"`,
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
      link.setAttribute('download', `all-donors-list.csv`)
      document.body.appendChild(link) // Required for FF

      link.click()
      link.remove()
      /* */
    },
    filtersChanged() {
      this.$store.dispatch('setGenericData', {
        key: 'donorsFilters',
        data: this.filters,
      })
    },
    async handleEdit(i, r) {
      this.$router.push(`/donors/view/${r.requestId}`)
    },
    async handleDelete(i, r) {
      /* */
      // const updateRes = await deleteDonor({ donorId: r.requestId })
      const updateRes = await deletePledge({
        pledgeId: r.pledgeId,
        donorId: r.requestId,
      })
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
      /* */
    },
    async handleEventBusEvent(requestId) {
      const donor = this.tableData.find((n) => n.requestId === requestId)

      if (donor.requestId) {
        const sent = await resendVerification({ donorId: donor.requestId })
        if (sent.status === 200) {
          Swal.fire({
            title: 'Success',
            text: 'Welcome email sent successfully.',
            timer: 3000,
            showConfirmButton: false,
          })
        }
      }
    },
    setDonorDetail(donor) {
      let donorDetail = `
              <div>
                  <div class="row">
                    <div class="col-12">
                      <span class="donorName">
                        <strong>
                          ${donor.firstName}
                          ${donor.lastName}
                        </strong>`
      if (donor.email) {
        donorDetail += `
                        -
                        <a href="mailto:${donor.email}">${donor.email}</a>`
      }
      donorDetail += `
                      </span>`
      if (donor.telephone) {
        donorDetail += `
                      <span class="donorEmail">
                        <strong>Telephone:</strong> <a href="tel:${donor.telephone}">${donor.telephone}</a>
                      </span>`
      }
      if (donor.howHeard) {
        donorDetail += `
                      <span class="donorEmail">
                        <strong>Source:</strong> ${donor.howHeard}
                      </span>`
      }
      if (!donor.verified) {
        donorDetail += `
                      <button
                        type="submit"
                        class="btn btn-info btn-fill pull-right w-100 mt-3 mt-xl-0"
                        onclick="EventBus.emit('${donor.requestId}')"
                      >
                        Resend Verification Email
                      </button>`
      }
      donorDetail += `
                    </div>
                  </div>`
      donorDetail += `
              </div>
              `
      return donorDetail
    },
    getPreferenceDetail(p) {
      switch (p.toLowerCase()) {
        case 'single':
          return 'Single Person'
        case 'small':
          return 'Small Family - Maximum 3 family members'
        case 'medium':
          return 'Medium Family - Maximum 5 family members'
        case 'large':
          return 'Large Family - 6+ family members'
        default:
          return 'No Preference'
      }
    },
    setPledgeDetail(donor) {
      let donorDetail = `
              <div>
                  <div class="row">
                    <div class="col-12">
                      <span class="donorName">
                        <strong>
                          ${donor.numberOfFamilies}
                        </strong> Famil${
                          donor.numberOfFamilies > 1 ? 'ies' : 'y'
                        }`
      donorDetail += `
                      </span>`
      if (donor.familyDetail && donor.familyDetail.length) {
        const familyDetail = JSON.parse(donor.familyDetail)
        for (var index = 0; index < familyDetail.length; index++) {
          const preference = familyDetail[index]
          donorDetail += `
                      - ${this.getPreferenceDetail(preference)}<br />`
          if (index + 1 >= donor.numberOfFamilies) {
            break
          }
        }
      }
      if (donor.additionalInfo) {
        donorDetail += `
                      <span class="donorAdditional">
                        <strong>Additional Info:</strong> ${donor.additionalInfo}
                      </span>`
      }
      donorDetail += `
                    </div>
                  </div>`
      donorDetail += `
              </div>
              `
      return donorDetail
    },
  },
  async mounted() {
    if (!this.userInGroup('admin') && !this.userInGroup('teamlead')) {
      this.$router.push('/')
    }

    const res = await getDonorsByCampaign(this.$store.getters.getActiveCampaign)
    this.tableData = Object.values(res.data)

    this.tableData.map((o) => {
      o.fullName = `${o.firstName} ${o.lastName}`
      o.donorDetail = this.setDonorDetail(o)
      o.pledgeDetail = this.setPledgeDetail(o)
      o.dateAddedSort = moment(o.dateAdded).format('YYYYMMDDHHmmss')
      return true
    })

    EventBus.$on('$EventBusEvent', this.handleEventBusEvent)
  },
}
</script>
<style lang="scss">
.donors-list {
  .donorName,
  .donorEmail,
  .donorTelephone,
  .donorCompany,
  .donorAdditional {
    display: block;
  }

  .donorAdditional {
    padding-top: 10px;
  }
}
</style>
