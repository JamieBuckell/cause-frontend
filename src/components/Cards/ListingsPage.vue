<template>
  <card class="listings-section">
    <template slot="header">
      <button
        type="submit"
        class="btn btn-info btn-fill btn-wd ml-3 pull-right"
        @click.prevent="downloadCSV()"
        v-if="!isLoading && canDownload()"
      >
        Download CSV
      </button>

      <drop-down
        class="btn-group download-dropdown pull-right"
        v-if="hasBulkActions"
      >
        <button
          slot="title"
          href="#"
          type="button"
          class="btn btn-fill btn-warning w-100 dropdown-toggle"
          data-toggle="dropdown"
        >
          Bulk Actions
          <span class="caret"></span>
        </button>
        <li
          class="pb-1 pt-2 px-3"
          v-for="(opt, i) in bulkActions"
          :key="i"
          :label="opt"
          :value="opt"
        >
          <a
            href="#"
            @click.prevent="handleBulkAction(queriedData, opt.emit)"
            >{{ opt.text }}</a
          >
        </li>
      </drop-down>
      <h4 class="card-title">
        <slot name="header"></slot>
      </h4>
    </template>
    <div class="spinner-border text-muted" role="status" v-if="isLoading">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-if="!isLoading" :class="!paginateOptions.perPage ? 'pb-4' : ''">
      <div class="row px-3 pb-3">
        <slot name="filters"></slot>
      </div>
      <div class="row px-3">
        <div
          v-if="searchEnabled"
          class="col-12 order-2 order-md-1"
          :class="paginateOptions.perPage ? 'col-md-9' : ''"
        >
          <span class="text-muted small d-block py-1 px-2">Search</span>
          <el-input
            type="search"
            class="mb-3 w-100"
            placeholder="Search records"
            v-model="searchQuery"
            @change="updateSearch"
            aria-controls="datatables"
          />
        </div>
        <div
          v-if="paginateOptions.perPage"
          class="col-12 col-md-3 order-1 order-md-2"
        >
          <span class="text-muted small d-block py-1 px-2">Per Page</span>
          <el-select
            class="select-default mb-3 w-100"
            v-model="pagination.perPage"
            @change="updatePagination()"
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
        <el-table stripe style="width: 100%" :data="queriedData" border>
          <el-table-column
            v-for="column in tableColumns"
            :key="column.label"
            :min-width="column.minWidth"
            :prop="column.prop"
            :component="column.component"
            :label="column.label"
          >
            <template slot-scope="col">
              <div :class="checkClasses(col.row)">
                <component
                  v-if="column.component"
                  :is="column.component"
                  :rowData="col.row"
                  :options="options"
                  @approve="
                    handleCustomAction(col.$index, 'approve', col.row, {})
                  "
                />
                <div
                  v-else-if="column.html == true"
                  v-html="col.row[column.prop]"
                ></div>
                <div v-else>{{ col.row[column.prop] }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :min-width="75"
            fixed="right"
            label="Actions"
            v-if="showActions"
          >
            <template slot-scope="props">
              <div class="container">
                <div class="row">
                  <a
                    v-tooltip.top-center="'Edit'"
                    class="col col-1 order-2 btn-warning btn-simple btn-link"
                    @click.stop="handleEdit(props.$index, props.row)"
                    v-if="canEdit(props.row)"
                    ><i class="fa fa-edit"></i
                  ></a>
                  <a
                    v-tooltip.top-center="'Delete'"
                    class="col col-1 order-3 btn-danger btn-simple btn-link"
                    @click.stop="handleDelete(props.$index, props.row)"
                    v-if="canDelete(props.row)"
                    ><i class="fa fa-times"></i
                  ></a>
                  <template v-if="hasCustomActions()">
                    <div
                      v-for="(action, i) in customActions"
                      :key="i"
                      class="col"
                      :class="action.icon ? 'col-1 order-1' : 'col-12 order-4'"
                    >
                      <component
                        v-if="checkActionCondition(props.row, action)"
                        :is="action.icon ? 'a' : 'button'"
                        :label="action.text"
                        :value="action.text"
                        v-tooltip.top-center="`${action.text}`"
                        @click.stop="
                          handleCustomAction(
                            props.$index,
                            action.emit,
                            props.row,
                            action
                          )
                        "
                        :class="
                          (action.icon
                            ? 'btn-simple btn-link'
                            : 'btn btn-fill btn-info w-100') +
                          (action.class ? ` ${action.class}` : '')
                        "
                      >
                        <i v-if="action.icon" :class="action.icon"></i>
                        <span v-else>{{ action.text }}</span>
                      </component>
                    </div>
                  </template>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <div
      v-if="!isLoading && paginateOptions.perPage"
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
import { Dialog, Table, TableColumn, Select, Option } from "element-ui";
import { Pagination as LPagination } from "src/components/index";
import Fuse from "fuse.js";
import Swal from "sweetalert2";
import { MessageBox } from "element-ui";
import NominatorDetail from "@/components/Cards/NominatorDetail";
import DonorDetail from "@/components/Cards/DonorDetail";

Vue.prototype.$confirm = MessageBox.confirm;

export default {
  components: {
    [Dialog.name]: Dialog,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    LPagination,
    NominatorDetail,
    DonorDetail,
  },
  props: {
    listingsData: {
      type: Array,
      default: () => [],
    },
    paginateOptions: {
      type: Object,
      default: () => ({
        perPage: 25,
        perPageOptions: [5, 10, 25, 50],
      }),
    },
    options: {
      type: Object,
      default: () => ({
        columns: [],
        searchKeys: [],
        modalMessages: {},
        create: false,
        edit: false,
        delete: false,
        download: false,
        authorise: false,
        highlight: {},
        search: true,
      }),
    },
    listingsType: {
      type: String,
      default: "default",
    },
    customActions: {
      type: Array,
      default: () => [],
    },
    bulkActions: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    const defaultPagination = {
      perPage: this.paginateOptions.perPage ?? 25,
      currentPage: 1,
      perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
      total: 0,
    };
    let pagination = this.$store.getters.getPaginationData(this.listingsType);
    if (!pagination) {
      this.$store.dispatch("setPaginationData", {
        type: this.listingsType,
        attributes: defaultPagination,
      });
      pagination = defaultPagination;
    }

    if (!pagination?.perPage) {
      pagination.perPage = 25;
    }
    return {
      type: this.listingsType,
      createKey: 0,
      modals: {
        create: false,
      },
      model: {
        email: "",
        telephone: "",
        firstName: "",
        lastName: "",
      },
      isLoading: true,
      tableColumns: this.options.columns,
      tableData: [],
      pagination,
      searchQuery: "",
      propsToSearch: this.options.searchKeys,
      fuseSearch: null,
    };
  },
  computed: {
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

      return result.length && this.paginateOptions.perPage
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
    searchEnabled() {
      return this.options?.search && this.options?.searchKeys.length;
    },
    showActions() {
      return (
        this.canDelete(null) || this.canEdit(null) || this.hasCustomActions()
      );
    },
    hasBulkActions() {
      let hasBulkActions = this.bulkActions.length;
      return hasBulkActions;
    },
  },
  mounted() {
    this.tableData = this.listingsData;
    this.isLoading = false;

    this.initFuse();
  },
  beforeUnmount() {
    this.fuseSearch = null;
    this.tableData = [];
  },
  watch: {
    listingsData(newVal) {
      this.tableData = newVal;
      this.initFuse();
    },
  },
  methods: {
    updateSearch() {
      let searchResults = [];
      if (this.searchQuery !== "" && this.fuseSearch) {
        let fsr = this.fuseSearch.search(this.searchQuery);
        // Filter out the lower matches
        fsr = fsr.filter((d) => d.score <= 0.01);
        //Format into how we need it
        searchResults = Object.keys(fsr).map(function (key) {
          return { ...fsr[key].item };
        });
      }
      this.$emit("updateSearch", searchResults);
    },
    checkActionCondition(r, a) {
      if (a.condition) {
        switch (a.condition) {
          case "notAllocated":
            return (
              !r?.allocatedTo ||
              r.allocatedTo == "" ||
              r.allocatedTo == "unallocated"
            );
        }
      }

      return true;
    },
    checkClasses(col) {
      let classes = [];
      if (typeof col.authorised !== "undefined" && !col.authorised) {
        classes.push("unauthorised");
      }
      return classes.join();
    },
    canDelete(row) {
      let canDelete = this.options?.delete;
      if (row && canDelete && this.listingsType === "nominators") {
        canDelete =
          this.$store?.getters?.usersEmail === row.emailAddress ? false : true;
      }
      return canDelete;
    },
    canEdit(row) {
      let canEdit = this.options?.edit;
      if (row && canEdit && this.listingsType === "nominators") {
        canEdit =
          this.$store?.getters?.usersEmail === row.emailAddress ? false : true;
      }
      return canEdit;
    },
    canDownload() {
      return this.options?.download;
    },
    downloadCSV() {
      this.$emit("downloadCSV");
    },
    hasCustomActions() {
      let hasCustomActions = this.customActions.length;
      return hasCustomActions;
    },
    handleBulkAction(i, k) {
      this.$emit("handleBulkAction", i, k);
    },
    handleCustomAction(i, k, r, a) {
      this.$emit("handleCustomAction", i, k, r);

      if (a.removeRow) {
        let indexToDelete = this.tableData.findIndex(
          (tableRow) => tableRow.requestId === r.requestId
        );
        if (indexToDelete >= 0) {
          this.tableData.splice(indexToDelete, 1);
        }
      }
    },
    updatePagination() {
      this.$store.dispatch("setPaginationData", {
        type: this.listingsType,
        attributes: this.pagination,
      });
    },
    initFuse() {
      this.fuseSearch = new Fuse(this.tableData, {
        ignoreFieldNorm: true,
        ignoreLocation: true,
        includeScore: true,
        includeMatches: true,
        shouldSort: true,
        useExtendedSearch: true,
        keys: this.options.searchKeys,
      });
    },
    paginationTotal(value) {
      this.pagination.total = value;
    },
    handleEdit(i, r) {
      if (this.canEdit) {
        this.$emit("editItem", i, r);
      }
    },
    handleDelete(i, r) {
      Swal.fire({
        title: this.options?.modalMessages?.delete?.title ?? "Are you sure?",
        text:
          this.options?.modalMessages?.delete?.message ??
          `If you delete this item, this process cannot be undone.`,
        type: this.options?.modalMessages?.delete?.type ?? "warning",
        showCancelButton: true,
        confirmButtonClass: "btn btn-success btn-fill",
        cancelButtonClass: "btn btn-danger btn-fill",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        buttonsStyling: false,
      }).then((d) => {
        if (d?.isConfirmed && !d?.isDismissed) {
          this.$emit("deleteItem", i, r);
        }
      });
    },
  },
};
</script>
<style lang="scss">
.can-edit {
  .el-table__row {
    .cell {
      &:hover {
        cursor: pointer;
      }
    }
  }
}
</style>
