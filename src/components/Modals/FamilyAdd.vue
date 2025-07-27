<template>
  <div class="container">
    <div class="row">
      <div class="col-12">
        <button
          type="submit"
          class="btn btn-info btn-fill btn-wd float-right"
          @click.prevent="saveFamilies"
          :disabled="submittingFamily"
        >
          {{ saveType == "create" ? "Save" : "Update" }} Family
        </button>
        <p class="float-right pr-3 pt-2" v-if="saveType == 'create'">
          Please ensure you enter all family members before hitting Save as you
          cannot amend this once submitted.
        </p>
      </div>
    </div>
    <div class="row" v-if="messages.length">
      <div class="col-12">
        <l-alert type="danger" v-for="(m, i) in messages" :key="i">
          <span> {{ getErrorMessage(m) }}</span>
        </l-alert>
      </div>
    </div>
    <form>
      <div v-for="(nomination, nomIndex) in nominations" :key="nomIndex">
        <div class="row">
          <div class="col-md-12">
            <card class="mb-3">
              <template slot="header">
                <el-select
                  v-if="canChangeNominator()"
                  class="select-default mb-0 pull-right"
                  v-model="chosenNominatorId"
                  placeholder="Who"
                  filterable
                  default-first-option
                  @change="changeNominator()"
                >
                  <el-option
                    class="select-default"
                    v-for="nominator in allNominators"
                    :key="nominator.GSI2PK"
                    :label="`${nominator.fullName} (${nominator.userReference})`"
                    :value="nominator.GSI2PK"
                  >
                  </el-option>
                </el-select>
                <h4 class="card-title">
                  {{ nomination.hamperId
                  }}<span class="d-none d-md-inline"> - </span
                  ><br class="d-md-none" />Family Members
                </h4>
                <p class="card-category">
                  Family Total:
                  {{ nomination.adults + nomination.children }} (Adults:
                  {{ nomination.adults }} Children: {{ nomination.children }})
                </p>
              </template>
              <div class="row d-none d-md-flex">
                <div class="col-md-1"></div>
                <div class="col-md-3"><label>Who</label></div>
                <div class="col-md-3"><label>Age</label></div>
                <div class="col-md-4">
                  <label>Additional Information for the Donor</label>
                </div>
                <div class="col-md-1"></div>
              </div>
              <div
                class="row"
                v-for="(member, memberIndex) in nomination.members"
                :key="memberIndex"
              >
                <div class="col-md-1">#{{ memberIndex + 1 }}</div>
                <div class="col-md-3">
                  <label class="d-block d-md-none">Who</label>
                  <el-select
                    class="select-default mb-0 w-100"
                    v-model="member.who"
                    placeholder="Who"
                    filterable
                    default-first-option
                    :class="{
                      'is-invalid':
                        memberErrors?.[nomIndex]?.[memberIndex]?.who,
                    }"
                  >
                    <el-option
                      class="select-default"
                      v-for="item in whoList"
                      :key="item"
                      :label="item"
                      :value="item"
                    >
                    </el-option>
                  </el-select>
                  <small
                    v-if="memberErrors?.[nomIndex]?.[memberIndex]?.who"
                    class="text-danger"
                  >
                    {{ memberErrors[nomIndex][memberIndex].who }}
                  </small>
                  <div v-if="member.who == 'Other'">
                    <el-input
                      type="text"
                      class="mb-0"
                      placeholder="Please specify"
                      v-model="member.whoOther"
                    />
                  </div>
                </div>
                <div class="col-md-3">
                  <label class="d-block d-md-none pt-3">Age</label>
                  <el-select
                    class="select-default mb-0 w-100"
                    v-model="member.age"
                    @change="calculateAges(nomIndex)"
                    placeholder="Age"
                    aria-required
                    filterable
                    default-first-option
                    :class="{
                      'is-invalid':
                        memberErrors?.[nomIndex]?.[memberIndex]?.age,
                    }"
                  >
                    <!--
                    <el-option
                      class="select-default"
                      key=""
                      label="Unknown"
                      value=""
                    >
                    </el-option>
                    -->
                    <el-option
                      v-for="item in ageList"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    >
                    </el-option>
                  </el-select>
                  <small
                    v-if="memberErrors?.[nomIndex]?.[memberIndex]?.age"
                    class="text-danger"
                  >
                    {{ memberErrors[nomIndex][memberIndex].age }}
                  </small>
                </div>

                <!--
                <div class="col-md-2">
                  <label class="d-block d-md-none pt-0"></label>

                  <el-select
                    class="select-default mb-0 w-100"
                    v-model="member.ageType"
                    @change="calculateAges(nomIndex)"
                    placeholder="Age"
                    filterable
                    default-first-option
                  >
                    <el-option
                      class="select-default"
                      v-for="item in ageTypes"
                      :key="item"
                      :label="item"
                      :value="item"
                    >
                    </el-option>
                  </el-select>
                </div>
                -->
                <div class="col-md-4">
                  <label class="d-block d-md-none pt-3"
                    >Additional Information for the Donor</label
                  >

                  <fg-input>
                    <textarea
                      class="form-control"
                      :placeholder="`Likes/Dietary Requirements/Special Needs etc`"
                      rows="2"
                      v-model="member.additionalInfo"
                    ></textarea>
                  </fg-input>

                  <el-input
                    class="d-block d-md-none"
                    type="textarea"
                    :autosize="{ minRows: 4 }"
                    placeholder="Likes/Dietary Requirements/Special Needs etc"
                    v-model="member.additionalInfo"
                  >
                  </el-input>
                </div>
                <div class="col-md-1 family-actions">
                  <div class="cell pt-3 pt-md-0">
                    <a
                      v-tooltip.top-center="'Delete'"
                      class="btn-danger btn-simple btn-link"
                      @click="removeFamilyMember(nomIndex, memberIndex)"
                      ><i class="fa fa-times"></i
                    ></a>
                  </div>
                </div>
              </div>
              <template slot="footer">
                <button
                  type="submit"
                  class="btn btn-secondary btn-fill btn-wd mt-2 float-right"
                  @click.prevent="addFamilyMember(nomIndex)"
                >
                  Add Family Member
                </button>
              </template>
            </card>
          </div>
        </div>
      </div>

      <div class="clearfix"></div>
    </form>
  </div>
</template>
<script>
import {
  Table,
  TableColumn,
  Select,
  Option,
  Collapse,
  CollapseItem,
} from "element-ui";
import breakpoints from "@/util/breakpoints";
import {
  createFamily,
  getFamilyByRequest,
  listFamilies,
  updateFamily,
} from "@/api/families.api";
import LAlert from "src/components/Alert";

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
    LAlert,
  },
  props: {
    organisationId: {
      type: String,
      default: "",
    },
    orgRef: {
      type: String,
      default: "",
    },
    nominatorRef: {
      type: String,
      default: "",
    },
    nominatorId: {
      type: String,
      default: "",
    },
    hamperCount: {
      type: Number,
      default: 0,
    },
    allNominators: {
      type: Array,
      default: () => [],
    },
    allFamilies: {
      type: Array,
      default: () => [],
    },
    familyData: {
      type: Object,
      default: () => {},
    },
    saveType: {
      type: String,
      default: "create",
    },
  },
  data() {
    return {
      editFamilyData: {},
      editFamilyMembers: [],
      submittingFamily: false,
      activePanel: 0,
      nominations: [],
      chosenNominatorId: "",
      chosenNominator: {},
      selectionOptions: {
        adult: ["mum", "dad"],
        child: ["Boy", "Girl"],
      },
      messages: [],
      memberErrors: [],
    };
  },
  computed: {
    nominatorsFamilies() {
      return this.allFamilies.filter(
        (f) => f.nominatorId == this.chosenNominatorId
      );
    },
    breakpoints: () => breakpoints.screen,
    ageList() {
      const ageListArray = [
        { label: "0-6 months", value: 0.25 },
        { label: "6-12 months", value: 0.75 },
        { label: "12-18 months", value: 1 },
        { label: "18-24 months", value: 1.5 },
        { label: "2 years", value: 2 },
      ];

      for (let i = 3; i <= 114; i++) {
        ageListArray.push({ label: `${i} years`, value: i });
      }

      return ageListArray;
    },
    ageTypes() {
      return ["Years", "Months"];
    },
    whoList() {
      return [
        "Mam",
        "Dad",
        "Boy",
        "Girl",
        "Grandma",
        "Grandad",
        "Male",
        "Female",
        "Other",
      ];
    },
    familyCount() {
      return this.nominatorsFamilies.length;
    },
    nextHamperId() {
      const totalNewNominations = this?.nominations
        ? this.nominations.length
        : 0;

      let hamperCount = this.familyCount + totalNewNominations;
      let validHamperId = (hamperCount > 0 ? hamperCount : 1)
        .toString()
        .padStart(3, "0");

      let existingRef = false;
      if (this.nominatorsFamilies) {
        existingRef = this.nominatorsFamilies.find(
          (f) =>
            f.reference ===
            `${this.orgRef}${this.nominatorsReference}-${validHamperId}`
        );
      }

      if (existingRef) {
        let isUnique = false;

        let hamperIncrement = 0;
        while (!isUnique) {
          hamperIncrement++;
          let checkIncrement = hamperIncrement.toString().padStart(3, "0");
          const existingRefCheck = this.nominatorsFamilies.find(
            (f) =>
              f.reference ===
              `${this.orgRef}${this.nominatorsReference}-${checkIncrement}`
          );
          isUnique = existingRefCheck === undefined;

          if (hamperIncrement >= 100) {
            isUnique = true;
          }
        }
        validHamperId = hamperIncrement.toString().padStart(3, "0");
      }

      return validHamperId;
    },
    nominatorsReference() {
      let returnRef = "";

      if (!returnRef && this.chosenNominator?.nominatorDetails?.reference) {
        returnRef = this.chosenNominator.nominatorDetails.reference;
      }

      return returnRef;
    },
    getHamperReference() {
      return `${this.orgRef}${this.nominatorsReference}-${this.nextHamperId}`;
    },
    platformData() {
      return this.$store.getters?.getPlatformData ?? {};
    },
  },
  watch: {
    async familyData(newVal) {
      if (newVal?.requestId) {
        this.nominations = [];
        await this.updateFamilyData(newVal.requestId);

        await this.changeNominator();
        this.addFamily();
      }
    },
  },
  // familyData
  async mounted() {
    this.resetWindow();

    this.chosenNominatorId = this.nominatorId;
    if (this.saveType != "create" && this.familyData?.requestId) {
      await this.updateFamilyData(this.familyData.requestId);
    }

    const storedNominator = this.$store.getters.getGenericData(
      "SplitFamilyChosenNominator"
    );
    if (this.allNominators.length) {
      const storedNomExists =
        storedNominator && storedNominator.GSI2PK
          ? this.allNominators.find((n) => n.GSI2PK === storedNominator.GSI2PK)
          : false;
      this.chosenNominatorId = storedNomExists
        ? storedNomExists.GSI2PK
        : this.allNominators[0].GSI2PK;
    }

    if (this.saveType === "create") {
      this.changeNominator();
    }
    this.addFamily();
  },
  methods: {
    async updateFamilyData(requestId) {
      const familyData = this.allFamilies.find(
        (f) => f.requestId === requestId
      );
      this.editFamilyData = {
        requestId: familyData?.requestId,
        reference: familyData?.reference,
        nominatorId: familyData?.nominatorId,
      };
      this.editFamilyMembers = familyData.members;
    },
    canChangeNominator() {
      return (
        this.userInGroup("Admin") &&
        this.saveType === "create" &&
        this.allNominators.length > 1
      );
    },
    setChosenNominator(nominator) {
      this.chosenNominatorId = nominator.GSI2PK;
      this.chosenNominator = this.platformData.nominators.find(
        (n) =>
          n.GSI2PK === this.chosenNominatorId &&
          (n.type === "nominator" || n.type === "team-lead")
      );

      this.$store.dispatch("setGenericData", {
        key: "AddFamilyChosenNominator",
        data: nominator,
      });
    },
    async changeNominator() {
      const nominator = this.allNominators.find(
        (n) => n.GSI2PK === this.chosenNominatorId
      );
      if (
        this?.chosenNominatorId &&
        nominator?.GSI2PK &&
        this?.chosenNominatorId !== this.chosenNominator?.GSI2PK
      ) {
        this.setChosenNominator(nominator);
        if (this.nominations[0]) {
          this.nominations[0].hamperId = this.getHamperReference;
        }
      }
    },
    async resetWindow() {
      this.activePanel = 0;
      this.nominations = [];
    },
    async saveFamilies() {
      switch (this.saveType) {
        case "create":
          this.createFamilies();
          break;
        case "update":
          this.updateFamilies();
          break;
      }
    },
    async createFamilies() {
      this.submittingFamily = true;

      let hasErrors = false;

      this.memberErrors = this.nominations.map((nomination) =>
        nomination.members.map((member) => {
          return {
            who: !member.who ? "Who is required." : null,
            age: !member.age ? "Age is required." : null,
          };
        })
      );

      hasErrors = this.memberErrors.some((nomErrs) =>
        nomErrs.some((fieldErrs) => fieldErrs.who || fieldErrs.age)
      );

      if (hasErrors) {
        this.submittingFamily = false;
        return;
      }

      const hasOver18 = this.nominations.some((nomination) =>
        nomination.members.some((member) => {
          const parsedAge = parseInt(member.age);
          return !isNaN(parsedAge) && parsedAge >= 18;
        })
      );

      if (!hasOver18) {
        try {
          await this.$confirm(
            "There are no adults attached to this family. Are you sure you want to continue?",
            "Confirm Submission",
            {
              confirmButtonText: "Yes",
              cancelButtonText: "Cancel",
              type: "warning",
            }
          );
        } catch {
          // User cancelled
          this.submittingFamily = false;
          return;
        }
      }

      const res = await createFamily({
        campaign: this.$store.getters.getActiveCampaign,
        nominations: this.nominations,
        nominator: this.chosenNominatorId,
      });
      if (res?.data?.messages) {
        this.messages = Object.keys(res?.data?.messages).map((k) => ({
          error: res?.data?.messages[k],
        }));
      }
      if (res.status == 200) {
        const familyData = res?.data?.families;
        this.$emit("saveFamilies", familyData);
        this.nominations = [];
      }
      this.submittingFamily = false;
      /* */
    },
    async updateFamilies() {
      this.submittingFamily = true;

      const res = await updateFamily({
        campaign: this.$store.getters.getActiveCampaign,
        nominations: this.nominations,
        nominator: this.chosenNominatorId,
      });
      if (res?.data?.messages) {
        this.messages = Object.keys(res?.data?.messages).map((k) => ({
          error: res?.data?.messages[k],
        }));
      }
      if (res.status == 200) {
        const familyData = res?.data?.families;
        this.$emit("saveFamilies", familyData);
      }
      this.submittingFamily = false;
    },
    addFamily() {
      const nominationsData = {
        hamperId: this.editFamilyData?.reference
          ? this.editFamilyData.reference
          : this.getHamperReference,
        adults: 0,
        children: 0,
        members: [],
      };
      if (this.editFamilyData?.requestId && this.editFamilyMembers) {
        nominationsData.familyId = this.editFamilyData.requestId;
        nominationsData.nominatorId = this.editFamilyData.nominatorId;
        for (const [k, member] of this.editFamilyMembers.entries()) {
          nominationsData.members.push({
            memberId: member.requestId,
            age: member.age,
            ageType: member.ageType,
            who: member.who,
            whoOther: member.whoOther,
            additionalInfo: member.additionalInfo,
          });
        }
      } else {
        nominationsData.members.push({
          age: "",
          ageType: "Years",
          who: "",
          additionalInfo: "",
        });
      }
      this.nominations.unshift(nominationsData);
      this.calculateAges(this.nominations.length - 1);
    },
    addFamilyMember(index) {
      this.nominations[index].members.push({
        age: "",
        ageType: "Years",
        who: "",
        additionalInfo: "",
      });
    },
    removeFamilyMember(nomIndex, memberIndex) {
      this.nominations[nomIndex].members.splice(memberIndex, 1);
    },
    calculateAges(index) {
      this.nominations[index].adults = this.nominations[index].members.reduce(
        function (a, b) {
          return a + (b["age"] === "" || b["age"] >= 18 ? 1 : 0);
        },
        0
      );
      this.nominations[index].children = this.nominations[index].members.reduce(
        function (a, b) {
          return a + (b["age"] !== "" && b["age"] < 18 ? 1 : 0);
        },
        0
      );
    },

    collapseTitle: (member, i) => {
      return (
        (member.who ? "" : "Member ") +
        ("#" + i) +
        (member.who || member.age ? " - " : "") +
        (member.who && member.who != "Other" ? member.who : "") +
        (member.who == "Other" ? member.whoOther : "") +
        (member.age
          ? ` (${member.age}${
              member.ageType != "Years" ? " " + member.ageType : ""
            })`
          : "") +
        (member.additionalInfo ? " - " : "") +
        (member.additionalInfo ?? "")
      );
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
  },
};
</script>
<style lang="scss">
.family-actions {
  text-align: center;
  display: flex;
  .cell {
    align-self: center;
    margin: 0 auto;
    .btn-link {
      color: #fb404b;
    }
  }
}
.v-modal {
  z-index: 1040 !important;
}
.el-dialog__wrapper {
  z-index: 1050 !important;
}
.is-invalid {
  border-color: red;
}
</style>
