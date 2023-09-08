<template>
  <card class="nominators-list">
    <template slot="header">
      <h4 class="card-title">
        Nominators

        <!--
        <button
          v-if="checkRole('admin')"
          type="submit"
          class="btn btn-fill btn-wd pull-right"
          :class="!createMode ? 'btn-info' : ''"
          @click.prevent="switchAdminMode"
        >
          {{ !createMode ? "Add new admin" : "Cancel" }}
        </button>
        -->
      </h4>
    </template>
    <div class="spinner-border text-muted" role="status" v-if="isLoading">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-if="!isLoading" :class="!paginate ? 'pb-4' : ''">
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
              <div
                v-if="column.prop == 'nominatorDetail'"
                :class="col.row.status == 'Approved' ? '' : 'unauthorised'"
              >
                <div class="row">
                  <div
                    class="col-12"
                    :class="col.row.status != 'Approved' ? 'col-xl-7' : ''"
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
                  Yes
                </div>

                <div
                  class="row always-show"
                  v-if="col.row.status != 'Approved' && allowAuthorise"
                >
                  <div class="col-12">
                    <button
                      type="submit"
                      class="btn btn-info btn-fill pull-right w-100 mt-3"
                      @click.prevent="approveNom(col.row)"
                      v-if="col.row.status != 'Approved'"
                    >
                      Authorise
                    </button>
                  </div>
                </div>
              </div>
              <div v-else>{{ col.row[column.prop] }}</div>
            </template>
          </el-table-column>
          <el-table-column
            :min-width="75"
            fixed="right"
            label="Actions"
            v-if="allowDelete"
          >
            <template slot-scope="props">
              <div class="text-center">
                <a
                  v-tooltip.top-center="'Delete'"
                  class="btn-danger btn-simple btn-link"
                  @click="handleDeleteAdmin(props.$index, props.row)"
                  ><i class="fa fa-times"></i
                ></a>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div
      v-if="!isLoading && paginate"
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
  </card>
</template>
<script>
import Vue from "vue";
import { Table, TableColumn, Select, Option } from "element-ui";
import { getNominators, approveNominator } from "@/api/nominators.api";
import { Pagination as LPagination } from "src/components/index";
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
    LPagination,
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
    allowDelete: {
      type: Boolean,
      default: true,
    },
    allowAuthorise: {
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
  },
  async mounted() {
    if (this.userInGroup("admin") || this.userInGroup("teamlead")) {
      this.getListData();
      this.isLoading = false;
    }

    this.fuseSearch = new Fuse(this.tableData, { keys: ["name", "email"] });
  },
  methods: {
    async approveNom(nominator) {
      const resApprove = await approveNominator(
        nominator.requestId,
        this.organisationId
      );
      if (resApprove.status == 200) {
        nominator.status = "Approved";
      }
    },
    checkRole(role) {
      return this.userInGroup(role);
    },
    async getListData() {
      if (!this.organisationId && !this.checkRole("admin")) {
        return false;
      } else {
        const res = {}; // await getNominators(this.organisationId ?? false);
        this.tableData = Object.values(res.data);

        this.$emit("resultData", "nominators", this.tableData);
      }
    },
    paginationTotal(value) {
      this.pagination.total = value;
    },
    switchAdminMode() {
      this.createMode = !this.createMode;
    },
    async createAdmin() {
      return false;
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
