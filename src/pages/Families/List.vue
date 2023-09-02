<template>
  <div class="row families-list">
    <div class="col-12" v-if="messages && messages.length">
      <l-alert type="danger" v-for="m in messages" :key="m">
        <span> {{ getErrorMessage(m) }}</span>
      </l-alert>
    </div>
    <div class="col-12">
      <el-dialog
        center
        title="Nominate Family"
        :visible.sync="modals.create"
        width="80%"
      >
        <FamilyAdd
          :key="createKey"
          :orgRef="`${orgRef}`"
          :nominatorRef="`${nominatorRef}`"
          :nominatorId="currentNominator ? currentNominator.requestId : ''"
          :hamperCount="familyCount"
          :nominatorsFamilies="nominatorsFamilies"
          :allFamilies="tableData"
          :allNominators="allNominators"
          @saveFamilies="saveFamilies"
          z-index="1050"
        />
      </el-dialog>
      <el-dialog
        center
        title="Edit Nominated Family"
        :visible.sync="modals.update"
        width="80%"
      >
        <FamilyAdd
          :key="createKey"
          :orgRef="`${orgRef}`"
          :nominatorRef="`${nominatorRef}`"
          :nominatorId="currentNominator ? currentNominator.requestId : ''"
          :hamperCount="familyCount"
          :nominatorsFamilies="nominatorsFamilies"
          :allFamilies="tableData"
          :allNominators="allNominators"
          :familyData="editFamilyData"
          saveType="update"
          @saveFamilies="updateFamilies"
          z-index="1050"
        />
      </el-dialog>
      <el-dialog
        center
        title="Split Families"
        :visible.sync="modals.split"
        width="80%"
      >
        <FamilySplit
          :key="createKey"
          :orgRef="`${hamperRef}`"
          :nominatorId="currentNominator ? currentNominator.requestId : ''"
          :hamperCount="familyCount"
          :nominatorsFamilies="nominatorsFamilies"
          :allFamilies="tableData"
          :allNominators="allNominators"
          :familyData="familyData"
          @splitFamilies="doSplitFamilies"
          z-index="1050"
        />
      </el-dialog>
      <ListingsPage
        :paginateOptions="pagination"
        :listingsData="listingsData"
        :options="listingsOptions"
        listingsType="families"
        @editItem="handleEdit"
        @deleteItem="handleDelete"
        :customActions="getCustomActions"
        @handleCustomAction="handleCustomAction"
        @downloadCSV="downloadCSV"
        @updateSearch="updateSearch"
      >
        <template v-slot:header>
          <button
            type="submit"
            class="btn btn-info btn-fill btn-wd pull-right"
            @click.prevent="
              createKey = !createKey
              openModal('create')
            "
            v-if="!isLoading && options.create && maxFamilysCheck"
          >
            Add Family
          </button>
          {{ heading }} ({{ listingsData.length }})
          <p class="small" v-if="getSubHeading" v-html="getSubHeading" />
        </template>
        <template v-slot:filters>
          <div class="col-12 col-md-3">
            <span class="text-muted small d-block py-1 px-2">Family Size</span>
            <el-select
              class="select-default w-100"
              v-model="filters.familySize"
              @change="filtersChanged()"
              placeholder="familySize"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.familySizeOptions"
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
              placeholder="hasAdditionalInformation"
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
          <div class="col-12 col-md-3"></div>
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
              >Allocation Status</span
            >
            <el-select
              class="select-default w-100"
              v-model="filters.allocationStatus"
              @change="filtersChanged()"
              placeholder="allocationStatus"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="item in filters.allocationStatusOptions"
                :key="item"
                :label="item"
                :value="item"
              >
              </el-option>
            </el-select>
          </div>
          <div class="col-12 col-md-3" v-if="allNominators.length > 1">
            <span class="text-muted small d-block py-1 px-2">Nominator</span>
            <el-select
              class="select-default w-100"
              v-model="filters.nominatorId"
              @change="filtersChanged()"
              placeholder="Nominator"
              autocomplete="off"
              data-lpignore="true"
              data-form-type="other"
            >
              <el-option
                class="select-default"
                v-for="nominator in allNominators"
                :key="nominator.requestId"
                :label="nominator.fullName"
                :value="nominator.requestId"
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
import { Dialog, MessageBox, Select, Option } from 'element-ui'
import {
  getFamilyByOrganisation,
  getFamilies,
  deleteFamily,
} from '@/api/families.api'
import { fixReferences } from '@/api/users.api'
import { getDonors } from '@/api/donors.api'

import ListingsPage from '@/components/Cards/ListingsPage.vue'
import FamilyAdd from '@/components/Modals/FamilyAdd.vue'
import FamilySplit from '@/components/Modals/FamilySplit.vue'
import LAlert from 'src/components/Alert'
import Swal from 'sweetalert2'

Vue.prototype.$confirm = MessageBox.confirm
import moment from 'moment'

window.EventBus = new Vue({
  methods: {
    emit(payload) {
      this.$emit('$EventBusEvent', payload)
    },
  },
})

Vue.prototype.$confirm = MessageBox.confirm

export default {
  components: {
    [Dialog.name]: Dialog,
    [Select.name]: Select,
    [Option.name]: Option,
    LAlert,
    ListingsPage,
    FamilyAdd,
    FamilySplit,
  },
  props: {
    listKey: {
      type: String,
      default: '',
    },
    heading: {
      type: String,
      default: 'Families',
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
    organisation: {
      type: Object,
      default: () => ({}),
    },
    nominator: {
      type: Object,
      default: () => ({}),
    },
    allNominators: {
      type: Array,
      default: () => [],
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
      default: () => ['reference', 'familyDetail', 'nominatorDetail'],
    },
    options: {
      type: Object,
      default: () => ({
        create: false,
        update: true,
        delete: true,
        download: true,
        authorise: false,
        resetReferences: false,
        splitFamily: false,
        showDonor: true,
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
    allNominators(newVal) {
      this.allNominatorsData = newVal
    },
  },
  data() {
    const tableColumns = [
      {
        prop: 'reference',
        label: 'Hamper ID',
        minWidth: 125,
      },
      {
        prop: 'nominatorDetail',
        label: 'Worker Details',
        html: true,
        minWidth: 250,
      },
      {
        prop: 'familyDetail',
        label: 'Family Detail',
        html: true,
        minWidth: 150,
      },
      {
        prop: 'totalUnit',
        label: 'Family Unit',
        minWidth: 50,
      },
      {
        prop: 'bagsReceived',
        label: 'Bags',
        minWidth: 50,
      },
    ]
    if (this.options.showDonor && this.userInGroup('admin')) {
      tableColumns.push({
        prop: 'donorDetail',
        label: 'Donor Detail',
        html: true,
        minWidth: 250,
      })
    }
    const savedFilters = this.$store.getters.getGenericData(
      `familiesFilters${this.listKey}`
    )
    return {
      searchResults: [],
      isLoading: true,
      createKey: 0,
      messages: [],
      modals: {
        create: false,
        update: false,
        split: false,
      },
      editFamilyData: [],
      tableData: [],
      allNominatorsData: [],
      allDonorsData: [],
      familyMemberData: [],
      duplicateReferences: [],
      familyData: {},
      currentNominator: {},
      fallBackSubHeading: '',
      pagination: {
        perPage: this.paginateOptions.perPage ?? 5,
        currentPage: 1,
        perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
        total: 0,
      },
      filters: {
        nominatorId: 'All',
        verified: savedFilters?.verified ? savedFilters.verified : 'Yes',
        verifiedOptions: ['All', 'Yes', 'No'],
        bounced: savedFilters?.bounced ? savedFilters.bounced : 'All',
        bouncedOptions: ['All', 'Yes', 'No'],
        familySize: savedFilters?.familySize ? savedFilters.familySize : 'All',
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
        allocationStatus: savedFilters?.allocationStatus
          ? savedFilters.allocationStatus
          : 'All',
        allocationStatusOptions: [
          'All',
          'Allocated',
          'Allocated - Confirmed',
          'Allocated - Unconfirmed',
          'Unallocated',
        ],
        dropoffStatus: savedFilters?.dropoffStatus
          ? savedFilters.dropoffStatus
          : 'All',
        dropoffStatusOptions: ['All', 'Awaiting', 'Dropped Off'],
        hasAdditionalInformation: savedFilters?.hasAdditionalInformation
          ? savedFilters.hasAdditionalInformation
          : 'All',
        hasAdditionalInformationOptions: [
          'All',
          'Has Additional Info',
          'No Info',
        ],
        sort: savedFilters?.sort ? savedFilters.sort : 'Reference A-Z',
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
      orgFamiliesTotal: this.organisation?.familiesTotal
        ? this.organisation.familiesTotal
        : 0,
    }
  },
  computed: {
    unauthorisedNominators() {
      return Object.values(this.model.nominators)
        .filter((n) => n.status != 'Approved')
        .map((n) => n.requestId)
    },
    getAllNominators() {
      return this.allNominatorsData
    },
    orgRef() {
      return `${this.organisation?.reference}`
    },
    nominatorRef() {
      let nominatorReference = ''
      if (this.currentNominator?.userReference) {
        nominatorReference = this.currentNominator?.userReference
      } else {
        if (this.allNominatorsData.length) {
          const nominator = this.allNominatorsData.find(
            (n) => n.requestId === this.familyData.nominatorId
          )
          if (nominator?.userReference) {
            nominatorReference = nominator.userReference
          }
        }
      }
      return `${nominatorReference}`
    },
    hamperRef() {
      return `${this.orgRef}${this.nominatorRef}`
    },
    maxFamilysCheck() {
      return (
        this.userInGroup('admin') ||
        this.organisation.familiesLimit <= 0 ||
        this.orgFamiliesTotal < this.organisation.familiesLimit
      )
    },
    familyCount() {
      return this.tableData.filter(
        (f) => f.nominatorId == this?.currentNominator?.requestId
      ).length
    },
    nominatorsFamilies() {
      return this.tableData.filter(
        (f) => f.nominatorId == this?.currentNominator?.requestId
      )
    },
    getSubHeading() {
      if (this.subHeading) {
        return this.subHeading
      }
      return this.fallBackSubHeading
    },
    listingsData() {
      let result = this?.tableData ? this.tableData : []

      result.map((f) => {
        f.authorised = this.currentNominator.authorised
        return f
      })
      if (result.length) {
        if (this.filters.familySize && this.filters.familySize != 'All') {
          result = result.filter((d) =>
            this.filters.familySize != '10+'
              ? d.totalUnit == this.filters.familySize
              : d.totalUnit >= 10
          )
        }
        if (this.filters.nominatorId && this.filters.nominatorId != 'All') {
          result = result.filter(
            (d) => d.nominatorId === this.filters.nominatorId
          )
        }

        if (
          this.filters.hasAdditionalInformation &&
          this.filters.hasAdditionalInformation != 'All'
        ) {
          result = result.filter((d) => d.familyDetail.indexOf('Info:') !== -1)
        }

        if (
          this.filters.allocationStatus &&
          this.filters.allocationStatus != 'All'
        ) {
          let allowedStatuses = []
          switch (this.filters.allocationStatus.toLowerCase()) {
            case 'allocated':
              allowedStatuses = [
                'allocated-sent',
                'allocated-unconfirmed',
                'allocated-confirmed',
              ]
              break
            case 'allocated - confirmed':
              allowedStatuses = ['allocated-confirmed']
              break
            case 'allocated - unconfirmed':
              allowedStatuses = ['allocated-unconfirmed']
              break
            case 'unallocated':
            default:
              allowedStatuses = ['', 'unallocated']
              break
          }
          result = result.filter((d) => allowedStatuses.includes(d.status))
        }

        if (this.filters.dropoffStatus && this.filters.dropoffStatus != 'All') {
          let allowedStatuses = []
          switch (this.filters.dropoffStatus.toLowerCase()) {
            case 'dropped off':
              allowedStatuses = ['hamper-received']
              break
            case 'awaiting':
            default:
              allowedStatuses = ['']
              break
          }
          result = result.filter((d) =>
            allowedStatuses.includes(d.receiveStatus)
          )
        }
      }

      if (this.filters.sort && this.filters.sort === 'Reference Z-A') {
        result.sort((a, b) =>
          b.reference > a.reference ? 1 : a.reference > b.reference ? -1 : 0
        )
      } else {
        result.sort((a, b) =>
          b.reference > a.reference ? 1 : a.reference > b.reference ? -1 : 0
        )
      }

      if (this.filters.sort && this.filters.sort === 'Reference Z-A') {
        result.sort((a, b) =>
          b.reference > a.reference ? 1 : a.reference > b.reference ? -1 : 0
        )
      }

      return result
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
        if (this.options.resetReferences) {
          propCustomActions.push({
            emit: 'resetReferences',
            type: 'icon',
            icon: 'nc-icon nc-ruler-pencil',
            class: 'btn-warning',
            text: 'Reset References',
          })
        }
        if (this.options.splitFamily) {
          propCustomActions.push({
            emit: 'splitFamily',
            type: 'icon',
            icon: 'nc-icon nc-vector',
            class: 'btn-info',
            text: 'Split Family',
          })
        }
      }
      return propCustomActions
    },
  },
  methods: {
    updateSearch(results) {
      this.searchResults = results
    },
    filtersChanged() {
      this.$store.dispatch('setGenericData', {
        key: `familiesFilters${this.listKey}`,
        data: this.filters,
      })
    },
    openModal(name) {
      this.modals[name] = true
    },
    closeModal(name) {
      this.modals[name] = false
    },
    downloadCSV() {
      const downloadData = this.searchResults.length
        ? this.searchResults
        : this.listingsData

      const header = [
        'Family Reference',
        'Nominated By',
        'Dynamic',
        'Total Family Unit',
      ]

      if (this.options.showDonor) {
        header.push('Allocated Donor')
        header.push('Donor Email')
        header.push('Allocation Confirmed')
      }

      let rows = [header]

      const data = downloadData.map((f) => {
        let tmp = document.createElement('DIV')
        tmp.innerHTML = f.familyDetail
        const familyDetail = (tmp.textContent || tmp.innerText || '')
          .replace(/\n+/g, ',')
          .replace(/\s\s+/g, '')
          .replace(/,,+/g, ',')
          .replace(/^[,]+/g, '')
          .replace(/[,]+$/g, '')
          .replace(/,+/g, ', ')

        let nominatorName = f.nominatorDetail
          .match(/<strong>(.*?)<\/strong>/g)
          .map(function (val) {
            return val.replace(/<\/?r>/g, '')
          })
        tmp = document.createElement('DIV')
        tmp.innerHTML = nominatorName[0]
        nominatorName = tmp.textContent || tmp.innerText || ''

        let donorDetail = ''
        let donorEmail = ''
        if (this.options.showDonor) {
          donorDetail = 'Not Allocated'
          if (f.allocatedTo) {
            const familyDonor = this.allDonorsData.find(
              (d) => d.requestId == f.allocatedTo
            )
            if (familyDonor?.requestId) {
              donorDetail = `${familyDonor.firstName} ${familyDonor.lastName}`
              donorEmail = `${familyDonor.email ? familyDonor.email : ''}`
            }
          }
        }
        let allocationStatus = 'Unallocated'

        switch (f.status) {
          case 'allocated-sent':
          case 'allocated-unconfirmed':
            allocationStatus = 'Allocated - Unconfirmed'
            break
          case 'allocated-confirmed':
            allocationStatus = 'Allocated - Confirmed'
            break
          case 'allocated-unconfirmed':
            allocationStatus = 'Allocated - Unconfirmed'
            break
          case 'unallocated':
          default:
            allocationStatus = 'Unallocated'
            break
        }

        const returnRow = [
          `"${f.reference}"`,
          `"${nominatorName}"`,
          `"${familyDetail}"`,
          `"${f.totalUnit}"`,
        ]

        if (this.options.showDonor) {
          returnRow.push(`"${donorDetail}"`)
          returnRow.push(`"${donorEmail}"`)
          returnRow.push(`"${allocationStatus}"`)
        }

        return returnRow
      })
      rows.push(...data)

      let csvContent =
        'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n')

      var encodedUri = encodeURI(csvContent)
      // window.open(encodedUri);
      /* */
      var link = document.createElement('a')
      link.setAttribute('href', encodedUri)
      link.setAttribute(
        'download',
        `${
          this.organisation.reference ? this.organisation.reference + '-' : ''
        }families-list.csv`
      )
      document.body.appendChild(link) // Required for FF

      link.click()
      link.remove()
      /* */
    },
    async handleEdit(i, r) {
      this.editFamilyData = r
      this.openModal('update')
      // this.$router.push(`/donors/view/${r.requestId}`);
    },
    async handleDelete(i, r) {
      const updateRes = await deleteFamily(r.requestId)
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
    async handleCustomAction(i, k, r) {
      switch (k) {
        case 'viewOrganisation':
          this.$router.push(`/organisations/view/${r.organisationId}`)
          break
        case 'splitFamily':
          this.currentNominator = this.allNominators.find(
            (n) => n.requestId === r.nominatorId
          )
          this.familyData = r
          this.familyData.members = this.familyMemberData.filter(
            (m) => m.familyId === this.familyData.requestId
          )
          this.openModal('split')
          break
        case 'resetReferences':
          /* */
          if (r.nominatorId) {
            const res = await fixReferences({ nominatorId: r.nominatorId })
            if (res.status == 200) {
              this.$router.go()
            } else {
              if (res?.data?.messages) {
                this.messages = Object.keys(res?.data?.messages).map((k) => ({
                  error: res?.data?.messages[k],
                }))
              }
            }
          } else {
            this.messages.push({
              error: 'An unexpected error has occurred.',
            })
          }
          /* */
          break
        default:
          this.$emit(k, i, r)
          break
      }
    },
    handleEventBusEvent(requestId) {
      const nominator = this.tableData.find((n) => n?.requestId === requestId)

      if (nominator?.requestId) {
        // this.approveNom(nominator);
      }
    },
    doSplitFamilies(families) {
      this.tableData = [...this.tableData, ...families]
      this.createKey = !this.createKey

      Swal.fire({
        title: 'Success',
        text: 'This family was split successfully.',
        timer: 3000,
        showConfirmButton: false,
      })

      this.orgFamiliesTotal += families.lenght
      this.closeModal('split')
    },
    saveFamilies(families) {
      this.tableData = [...this.tableData, ...families]
      this.createKey = !this.createKey

      Swal.fire({
        title: 'Success',
        text: 'Your family was saved successfully.',
        timer: 3000,
        showConfirmButton: false,
      })

      this.orgFamiliesTotal++
      if (!this.maxFamilysCheck) {
        this.closeModal('create')
      }
    },
    updateFamilies({ families, update = false }) {
      if (update) {
        const newTableData = [...this.tableData]
        for (const [k, f] of families.entries()) {
          var foundIndex = newTableData.findIndex(
            (td) => td.requestId === f.requestId
          )
          newTableData[foundIndex] = f
        }
        this.tableData = [...newTableData]
      } else {
        this.tableData = [...this.tableData, ...families]
      }
      this.createKey = !this.createKey

      Swal.fire({
        title: 'Success',
        text: 'Your family was saved successfully.',
        timer: 3000,
        showConfirmButton: false,
      })

      this.orgFamiliesTotal++
      this.closeModal('update')
    },
    splitFamilies(families) {
      this.tableData = [...this.tableData, ...families]
      this.createKey = !this.createKey

      Swal.fire({
        title: 'Success',
        text: 'Your family was saved successfully.',
        timer: 3000,
        showConfirmButton: false,
      })

      this.orgFamiliesTotal++
      if (!this.maxFamilysCheck) {
        this.closeModal('create')
      }
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`
      }
    },
  },
  async mounted() {
    if (!this.userInGroup('admin') && !this.userInGroup('teamlead')) {
      // this.$router.push("/");
    }

    this.allNominatorsData = this.allNominators
    this.currentNominator = this.nominator

    let res = {}
    if (!this.data || typeof this.data != 'object') {
      if (this.organisation.requestId) {
        res = await getFamilyByOrganisation(this.organisation.requestId)
        this.tableData = Object.values(res?.data?.families)
        this.familyMemberData = Object.values(res?.data?.members)
      } else if (this.userInGroup('admin')) {
        res = await getFamilies()
        this.tableData = Object.values(res?.data)
      }
    } else {
      this.tableData = this.data
    }

    this.$emit('resultData', 'families', this.tableData)
    this.isLoading = false

    var valueArr = this.tableData.map(function (item) {
      return item.reference
    })
    valueArr.some((item, idx) => {
      if (valueArr.indexOf(item) != idx) {
        this.duplicateReferences.push(valueArr[valueArr.indexOf(item)])
      }
      return false
    })
    if (this.isJamie()) {
      if (this.duplicateReferences.length) {
        this.fallBackSubHeading = `Duplicate references: ${this.duplicateReferences.join()}`
      } else {
        this.fallBackSubHeading = 'No duplicates references found'
      }
    }

    if (this.options.showDonor && this.userInGroup('admin')) {
      const donorsRequest = await getDonors()
      this.allDonorsData = Object.values(donorsRequest.data)

      this.tableData.map((o) => {
        if (this.options.showDonor) {
          let donorDetail = 'Not Allocated'
          if (o.allocatedTo) {
            const familyDonor = this.allDonorsData.find(
              (d) => d.requestId == o.allocatedTo
            )
            if (familyDonor?.requestId) {
              donorDetail = `
                <strong>${familyDonor.firstName} ${
                familyDonor.lastName
              }</strong>${
                familyDonor.telephone ? ' - ' + familyDonor.telephone : ''
              }<br />
                ${familyDonor.company ? familyDonor.company + '<br />' : ''}
                ${familyDonor.email ? familyDonor.email + '<br />' : ''}
                <a href="/donors/view/${
                  familyDonor.requestId
                }" class="btn btn-info btn-fill btn-wd">Manage Donor</a>
              `
            }
          }
          o.donorDetail = donorDetail
        }
        return true
      })
    }

    this.tableData.map((o) => {
      o.fullName = `${o.firstName} ${o.lastName}`
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
