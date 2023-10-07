<template>
  <div class="row">
    <div class="col-12">
      <card title="Admin Users">
        <div>
          <div
            class="col-12 d-flex justify-content-center justify-content-sm-start flex-wrap"
          >
            <div class="mb-3 mr-3">
              <span class="text-muted small d-block py-1 px-2">Per Page</span>
              <el-select
                class="select-default"
                style="width: auto"
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
            </div>
          </div>

          <div class="col-sm-12 mb-3 ml-auto">
            <el-input
              type="search"
              style="width: 100%"
              placeholder="Search records"
              v-model="searchQuery"
              aria-controls="datatables"
            />
          </div>

          <div
            class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
          >
            <div class="">
              <p class="card-category pb-2">
                Showing {{ from + 1 }} to {{ to }} of {{ total }} entries
              </p>
            </div>
          </div>
          <div class="col-sm-12">
            <el-table
              stripe
              style="width: 100%"
              :data="queriedData"
              @row-click="handleEdit(0, $event)"
              border
            >
              <el-table-column
                v-for="column in tableColumns"
                :key="column.label"
                :min-width="column.minWidth"
                :prop="column.prop"
                :label="column.label"
                :formatter="cellValueRenderer"
              >
              </el-table-column>
              <el-table-column :min-width="75" fixed="right" label="Actions">
                <template slot-scope="props">
                  <div class="text-center">
                    <!--
                    <a
                      v-tooltip.top-center="'Edit'"
                      class="btn-warning btn-simple btn-link"
                      @click="handleEdit(props.$index, props.row)"
                      ><i class="fa fa-edit"></i
                    ></a>
                    -->
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
          slot="footer"
          class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
        >
          <div class="">
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
    </div>
  </div>
</template>
<script>
import Vue from "vue";
import { Table, TableColumn, Select, Option } from "element-ui";
import { Pagination as LPagination } from "src/components/index";
import { getAdminUsers, deleteAdmin } from "@/api/users.api";
import Fuse from "fuse.js";
import Swal from "sweetalert2";
import { MessageBox } from "element-ui";

Vue.prototype.$confirm = MessageBox.confirm;

export default {
  components: {
    LPagination,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
  },
  data() {
    return {
      organisationId: "7a933343-0343-457b-91bf-c0f9da8d9d7b",
      pagination: {
        perPage: 25,
        currentPage: 1,
        perPageOptions: [25, 50, 100],
        total: 0,
      },
      searchQuery: "",
      propsToSearch: ["email", "firstName", "lastName", "status"],
      tableColumns: [
        {
          prop: "email",
          label: "Email Address",
          minWidth: 200,
        },
        {
          prop: "firstName",
          label: "First Name",
          minWidth: 100,
        },
        {
          prop: "lastName",
          label: "Last Name",
          minWidth: 100,
        },
        {
          prop: "status",
          label: "Status",
          minWidth: 120,
        },
      ],
      tableData: [],
      fuseSearch: null,
    };
  },
  computed: {
    pagedData() {
      return this.tableData.length
        ? this.tableData.slice(this.from, this.to)
        : this.tableData;
    },
    /***
     * Searches through table data and returns a paginated array.
     * Note that this should not be used for table with a lot of data as it might be slow!
     * Do the search and the pagination on the server and display the data retrieved from server instead.
     * @returns {computed.pagedData}
     */
    queriedData() {
      let result = this.tableData;
      if (this.searchQuery !== "" && this.fuseSearch) {
        let fsr = this.fuseSearch.search(this.searchQuery);
        // Filter out the lower matches
        fsr = fsr.filter((d) => d.score <= 0.01);
        //Format into how we need it
        result = Object.keys(fsr).map(function (key) {
          return { ...fsr[key].item };
        });
      }
      result = result.sort((a, b) =>
        a.lastName > b.lastName ? 1 : b.lastName > a.lastName ? -1 : 0
      );
      this.paginationTotal(result.length);
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
      // this.paginationTotal(this.tableData.length);
      return this.pagination.total;
    },
  },
  methods: {
    cellValueRenderer(row, column, cellValue, index) {
      let value = cellValue;
      if (typeof row[column.property] === "boolean") {
        value = cellValue ? "Yes" : "No";
      }
      return value;
    },
    handleEdit(index, row) {
      return false; // this.$router.push(`/subscribers/view/${row.requestId}`);
    },
    handleDelete(index, row) {
      let indexToDelete = this.tableData.findIndex(
        (tableRow) => tableRow.id === row.id
      );
      if (indexToDelete >= 0) {
        this.tableData.splice(indexToDelete, 1);
      }
    },
    paginationTotal(value) {
      this.pagination.total = value;
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
          const updateRes = await deleteAdmin(this.organisationId, r.email);

          if (updateRes.data?.messages) {
            this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
              error: updateRes?.data?.messages[k],
            }));
          }
          if (updateRes?.status === 200) {
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
  async mounted() {
    const tableData = await getAdminUsers();
    this.tableData = Object.values(tableData.data);

    this.fuseSearch = new Fuse(this.tableData, {
      keys: ["email", "firstName", "lastName"],
      includeScore: true,
    });
  },
};
</script>
<style></style>
