<template>
  <card class="nominators-list">
    <el-dialog center title="Nominate Families" :visible.sync="modals.create" width="80%">
      <FamilyAdd
        :key="createKey"
        :orgRef="`${hamperRef}`"
        :nominatorId="nominator ? nominator.requestId : ''"
        :hamperCount="familyCount"
        :nominatorsFamilies="nominatorsFamilies"
        @saveFamilies="saveFamilies"
                  z-index="1050"
      />
    </el-dialog>
    <template slot="header">
      <h4 class="card-title">
        Families ({{orgFamiliesTotal}})

        <button
          type="submit"
          class="btn btn-info btn-fill btn-wd pull-right"
          @click.prevent="
            createKey = !createKey;
            openModal('create');
          "
          v-if="!isLoading.families && canUserCreate && maxFamilysCheck"
        >
          Add Family
        </button>
        <p class="pull-right">
          <l-alert type="danger"  v-if="canUserCreate && !maxFamilysCheck">
            <span>Your team has reached the maximum family submissions.</span>
          </l-alert>
        </p>
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
import { Dialog, MessageBox, Table, TableColumn, Select, Option } from "element-ui";
import { Pagination as LPagination } from "src/components/index";
import {
  getFamilyByOrganisation,
  getFamilies,
  deleteFamily,
} from "@/api/families.api";
import FamilyAdd from "@/components/Modals/FamilyAdd.vue";
import Fuse from "fuse.js";
import Swal from "sweetalert2";
import LAlert from "src/components/Alert";

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
    LAlert,
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
    paginate: {
      type: Boolean,
      default: true,
    },
    allowSearch: {
      type: Boolean,
      default: true,
    },
    allowCreate: {
      type: Boolean,
      default: false,
    },
    allowDownload: {
      type: Boolean,
      default: true,
    },
    nominator: {
      type: Object,
      default: () => {},
    },
    organisation: {
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
      /* *
      ID No.
      "Name of Worker / Contact Tel. (If applicable)"
      BOYS
      GIRLS
      ADULTS
      Any Specific Requests
      FAMILY UNIT TOTAL

      /* */
      tableColumns: [
        {
          prop: "reference",
          label: "Hamper ID",
          minWidth: 125,
        },
        {
          prop: "nominatorDetail",
          label: "Worker Details",
          html: true,
          minWidth: 250,
        },
        {
          prop: "familyDetail",
          label: "Family Detail",
          html: true,
          minWidth: 150,
        },
        {
          prop: "totalUnit",
          label: "Family Unit Total",
          minWidth: 100,
        },
      ],
      tableData: [],
      pagination: {
        perPage: 5,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50, 100, 150, 200],
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
      orgFamiliesTotal: this.organisation?.familiesTotal ? this.organisation.familiesTotal : 0
    };
  },
  computed: {
    canUserCreate() {
      return this.allowCreate;
    },
    maxFamilysCheck() {
      return this.organisation.familiesLimit <= 0 || this.orgFamiliesTotal < this.organisation.familiesLimit;
    },
    familyCount() {
      return this.tableData.filter(
        (f) => f.nominatorId == this?.nominator?.requestId
      ).length;
    },
    nominatorsFamilies() {
      return this.tableData.filter(
        (f) => f.nominatorId == this?.nominator?.requestId
      );
    },
    queriedData() {
      let result = this.tableData;
      if (this.searchQuery !== "") {
        result = this.fuseSearch.search(this.searchQuery);
        this.paginationTotal(result.length);
      }
      result.sort((a, b) =>
        b.reference > a.reference ? 1 : a.reference > b.reference ? -1 : 0
      );

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
    this.getListData();
    this.isLoading = false;

    this.fuseSearch = new Fuse(this.tableData, { keys: ["companyName",
        "firstName",
        "lastName",
        "email",
        "families"] });
  },
  methods: {
    async handleDelete(i, r) {
      await Swal.fire({
        title: "Are you sure?",
        text: `If you delete this family, the process cannot be undone.`,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn btn-success btn-fill",
        cancelButtonClass: "btn btn-danger btn-fill",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        buttonsStyling: false,
      }).then(async (d) => {
        if (d?.isConfirmed && !d?.isDismissed) {
          const updateRes = await deleteFamily(r.requestId);
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
            this.orgFamiliesTotal --;
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
      this.createKey = !this.createKey

      Swal.fire({
        title: "Success",
        text: "Your family was saved successfully.",
        timer: 3000,
        showConfirmButton: false,
      });

      this.orgFamiliesTotal ++;
      if (!this.maxFamilysCheck) {
        this.closeModal('create');
      }
    },
    checkRole(role) {
      return this.userInGroup(role);
    },
    async getListData() {
      if (this.organisationId) {
        const res = await getFamilyByOrganisation(this.organisationId);
        this.tableData = Object.values(res.data.families);
        this.allMembers = Object.values(res.data.members);

        this.$emit("resultData", "families", this.tableData);
      } else if (this.checkRole("Admin")) {
        const res = await getFamilies();
        this.tableData = Object.values(res.data);

        this.$emit("resultData", "families", this.tableData);
      }
    },
    paginationTotal(value) {
      this.pagination.total = value;
    },
  },
  watch: {
    organisation(newVal) {
      this.orgFamiliesTotal = newVal.familiesTotal;
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
