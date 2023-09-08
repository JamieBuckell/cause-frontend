<template>
  <card class="nominators-list">
    <el-dialog
      center
      title="Nominate Families"
      :visible.sync="modals.create"
      width="80%"
    >
      <FamilyAdd
        :key="createKey"
        :orgRef="`${hamperRef}`"
        :nominatorId="nominator ? nominator.requestId : ''"
        :hamperCount="familyCount"
        @saveFamilies="saveFamilies"
      />
    </el-dialog>
    <template slot="header">
      <h4 class="card-title">
        Families

        <button
          type="submit"
          class="btn btn-info btn-fill btn-wd pull-right"
          @click.prevent="
            createKey = !createKey;
            openModal('create');
          "
          v-if="!isLoading.families && allowCreate"
        >
          Add Family
        </button>
      </h4>
    </template>
    <div class="spinner-border text-muted" role="status" v-if="isLoading">
      <span class="sr-only">Loading...</span>
    </div>
    <div v-if="!isLoading" :class="!paginateOptions.perPage ? 'pb-4' : ''">
      <div
        class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
      >
        <el-select
          v-if="paginateOptions.perPage"
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
            <template slot-scope="col" class="test">
              <div
                :class="
                  unauthorisedNominators.includes(col.row.nominatorId)
                    ? 'unauthorised'
                    : ''
                "
              >
                <div
                  v-if="column.html == true"
                  v-html="col.row[column.prop]"
                ></div>
                <div v-else>{{ col.row[column.prop] }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column :min-width="75" fixed="right" label="Actions">
            <template slot-scope="props">
              <div class="text-center">
                <a
                  v-tooltip.top-center="'Delete'"
                  class="btn-danger btn-simple btn-link"
                  @click="handleDelete(props.$index, props.row)"
                  ><i class="fa fa-times"></i
                ></a>
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
import { getOrganisations, deleteOrganisation } from "@/api/organisations.api";
import FamilyAdd from "@/components/Modals/FamilyAdd.vue";
import Fuse from "fuse.js";
import Swal from "sweetalert2";
import { MessageBox } from "element-ui";

Vue.prototype.$confirm = MessageBox.confirm;

export default {
  components: {
    [Dialog.name]: Dialog,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    LPagination,
    FamilyAdd,
  },
  props: {
    organisationId: {
      type: String,
      default: "",
    },
    hamperRef: {
      type: String,
      default: "",
    },
    paginateOptions: {
      type: Object,
      default: () => ({
        perPage: 5,
        perPageOptions: [5, 10, 25, 50],
      }),
    },
    allowSearch: {
      type: Boolean,
      default: true,
    },
    allowCreate: {
      type: Boolean,
      default: false,
    },
    nominator: {
      type: Object,
      default: () => {},
    },
    allNominators: {
      type: Array,
      default: () => [],
    },
    unauthorisedNominators: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    const defaultPagination = {
      perPage: this.paginateOptions.perPage ?? 5,
      currentPage: 1,
      perPageOptions: this.paginateOptions.perPageOptions ?? [5, 10, 25, 50],
      total: 0,
    };
    let pagination = this.$store.getters.getPaginationData("organisations");
    if (!pagination) {
      this.$store.dispatch("setPaginationData", {
        type: "organisations",
        defaultPagination,
      });
      pagination = defaultPagination;
    }
    return {
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
      allMembers: [],
      tableColumns: [
        {
          prop: "reference",
          label: "Ref",
          minWidth: 60,
        },
        {
          prop: "name",
          label: "Name",
          minWidth: 150,
        },
      ],
      tableData: [],
      pagination,
      searchQuery: "",
      propsToSearch: ["reference", "name"],
      fuseSearch: null,
    };
  },
  computed: {
    familyCount() {
      return this.tableData.filter(
        (f) => f.nominatorId == this?.nominator?.requestId
      ).length;
    },
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
    await this.getListData();
    this.isLoading = false;

    this.fuseSearch = new Fuse(this.tableData, {
      ignoreFieldNorm: true,
      ignoreLocation: true,
      includeScore: true,
      includeMatches: true,
      shouldSort: true,
      useExtendedSearch: true,
      keys: [
        { name: "reference", weight: 2 },
        { name: "name", weight: 2 },
      ],
    });
  },
  methods: {
    async handleDelete(i, r) {
      await Swal.fire({
        title: "Are you sure?",
        text: `If you delete this organisation, the process cannot be undone.`,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn btn-success btn-fill",
        cancelButtonClass: "btn btn-danger btn-fill",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        buttonsStyling: false,
      }).then(async (d) => {
        if (d?.isConfirmed && !d?.isDismissed) {
          const updateRes = await deleteOrganisation(
            r.GSI2PK,
            this.$store.getters.getActiveCampaign
          );
          if (updateRes?.status != 200 && updateRes?.data?.messages) {
            this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
              error: updateRes?.data?.messages[k],
            }));
          } else {
            let indexToDelete = this.tableData.findIndex(
              (tableRow) => tableRow.GSI2PK === r.GSI2PK
            );
            if (indexToDelete >= 0) {
              this.tableData.splice(indexToDelete, 1);
            }
          }
          /* */
        }
      });
    },
    openModal(name) {
      this.modals[name] = true;
    },
    closeModal(name) {
      this.modals[name] = false;
    },
    saveFamilies(families) {
      this.tableData = [...this.tableData, ...families];
      this.closeModal("create");
    },
    checkRole(role) {
      return this.userInGroup(role);
    },
    async getListData() {
      if (this.checkRole("Admin")) {
        const res = await getOrganisations();
        this.tableData = Object.values(res.data);

        this.tableData.sort((a, b) =>
          b.reference < a.reference ? 1 : a.reference < b.reference ? -1 : 0
        );

        this.$emit("resultData", "organisations", this.tableData);
      }
    },
    paginationTotal(value) {
      this.pagination.total = value;
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
