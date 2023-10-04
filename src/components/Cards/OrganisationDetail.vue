<template>
  <card class="nominators-list">
    <template slot="header">
      <h4 class="card-title">
        Team Leads

        <button
          v-if="checkRole('admin')"
          type="submit"
          class="btn btn-fill btn-wd pull-right"
          :class="!createMode ? 'btn-info' : ''"
          @click.prevent="switchAdminMode"
        >
          {{ !createMode ? "Add new admin" : "Cancel" }}
        </button>
      </h4>
    </template>
    <div class="spinner-border text-muted" role="status" v-if="isLoading">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-if="!isLoading && !createMode" :class="!paginate ? 'pb-4' : ''">
      <div
        class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
      >
        <el-select
          v-if="paginate"
          class="select-default mb-3"
          style="width: 200px"
          v-model="pagination.perPage"
          placeholder="Per page"
        >
          <el-option
            class="select-default"
            v-for="item in pagination.perPageOptions"
            :key="item"
            :label="item"
            :value="item"
          >
          </el-option>
        </el-select>
        <el-input
          v-if="allowSearch"
          type="search"
          class="mb-3"
          style="width: 200px"
          placeholder="Search records"
          v-model="searchQuery"
          aria-controls="datatables"
        />
      </div>
      <div class="col-sm-12">
        <el-table stripe style="width: 100%" :data="queriedData" border>
          <el-table-column
            v-for="column in tableColumns"
            :key="column.label"
            :min-width="column.minWidth"
            :prop="column.prop"
            :label="column.label"
          >
            <template slot-scope="col">
              <div class="row" v-if="column.prop == 'nominatorDetail'">
                <div
                  class="col-12"
                  :class="!col.row.emailSent ? 'col-xl-7' : ''"
                >
                  <span class="nominatorName">
                    <strong>
                      {{ col.row["firstName"] }}
                      {{ col.row["lastName"] }}
                    </strong>
                    -
                    <a :href="`tel:${col.row['telephoneNumber']}`">{{
                      col.row["telephoneNumber"]
                    }}</a>
                  </span>
                  <span class="nominatorEmail" v-if="col.row['emailAddress']">
                    <a :href="`mailto:${col.row['emailAddress']}`">{{
                      col.row["emailAddress"]
                    }}</a>
                  </span>
                </div>
                <div
                  class="col-12 always-show"
                  :class="!col.row.emailSent ? 'col-xl-5' : ''"
                >
                  <button
                    type="submit"
                    class="btn btn-info btn-fill pull-right w-100 mt-3"
                    @click.prevent="openModal('families')"
                    v-if="!col.row.emailSent"
                  >
                    Send Welcome Email
                  </button>
                </div>
              </div>
              <div v-else>{{ col.row[column.prop] }}</div>
            </template>
          </el-table-column>
          <!--
          <el-table-column :min-width="75" fixed="right" label="Actions">
            <template slot-scope="props">
              <a
                v-if="!props.row.emailSent"
                v-tooltip.top-center="'Send Welcome Email'"
                class="btn-warning btn-simple btn-link"
                @click="sendWelcome(props.$index, props.row)"
                ><i class="fa fa-edit"></i>Send Welcome Email</a
              >
              <span v-else><strong>Email Sent</strong></span>
            </template>
          </el-table-column>
          -->
        </el-table>
      </div>
    </div>
    <div
      v-if="!isLoading && !createMode && paginate"
      slot="footer"
      class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
    >
      <div>
        <p class="card-category">
          Showing {{ from + 1 }} to {{ to }} of {{ total }} entries
        </p>
      </div>
      <l-pagination
        class="pagination-no-border"
        v-model="pagination.currentPage"
        :per-page="pagination.perPage"
        :total="pagination.total"
      >
      </l-pagination>
    </div>
    <div v-if="!isLoading && createMode">
      <div class="col-12 pt-4">
        <form>
          <div class="row">
            <div class="col-md-3">
              <fg-input type="text" label="Firstname" v-model="model.firstName">
              </fg-input>
            </div>
            <div class="col-md-3">
              <fg-input type="text" label="Lastname" v-model="model.lastName">
              </fg-input>
            </div>
            <div class="col-md-3">
              <fg-input type="text" label="Telephone" v-model="model.telephone">
              </fg-input>
            </div>
            <div class="col-md-3">
              <fg-input type="text" label="Email" v-model="model.email">
              </fg-input>
            </div>
          </div>

          <div>
            <button
              type="submit"
              class="btn btn-info btn-fill btn-wd"
              @click.prevent="createAdmin"
            >
              Create Admin
            </button>
          </div>
          <div class="clearfix"></div>
        </form>
      </div>
    </div>
  </card>
</template>
<script>
import { Table, TableColumn, Select, Option } from "element-ui";
import {
  getOrganisationAdmins,
  createOrganisationAdmin,
} from "@/api/organisations.api";

import Fuse from "fuse.js";

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
  },
  props: {
    organisationId: {
      type: String,
      default: "",
    },
    paginate: {
      type: Boolean,
      default: true,
    },
    allowSearch: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      model: {
        email: "",
        telephone: "",
        firstName: "",
        lastName: "",
      },
      createMode: false,
      isLoading: true,
      tableColumns: [
        {
          prop: "nominatorDetail",
          label: "User Details",
        },
      ],
      tableData: [],
      pagination: {
        perPage: 25,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0,
      },
      searchQuery: "",
      propsToSearch: [
        "companyName",
        "firstName",
        "lastName",
        "email",
        "families",
      ],
      fuseSearch: null,
    };
  },
  computed: {
    queriedData() {
      let result = this.tableData;
      if (this.searchQuery !== "") {
        result = this.fuseSearch.search(this.searchQuery);
        this.paginationTotal(result.length);
      }

      return result.length ? result.slice(this.from, this.to) : result;
    },
    to() {
      let highBound = this.from + this.pagination.perPage;
      if (this.total < highBound) {
        highBound = this.total;
      }
      return highBound;
    },
    from() {
      return this.pagination.perPage * (this.pagination.currentPage - 1);
    },
    total() {
      this.paginationTotal(this.tableData.length);
      return this.tableData.length;
    },
    isMobile() {
      const style = getComputedStyle(document.body);
      const width = window.innerWidth;
      const md = style
        .getPropertyValue("--breakpoint-md")
        .replace("px", "")
        .trim();
      return width <= parseInt(md);
    },
  },
  async mounted() {
    if (this.userInGroup("admin") || this.userInGroup("teamlead")) {
      this.getListData();
      this.isLoading = false;
    }

    this.fuseSearch = new Fuse(this.tableData, { keys: ["name", "email"] });
  },
  methods: {
    checkRole(role) {
      return this.userInGroup(role);
    },
    async getListData() {
      if (this.organisationId) {
        const res = {}; // await getOrganisationAdmins(this.organisationId);
        this.tableData = Object.values(res.data);
      }
    },
    paginationTotal(value) {
      this.pagination.total = value;
    },
    switchAdminMode() {
      this.createMode = !this.createMode;
    },
    async createAdmin() {
      const res = await createOrganisationAdmin(this.organisation.requestId, {
        email: this.orgAdmin.email,
        telephone: this.orgAdmin.telephone,
        firstname: this.orgAdmin.firstName,
        lastname: this.orgAdmin.lastName,
      });
      // console.log(res);
      if (res.data.success) {
        this.switchAdminMode();
        this.orgAdmin.email = "";
        this.orgAdmin.telephone = "";
        this.orgAdmin.firstName = "";
        this.orgAdmin.lastName = "";
      } else {
        //Handle Error
      }
    },
  },
};
</script>
<style lang="scss" scoped>
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
</style>
