<template>
  <div>
    <div class="row">
      <div class="col-12">
        <div
          v-if="
            familyData.status !== 'authorised' &&
            familyData.status !== 'rejected'
          "
          class="alert alert-warning clearfix align-self-center"
          role="alert"
        >
          This family has not been approved. status:
          {{ familyData.status }}
          <a
            href="#"
            class="btn btn-sm btn-danger pull-right mb-0 ml-2 font-weight-bold"
            @click.prevent="rejectProfile"
          >
            reject
          </a>
          <a
            href="#"
            class="btn btn-sm btn-success pull-right mb-0 ml-2 font-weight-bold"
            @click.prevent="approveProfile"
          >
            approve
          </a>
        </div>
        <card>
          <div slot="image">
            <img :src="user.banner" :alt="familyData.companyName" />
            <!--  src="https://ununsplash.imgix.net/photo-1431578500526-4d9613015464?fit=crop&fm=jpg&h=1800&q=100&w=2000" -->
          </div>
          <div class="row">
            <div class="col-12 col-md-4 card-user">
              <div>
                <div class="author border-0">
                  <img
                    class="avatar border-gray"
                    :src="user.image"
                    :alt="familyData.companyName"
                  />
                  <!--  src="https://ununsplash.imgix.net/photo-1607569490015-7101095605ed?fit=crop&fm=jpg&q=100&w=200&h=200" -->
                  <h4 class="title">
                    <!--<a :href="user.organisationLink" target="_blank">
                    </a>-->
                    <small>{{ familyData.companyName }}</small>
                    <br /><br />
                    {{ firstName }} {{ lastName }}
                    <p>
                      <small>{{ familyData.position }}</small>
                    </p>
                  </h4>

                  <p>
                    <small>
                      {{ familyData.addressLine1 }}<br />
                      {{ familyData.addressLine2 }}<br />
                      {{ familyData.city }}<br />
                      <strong>{{ familyData.postCode }}</strong
                      ><br />
                    </small>
                  </p>
                </div>
              </div>
              <hr />
              <div class="text-center">
                <div>
                  <a
                    v-if="familyData.emailAddress"
                    :href="`mailto:${familyData.emailAddress}`"
                    class="btn btn-simple btn-link btn-icon"
                  >
                    <i class="nc-icon nc-email-85"></i>
                  </a>
                  <a
                    v-if="familyData.telephoneNumber"
                    :href="formatTelephone"
                    class="btn btn-simple btn-link btn-icon"
                  >
                    <i class="nc-icon nc-mobile"></i>
                  </a>
                </div>
              </div>
            </div>
            <div class="col-12 col-md-8">
              <div>
                <form>
                  <div class="row">
                    <div class="col-md-6">
                      <fg-input
                        type="text"
                        label="First Name"
                        placeholder="First Name"
                        v-model="firstName"
                      >
                      </fg-input>
                    </div>
                    <div class="col-md-6">
                      <fg-input
                        type="text"
                        label="Last Name"
                        placeholder="Last Name"
                        v-model="lastName"
                      >
                      </fg-input>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-12">
                      <fg-input
                        type="email"
                        label="Email"
                        placeholder="Email"
                        v-model="familyData.emailAddress"
                      >
                      </fg-input>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-12">
                      <fg-input
                        type="text"
                        label="Organisation"
                        placeholder="Paper dashboard"
                        v-model="familyData.companyName"
                      >
                      </fg-input>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-12">
                      <fg-input
                        type="text"
                        label="Address Line 1"
                        placeholder="Address Line 1"
                        v-model="familyData.addressLine1"
                      >
                      </fg-input>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-12">
                      <fg-input
                        type="text"
                        label="Address Line 2"
                        placeholder="Address Line 2"
                        v-model="familyData.addressLine2"
                      >
                      </fg-input>
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-md-6">
                      <fg-input
                        type="text"
                        label="City"
                        placeholder="City"
                        v-model="familyData.city"
                      >
                      </fg-input>
                    </div>
                    <div class="col-md-6">
                      <fg-input
                        label="Post Code"
                        placeholder="Post Code"
                        v-model="familyData.postCode"
                      >
                      </fg-input>
                    </div>
                  </div>

                  <div class="text-right">
                    <div
                      class="pull-left"
                      v-if="
                        familyData.status !== 'authorised' &&
                        familyData.status !== 'rejected'
                      "
                    >
                      <button
                        type="submit"
                        class="btn btn-danger btn-fill btn-wd mr-3"
                        @click.prevent="rejectProfile"
                      >
                        Reject
                      </button>
                      <button
                        type="submit"
                        class="btn btn-success btn-fill btn-wd mr-3"
                        @click.prevent="approveProfile"
                      >
                        Approve
                      </button>
                    </div>

                    <button
                      type="submit"
                      class="btn btn-info btn-fill btn-wd"
                      @click.prevent="updateProfile"
                    >
                      Update Profile
                    </button>
                  </div>
                  <div class="clearfix"></div>
                </form>
              </div>
            </div>
          </div>
        </card>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <card title="Families">
          <div>
            <div
              class="col-12 d-flex justify-content-center justify-content-sm-between flex-wrap"
            >
              <el-select
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
                </el-table-column>
                <el-table-column :min-width="120" fixed="right" label="Actions">
                  <template slot-scope="props">
                    <a
                      v-tooltip.top-center="'Edit'"
                      class="btn-warning btn-simple btn-link"
                      @click="handleEdit(props.$index, props.row)"
                      ><i class="fa fa-edit"></i
                    ></a>
                    <a
                      v-tooltip.top-center="'Delete'"
                      class="btn-danger btn-simple btn-link"
                      @click="handleDelete(props.$index, props.row)"
                      ><i class="fa fa-times"></i
                    ></a>
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
  </div>
</template>
<script>
import { Table, TableColumn, Select, Option } from "element-ui";
import { Pagination as LPagination } from "src/components/index";
import { getFamilyByRequest, updateFamily } from "@/api/families.api";
import families from "@/data/families";
import Fuse from "fuse.js";

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
      pagination: {
        perPage: 10,
        currentPage: 1,
        perPageOptions: [5, 10, 25, 50],
        total: 0,
      },
      searchQuery: "",
      propsToSearch: ["hamperId", "dynamic"],
      tableColumns: [
        {
          prop: "hamperId",
          label: "Hamper Id",
          minWidth: 100,
        },
        {
          prop: "dynamic",
          label: "Dynamic",
          minWidth: 250,
        },
        {
          prop: "unit",
          label: "Family Unit",
          minWidth: 100,
        },
        {
          prop: "requirements",
          label: "Additional Detail",
          minWidth: 100,
        },
      ],
      familyData: {},
      tableData: families,
      fuseSearch: null,
      user: {
        id: 1,
        organisationLink: "https://www.middlesbrough.gov.uk/",
        banner: require("/public/static/img/middlesbrough-council.jpeg"),
        image: require("/public/static/img/default-avatar.png"),
      },
    };
  },
  computed: {
    pagedData() {
      return this.tableData.slice(this.from, this.to);
    },
    firstName() {
      return this.familyData.fullName
        ? this.familyData.fullName.split(" ").slice(0, -1).join(" ")
        : "";
    },
    lastName() {
      return this.familyData.fullName
        ? this.familyData.fullName.split(" ").slice(-1).join(" ")
        : "";
    },
    formatTelephone() {
      let formattedNumber = this.user.telephone;
      if (formattedNumber) {
        formattedNumber =
          "tel:+" +
          this.user.telephone
            .toString()
            .replace(/[^0-9]+/, "")
            .replace(/^0+/, "44");
      }
      return formattedNumber;
    },
    /***
     * Searches through table data and returns a paginated array.
     * Note that this should not be used for table with a lot of data as it might be slow!
     * Do the search and the pagination on the server and display the data retrieved from server instead.
     * @returns {computed.pagedData}
     */
    queriedData() {
      let result = this.tableData;
      if (this.searchQuery !== "") {
        result = this.fuseSearch.search(this.searchQuery);
        this.paginationTotal(result.length);
      }
      return result.slice(this.from, this.to);
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
  },
  methods: {
    async approveProfile() {
      //create cognito account
      const res = await updateFamily({
        requestId: this.familyData.requestId,
        status: "authorised",
      });
      // this.familyData.status = "authorised";
    },
    async rejectProfile() {
      const res = await updateFamily({
        requestId: this.familyData.requestId,
        status: "rejected",
      });
      this.familyData.status = "rejected";
      this.familyData.status = "";
      if (res.data.success) {
        this.$router.push("/families/list");
      } else {
        //Handle Error
      }
    },
    handleEdit(index, row) {
      this.$router.push("/families/view");
      // alert(`Your want to edit ${row.name}`);
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
  },
  async mounted() {
    if (!this.userInGroup("admin")) {
      this.$router.push("/");
    }

    this.fuseSearch = new Fuse(this.tableData, { keys: ["name", "email"] });

    const familyData = await getFamilyByRequest(this.$route.params.requestId);
    this.familyData = familyData.data;
    this.familyData.status = this.familyData.status ?? "";
  },
};
</script>
<style></style>
