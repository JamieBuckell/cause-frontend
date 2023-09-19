<template>
  <div class="row">
    <div class="col-12">
      <el-dialog center title="Create Subscriber" :visible.sync="modals.create">
        <SubscriberAdd :key="createKey" />
      </el-dialog>
      <card>
        <template slot="header">
          <h4 class="card-title">
            All Subscribers

            <button
              type="submit"
              class="btn btn-info btn-fill btn-wd pull-right"
              @click.prevent="
                createKey = !createKey;
                openModal('create');
              "
              v-if="!isLoading"
            >
              Add Subscriber
            </button>
          </h4>
        </template>
        <div class="spinner-border text-muted" role="status" v-if="isLoading">
          <span class="sr-only">Loading...</span>
        </div>
        <div v-if="!isLoading">
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
            <div class="mb-3 mr-3">
              <span class="text-muted small d-block py-1 px-2">Verified?</span>
              <el-select
                class="select-default"
                style="width: auto"
                v-model="pagination.verified"
                placeholder="Verified"
              >
                <el-option
                  class="select-default"
                  v-for="item in pagination.verifiedOptions"
                  :key="item"
                  :label="item"
                  :value="item"
                >
                </el-option>
              </el-select>
            </div>
            <div class="mb-3 mr-3">
              <span class="text-muted small d-block py-1 px-2">Bounced?</span>
              <el-select
                class="select-default"
                style="width: auto"
                v-model="pagination.bounced"
                placeholder="Bounced"
              >
                <el-option
                  class="select-default"
                  v-for="item in pagination.verifiedOptions"
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
            <l-alert type="danger" v-for="m in messages" :key="m">
              <span> {{ getErrorMessage(m) }}</span>
            </l-alert>
            <el-table stripe style="width: 100%" :data="queriedData" border>
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
                  <a
                    v-tooltip.top-center="'donor'"
                    class="btn-success btn-simple btn-link"
                    :href="`/donors/view/${props.row.PK}`"
                    target="_blank"
                    ><i class="fa fa-globe"></i
                  ></a>
                  <a
                    v-tooltip.top-center="'Edit'"
                    class="btn-warning btn-simple btn-link"
                    @click.stop="handleEdit(props.$index, props.row)"
                    ><i class="fa fa-edit"></i
                  ></a>
                  <a
                    v-tooltip.top-center="'Delete'"
                    class="btn-danger btn-simple btn-link"
                    @click.stop="handleDelete(props.$index, props.row)"
                    ><i class="fa fa-times"></i
                  ></a>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </div>
        <div
          v-if="!isLoading"
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
import {
  Dialog,
  Table,
  TableColumn,
  Select,
  Option,
  MessageBox,
} from "element-ui";
import { Pagination as LPagination } from "src/components/index";
import LAlert from "src/components/Alert";
import Swal from "sweetalert2";
import { getSubscribers, deleteSubscriber } from "@/api/subscribers.api";
import SubscriberAdd from "@/components/Modals/SubscriberAdd.vue";
import Fuse from "fuse.js";

Vue.prototype.$confirm = MessageBox.confirm;
export default {
  components: {
    LPagination,
    [Dialog.name]: Dialog,
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    SubscriberAdd,
    LAlert,
  },
  data() {
    return {
      messages: [],
      createKey: 0,
      isLoading: true,
      modals: {
        create: false,
      },
      pagination: {
        perPage: 25,
        currentPage: 1,
        perPageOptions: [25, 50, 100],
        verified: "Yes",
        verifiedOptions: ["All", "Yes", "No"],
        bounced: "No",
        total: 0,
      },
      searchQuery: "",
      propsToSearch: ["PK", "firstName", "lastName", "company"],
      tableColumns: [
        {
          prop: "PK",
          label: "Email Address",
          minWidth: 300,
        },
        {
          prop: "firstName",
          label: "First Name",
          minWidth: 150,
        },
        {
          prop: "lastName",
          label: "Last Name",
          minWidth: 150,
        },
        {
          prop: "company",
          label: "Company",
          minWidth: 200,
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
      if (result.length) {
        result = result.filter((d) => d.subscribed === true);
        if (this.pagination.verified && this.pagination.verified != "All") {
          const v = this.pagination.verified === "Yes";
          result = result.filter(
            (d) => d?.verified === v || (!d?.verified && !v)
          );
        }
        if (this.pagination.bounced && this.pagination.bounced != "All") {
          const b = this.pagination.bounced === "Yes";
          result = result.filter((d) => d.bounced === b || (!d?.bounced && !b));
        }
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
    platformData() {
      return this.$store.getters.getPlatformData;
    },
  },
  methods: {
    openModal(name) {
      this.modals[name] = true;
    },
    closeModal(name) {
      this.modals[name] = false;
    },
    cellValueRenderer(row, column, cellValue, index) {
      let value = cellValue;
      if (typeof row[column.property] === "boolean") {
        value = cellValue ? "Yes" : "No";
      }
      return value;
    },
    handleEdit(index, row) {
      this.$router.push(`/subscribers/view/${row.PK}`);
    },
    async handleDelete(index, row) {
      await Swal.fire({
        title: "Are you sure?",
        text: `If you delete this subscriber, the process cannot be undone.`,
        type: "warning",
        showCancelButton: true,
        confirmButtonClass: "btn btn-success btn-fill",
        cancelButtonClass: "btn btn-danger btn-fill",
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        buttonsStyling: false,
      }).then(async (d) => {
        if (d?.isConfirmed && !d?.isDismissed) {
          const updateRes = await deleteSubscriber(row.PK);
          /* */
          if (updateRes?.data?.status != 200 && updateRes?.data?.messages) {
            this.messages = Object.keys(updateRes?.data?.messages).map((k) => ({
              error: updateRes?.data?.messages[k],
            }));
          } else {
            let indexToDelete = this.tableData.findIndex(
              (tableRow) => tableRow.id === row.id
            );
            if (indexToDelete >= 0) {
              this.tableData.splice(indexToDelete, 1);
            }
          }
          /* */
        }
      });
    },
    paginationTotal(value) {
      this.pagination.total = value;
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
    async getSubscriberData() {
      var pData = this.$store.getters.getPlatformData;
      if (!pData?.subscribers) {
        const platformData = await getByCampaign(
          this.$store.getters.getActiveCampaign
        );

        if (platformData?.data) {
          await this.$store.dispatch("setPlatformData", {
            ...platformData.data,
          });
          pData = platformData?.data;
        }
      }

      this.tableData = Object.values(pData?.subscribers ?? []);

      this.tableData.map((s) => ({
        PK: s.PK,
        firstName: s?.firstName,
        lastName: s?.lastName,
        company: s?.company,
      }));

      this.fuseSearch = new Fuse(this.tableData, {
        keys: ["PK", "firstName", "lastName", "company"],
        includeScore: true,
      });
    },
  },
  async mounted() {
    if (!this.userInGroup("admin")) {
      this.$router.push("/");
    }
    await this.getSubscriberData();

    EventBus.$on("$EventBusEvent", this.handleEventBusEvent);
    this.isLoading = false;
  },
  watch: {
    async platformData() {
      await this.getDonorData();
    },
  },
};
</script>
<style></style>
