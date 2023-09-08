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
              <div class="container">
                <div class="row" v-if="column.prop == 'nominatorDetail'">
                  <div class="col-12">
                    <span class="nominatorName">
                      <strong>
                        {{ col.row["firstName"] }}
                        {{ col.row["lastName"] }}
                      </strong>
                      <span v-if="col.row['telephoneNumber']">- </span>
                      <a
                        v-if="col.row['telephoneNumber']"
                        :href="`tel:${col.row['telephoneNumber']}`"
                        >{{ col.row["telephoneNumber"] }}</a
                      >
                    </span>
                    <span class="nominatorEmail" v-if="col.row['emailAddress']">
                      <a :href="`mailto:${col.row['emailAddress']}`">{{
                        col.row["emailAddress"]
                      }}</a>
                    </span>
                  </div>
                  <div v-if="!col.row.emailSent" class="col-12 always-show">
                    <button
                      type="submit"
                      class="btn btn-info btn-fill pull-right w-100 mt-3 mt-xl-0"
                      @click.prevent="sendWelcome(0, col.row)"
                      v-if="!col.row.emailSent"
                    >
                      Send Welcome Email
                    </button>
                  </div>
                </div>
                <div v-else>{{ col.row[column.prop] }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :min-width="75"
            fixed="right"
            label="Actions"
            v-if="checkRole('admin')"
          >
            <template slot-scope="props">
              <div class="text-center">
                <a
                  v-if="props.row['emailAddress'] != currentUsersEmail"
                  v-tooltip.top-center="'Delete'"
                  class="btn-danger btn-simple btn-link"
                  @click="handleDeleteAdmin(props.$index, props.row)"
                  ><i class="fa fa-times"></i
                ></a>
              </div>
            </template>
          </el-table-column>
          <!--
          <el-table-column :min-width="120" fixed="right" label="Actions">
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
            <div class="col-md-6">
              <fg-input type="text" label="Firstname" v-model="model.firstName">
              </fg-input>
            </div>
            <div class="col-md-6">
              <fg-input type="text" label="Lastname" v-model="model.lastName">
              </fg-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <fg-input type="text" label="Email" v-model="model.email">
              </fg-input>
            </div>
          </div>
          <div class="row">
            <div class="col-md-12">
              <fg-input type="text" label="Telephone" v-model="model.telephone">
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
import Vue from "vue";
import { Table, TableColumn, Select, Option } from "element-ui";
import {
  getOrganisationAdmins,
  createOrganisationAdmin,
} from "@/api/organisations.api";
import { sendNominatorAdminEmail, createNominator } from "@/api/nominators.api";
import { deleteUser } from "@/api/users.api";

import Fuse from "fuse.js";
import Swal from "sweetalert2";
import { MessageBox } from "element-ui";

Vue.prototype.$confirm = MessageBox.confirm;

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
          minWidth: 250,
        },
      ],
      tableData: [],
      pagination: {
        perPage: 5,
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
    currentUsersEmail() {
      return this.$store.getters.usersEmail;
    },
    queriedData() {
      let result = this.tableData;
      if (this.searchQuery !== "") {
        result = this.fuseSearch.search(this.searchQuery);
        this.paginationTotal(result.length);
      }

      return result.length && this.paginate
        ? result.slice(this.from, this.to)
        : result;
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
    platformData() {
      return this.$store.getters.getPlatformData;
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
    async sendWelcome(i, u) {
      u.emailSent = true;
      const sent = await sendNominatorAdminEmail(u.requestId);
      if (sent.status !== 200) {
        u.emailSent = false;
      } else {
        Swal.fire({
          title: "Success",
          text: "Welcome email sent successfully.",
          timer: 3000,
          showConfirmButton: false,
        });
      }
    },
    checkRole(role) {
      return this.userInGroup(role);
    },
    async getListData() {
      if (this.organisationId) {
        this.tableData = await this.platformData?.nominators
          .filter(
            (n) => n?.GSI3PK === this.organisationId && n?.type === "team-lead"
          )
          .map((n) => ({
            requestId: n?.GSI2PK ?? "",
            organisationId: n?.GSI3PK,
            emailAddress: n?.nominatorDetails?.email ?? "",
            telephoneNumber: n?.nominatorDetails?.telephone ?? "",
            firstName: n?.nominatorDetails?.firstName ?? "",
            lastName: n?.nominatorDetails?.lastName ?? "",
            emailSent: n?.emailVerification?.sent ?? false,
          }));

        this.$emit("resultData", "teamLeads", this.tableData);
      }
    },
    paginationTotal(value) {
      this.pagination.total = value;
    },
    switchAdminMode() {
      this.createMode = !this.createMode;
    },
    async createAdmin() {
      this.isLoading = true;
      const res = await createNominator({
        organisationId: this.organisationId,
        email: this.model.email,
        telephone: this.model.telephone,
        firstname: this.model.firstName,
        lastname: this.model.lastName,
      });
      // console.log(res);
      if (res.data.success) {
        this.switchAdminMode();

        this.tableData.push({
          requestId: res.data.adminId ?? "",
          organisationId: this.organisationId,
          emailAddress: this.model.email,
          telephoneNumber: this.model.telephone,
          firstName: this.model.firstName,
          lastName: this.model.lastName,
          emailSent: false,
        });

        this.model.email = "";
        this.model.telephone = "";
        this.model.firstName = "";
        this.model.lastName = "";

        /* *
        {"0":{"lastName":"Buckell","organisationId":"a2321430-7059-4064-859b-7f2097a546fc","status":"Approved","isAdmin":"true","telephoneNumber":"0191 123 4567","firstName":"Laura","requestId":"4edf0011-379b-433b-8631-adaf9975b069","emailAddress":"laurabuckell24+org@gmail.com","userReference":"LB","emailSent":false,"cognitoId":"","dateSubmitted":"2022-09-05 21:33:24"}}
        /* */
      } else {
        //Handle Error
      }
      this.isLoading = false;
    },
    async handleDeleteAdmin(i, r) {
      await Swal.fire({
        title: "Are you sure?",
        text: `If you delete this user, the process cannot be undone.`,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn btn-success btn-fill",
        cancelButtonClass: "btn btn-danger btn-fill",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        buttonsStyling: false,
      }).then(async (d) => {
        if (d?.isConfirmed && !d?.isDismissed) {
          const updateRes = await deleteUser(
            this.organisationId,
            r.emailAddress
          );
          if (updateRes?.status != 200 && updateRes?.data?.messages) {
            this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
              error: updateRes?.data?.messages[k],
            }));
          } else {
            let indexToDelete = this.tableData.findIndex(
              (tableRow) => tableRow.requestId === r.requestId
            );
            if (indexToDelete >= 0) {
              this.tableData.splice(indexToDelete, 1);
            }
          }
        }
      });
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
