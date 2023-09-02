<template>
  <div>
    <div class="row" v-if="messages.length">
      <div class="col-12">
        <l-alert type="danger" v-for="(m, i) in messages" :key="i">
          <span> {{ getErrorMessage(m) }}</span>
        </l-alert>
      </div>
    </div>
    <div class="container" v-if="hasTelephone">
      <div class="row" v-if="nominationsClosed">
        <div class="col-12">
          <l-alert type="danger">
            <span>
              The Nomination period has now closed. Please contact
              <a href="mailto:hampers@cause-foundation.org.uk"
                >hampers@cause-foundation.org.uk</a
              >
              for more information.</span
            >
          </l-alert>
        </div>
      </div>
      <div class="row">
        <div class="col-12" :class="checkRole('teamlead') ? ' col-md-6' : ''">
          <card>
            <div
              class="spinner-border text-muted"
              role="status"
              v-if="isLoading.organisation"
            >
              <span class="sr-only">Loading...</span>
            </div>
            <div slot="header" v-if="!isLoading.organisation">
              <h4 class="title m-0">
                {{ organisation.reference }} - {{ organisation.name }}
              </h4>
            </div>
            <div v-if="organisation.urlHash && checkRole('teamlead')">
              <p>
                As a Team Lead for your team/organisation, you have the ability
                to create families yourself and/or authorise registered
                nominators.<br />
                Nominators can register themselves via the link below and
                immediately start nominating families.
              </p>
              <p>
                <strong>Registration URL:</strong><br />
                <span class="url-display text-monospace text-muted">{{
                  getURL()
                }}</span>
                -
                <a
                  href="#"
                  @click.stop="copyURL()"
                  class="btn btn-info btn-fill"
                  >Copy URL</a
                >
                <Transition
                  ><i
                    v-if="urlCopied"
                    class="nc-icon nc-check-2 copy-success"
                  ></i
                ></Transition>
              </p>
              <p>
                <strong
                  >You must authorise nominators for their families to be
                  valid!</strong
                >
              </p>
            </div>
          </card>
        </div>
        <div class="col-12 col-md-6" v-if="checkRole('teamlead')">
          <NominatorsList
            v-if="organisationId"
            :organisationId="organisationId"
            :paginateOptions="nominatorPagination"
            :searchKeys="[]"
            :options="nominatorListOptions"
            @resultData.once="setModelData"
          />
        </div>
      </div>
      <div class="row" v-if="checkRole('teamlead') || checkRole('nominator')">
        <div class="col-12">
          <FamiliesList
            v-if="organisation.requestId"
            heading="Families"
            subHeading=" "
            :organisation="organisation"
            :nominator="nominator"
            :options="familyListOptions"
            :allNominators="allNominators"
            :paginateOptions="familiesPagination"
          />
        </div>
      </div>
    </div>
    <div class="container" v-else>
      <div class="row">
        <div class="col-12">
          <card>
            <div slot="header">
              <h4 class="title m-0">Missing Telephone</h4>
            </div>
            <div>
              <p>
                It looks like your contact telephone number is either missing or
                invalid. Please correct it below to continue.
              </p>
              <fg-input
                label="telephoneNumber"
                type="text"
                placeholder="Enter your telephone number"
                v-model="nominatorData.telephoneNumber"
              >
              </fg-input>
              <button
                type="submit"
                class="btn btn-fill btn-info"
                @click.prevent="updateTelephoneNumber"
              >
                Save
              </button>
            </div>
          </card>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { Dialog, Table, TableColumn, Select, Option } from 'element-ui'

import { getOrganisationByRequest } from '@/api/organisations.api'
import { updateNominator } from '@/api/nominators.api'
import { getMeData } from '@/api/users.api'
import NominatorsList from '@/pages/Nominators/List.vue'
import FamiliesList from '@/pages/Families/List.vue'
import LAlert from 'src/components/Alert'

export default {
  components: {
    [Dialog.name]: Dialog,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    NominatorsList,
    FamiliesList,
    LAlert,
  },
  data() {
    return {
      hasTelephone: true,
      nominatorData: {},
      urlCopied: false,
      familyListOptions: {
        create: true,
        update: false,
        delete: true,
        download: true,
        search: false,
        showDonor: false,
      },
      nominatorListOptions: {
        create: false,
        update: true,
        delete: true,
        download: true,
        authorise: true,
        highlight: {
          unauthorised: true,
          admin: true,
        },
      },
      model: {
        teamLeads: [],
        nominators: [],
        families: [],
      },
      isLoading: {
        organisation: true,
        teamLeads: true,
        nominators: true,
        families: true,
      },
      modals: {
        families: false,
      },
      organisationId: '',
      orgAdminEmail: '',
      baseUrl: this.$hostname,
      nominator: {
        requestId: '',
        userReference: '',
      },
      nominatorPagination: {
        perPage: false,
      },
      familiesPagination: {
        perPage: false,
      },
      organisation: {
        requestId: '',
        urlHash: '',
        name: '',
        reference: '',
        referenceSet: false,
        contacts: {
          lead: {
            name: '',
            number: '',
            email: '',
          },
          secondary: {
            name: '',
            number: '',
            email: '',
          },
        },
        familiesLimit: 0,
        familiesTotal: 0,
        status: '',
      },
      tableColumns: [
        {
          prop: 'nominatorDetail',
          label: 'Nominator Details',
        },
      ],
      tableColumnsFamilies: [
        {
          prop: 'reference',
          label: 'Hamper ID',
          minWidth: 75,
        },
        {
          prop: 'totalUnit',
          label: 'Family Members',
        },
        {
          prop: 'status',
          label: 'Status',
          minWidth: 75,
        },
      ],
      tableData: [],
      tableDataFamilies: [],
      messages: [], //[{ error: "There has been an error!" }]
    }
  },
  computed: {
    nominationsClosed() {
      const closingDate = new Date('2022-10-05')
      closingDate.setHours(18, 0, 0, 0)
      const now = new Date()

      return !this.allowedOrganisations && closingDate < now
    },
    allowedOrganisations() {
      return this.organisationId == '1c0ab939-458f-4bf7-9d46-4b52094d8a60'
    },
    queriedData() {
      let result = this.tableData

      result.map((o) => {
        o.families = Math.floor(Math.random() * (16 - 0 + 1) + 0)
        o.authorised = o.status == 'Approved' ? true : false
        return true
      })
      return result
    },
    queriedDataFamilies() {
      let result = this.tableDataFamilies
      result.map((o) => {
        o.status = o.status && o.status != '' ? o.status : 'Unassigned'
        return true
      })
      result.sort((a, b) =>
        b.reference > a.reference ? 1 : a.reference > b.reference ? -1 : 0
      )
      return result
    },
    unauthorisedNominators() {
      return Object.values(this.model.nominators)
        .filter((n) => n.status != 'Approved')
        .map((n) => n.requestId)
    },
    allNominators() {
      return this?.model?.nominators.length
        ? Object.values(this.model.nominators)
        : [this.nominator]
    },
  },
  methods: {
    async updateTelephoneNumber() {
      const regex = new RegExp(
        /^(((\+44\s?\d{4}|\(?0\d{4}\)?)\s?\d{3}\s?\d{3})|((\+44\s?\d{3}|\(?0\d{3}\)?)\s?\d{3}\s?\d{4})|((\+44\s?\d{2}|\(?0\d{2}\)?)\s?\d{4}\s?\d{4}))(\s?\#(\d{4}|\d{3}))?$/
      )
      if (!regex.test(this.nominatorData.telephoneNumber)) {
        this.messages = [{ error: 'Please enter a valid phone number.' }]
      } else {
        const res = await updateNominator({
          requestId: this.nominatorData.requestId,
          telephoneNumber: this.nominatorData.telephoneNumber,
        })
        if (res.data.success) {
          this.hasTelephone = true
        } else {
          if (res?.data?.messages) {
            this.messages = Object.keys(res?.data?.messages).map((k) => ({
              error: res?.data?.messages[k],
            }))
          }
        }
      }
    },
    copyURL() {
      navigator.clipboard.writeText(this.getURL())
      this.urlCopied = true
      setTimeout(() => {
        this.urlCopied = false
      }, 3000)
    },
    setModelData(type, data) {
      this.model[type] = data
    },
    saveFamilies(families) {
      this.tableDataFamilies = [...this.tableDataFamilies, ...families]
      this.closeModal('families')
    },
    cellValueRenderer(row, column, cellValue, index) {
      let value = cellValue
      if (typeof row[column.property] === 'boolean') {
        value = cellValue ? 'Yes' : 'No'
      }
      return value
    },
    openModal(name) {
      this.modals[name] = true
    },
    closeModal(name) {
      this.modals[name] = false
    },
    checkRole(role) {
      return this.userInGroup(role)
    },
    updateRef() {
      if (!this.organisation.referenceSet) {
        var matches = this.organisation.name.match(/\b(\w)/g)
        var acronym = matches.join('').toUpperCase()

        this.organisation.reference = acronym
      } else if (this.organisation.name == '') {
        this.organisation.referenceSet = false
        this.organisation.reference = ''
      }
    },
    manualRef() {
      this.organisation.referenceSet = true
    },
    getURL() {
      return `${this.baseUrl}/register/${this.organisation.requestId}/${this.organisation.urlHash}`
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`
      }
    },
  },
  async mounted() {
    if (!this.userInGroup('teamlead') && !this.userInGroup('nominator')) {
      // this.$router.push("/");
    }

    const userData = await getMeData()
    this.organisationId = userData?.data?.nominator?.organisationId
    if (userData?.data?.nominator) {
      this.nominator = userData.data.nominator
    }
    if (!this.organisationId) {
      // this.$router.push("/");
    }

    this.familyListOptions.create = !this.nominationsClosed

    this.nominatorData = userData?.data?.nominator
    this.hasTelephone = this.nominatorData?.telephoneNumber.length

    const organisationData = await getOrganisationByRequest(this.organisationId)

    this.organisation = {
      requestId: organisationData.data.requestId,
      urlHash: organisationData.data.urlHash,
      name: organisationData.data.name,
      reference: organisationData.data.reference,
      referenceSet: organisationData.data.reference !== '',
      contacts: {
        lead: {
          name: organisationData.data.leadContactName,
          number: organisationData.data.leadContactNumber,
          email: organisationData.data.leadContactEmail,
        },
        secondary: {
          name: organisationData.data.secondaryContactName,
          number: organisationData.data.secondaryContactNumber,
          email: organisationData.data.secondaryContactEmail,
        },
      },
      familiesLimit: organisationData.data.familiesLimit,
      familiesTotal: organisationData.data.familiesTotal,
      status: organisationData.data.status ?? '',
    }
    this.isLoading.organisation = false
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
.el-table__row {
  &.unauthorised {
    & > td {
      & > div {
        &:not(.always-show) {
          opacity: 0.3;
        }
      }
    }
  }
}
.url-display {
  font-size: 0.8rem;
  font-weight: 700;
  line-break: anywhere;
}
.copy-url {
  font-weight: 700;
}
</style>
