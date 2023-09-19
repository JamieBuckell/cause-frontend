<template>
  <div class="container">
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
                <h4 class="card-title">Family Members</h4>
                <p class="card-category">
                  Family Total:
                  {{ nomination.adults + nomination.children }} (Adults:
                  {{ nomination.adults }} Children: {{ nomination.children }})
                </p>
              </template>
              <div class="row d-none d-md-flex">
                <div class="col-md-2">Family Group</div>
                <div class="col-md-3"><label>Hamper ID</label></div>
                <div class="col-md-2"><label>Who</label></div>
                <div class="col-md-2"><label>Age</label></div>
                <div class="col-md-3">
                  <label>Additional Information</label>
                </div>
                <div class="col-md-1"></div>
              </div>
              <div
                class="row"
                v-for="(member, memberIndex) in nomination.members"
                :key="memberIndex"
              >
                <div class="col-md-2">
                  <el-select
                    class="select-default mb-0 w-100"
                    v-model="member.familyNumber"
                    placeholder="Who"
                    filterable
                    default-first-option
                    @change="assignNewHamperID(member, nomIndex)"
                  >
                    <el-option
                      class="select-default"
                      v-for="(mem, familyNumber) in nomination.members"
                      :key="familyNumber + 1"
                      :label="familyNumber + 1"
                      :value="familyNumber + 1"
                    >
                    </el-option>
                  </el-select>
                </div>
                <div class="col-md-3">
                  <el-input
                    type="text"
                    class="mb-0"
                    placeholder="Please specify"
                    v-model="member.hamperId"
                    @change="manualHamperId(member)"
                  />
                </div>
                <div class="col-md-2">
                  <label class="d-block d-md-none">Who</label>
                  {{ member.who }}
                  <span v-if="member.who == 'Other'"
                    >({{ member.whoOther }})</span
                  >
                </div>
                <div class="col-md-2">
                  <label class="d-block d-md-none pt-3">Age</label>
                  {{ member.age }} {{ member.ageType }}
                </div>

                <div class="col-md-3">
                  <label class="d-block d-md-none pt-3"
                    >Additional Information</label
                  >
                  {{
                    member.additionalInfo
                      ? member.additionalInfo
                      : "None specified"
                  }}
                </div>
              </div>
              <template slot="footer">
                <button
                  type="submit"
                  class="btn btn-info btn-fill btn-wd float-right"
                  @click.prevent="splitFamilies"
                  :disabled="splittingFamily"
                >
                  Split Family
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
import { splitFamily } from "@/api/families.api";
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
    orgRef: {
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
  },
  watch: {
    familyData(newVal) {
      this.resetWindow();
      this.updatedData = newVal;
    },
  },
  data() {
    return {
      splittingFamily: false,
      activePanel: 0,
      nominations: [],
      chosenNominatorId: "",
      chosenNominator: {},
      updatedData: [],
      splitData: [],
      selectionOptions: {
        adult: ["mum", "dad"],
        child: ["Boy", "Girl"],
      },
      messages: [],
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
      return Array.from(Array(115).keys());
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
        ? this.nominations.length + this.splitData.length
        : 0;

      let validHamperId = (this.familyCount + totalNewNominations)
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
      let returnRef = this.nominatorRef;

      if (!returnRef && this.chosenNominator.userReference) {
        returnRef = this.chosenNominator.userReference;
      }

      return returnRef;
    },
    getHamperReference() {
      return `${this.orgRef}${this.nominatorsReference}-${this.nextHamperId}`;
    },
  },
  async mounted() {
    this.resetWindow();

    this.chosenNominatorId = this.nominatorId;

    /* *
    const storedNominator = this.$store.getters.getGenericData("SplitFamilyChosenNominator");
    console.log("storedNominator", storedNominator, this.allNominators);
    if (this.allNominators.length) {
      const storedNomExists = storedNominator && storedNominator.requestId ? this.allNominators.find(n => n.requestId === storedNominator.requestId) : false;
      this.chosenNominatorId = storedNomExists ? storedNomExists.requestId : this.allNominators[0].requestId;
    }
    /* */
    this.changeNominator();
  },
  methods: {
    manualHamperId(member) {
      const memberIndex = this.updatedData.members.findIndex(
        (fm) => fm.requestId === member.requestId
      );
      this.updatedData.members[memberIndex].hamperId = member.hamperId;
    },
    assignNewHamperID(member, nomIndex) {
      if (member.familyNumber === 1) {
        /* *
        if (member.hamperId !== this.familyData.reference) {
          this.splitData.splice(this.splitData.findIndex(fm => fm.hamperId === member.hamperId), 1);
        }
        /* */
        member.hamperId = this.familyData.reference;
      } else {
        const existing = this.nominations[nomIndex].members.filter(
          (m) =>
            m.familyNumber === member.familyNumber &&
            m.requestId != member.requestId
        );
        if (
          existing &&
          existing[0] &&
          existing[0].hamperId &&
          existing[0].hamperId !== this.familyData.reference
        ) {
          member.hamperId = `${existing[0].hamperId}`;
        } else {
          member.hamperId = `${this.orgRef}-${this.nextHamperId}`;
        }
        if (member.hamperId !== this.familyData.reference) {
          const refCheck = this.splitData.find(
            (f) => f.hamperId === member.hamperId
          );
          if (!refCheck) {
            this.splitData.push({ hamperId: member.hamperId });
          }
        }
      }

      const memberIndex = this.updatedData.members.findIndex(
        (fm) => fm.requestId === member.requestId
      );
      if (memberIndex >= 0) {
        this.updatedData.members[memberIndex].hamperId = member.hamperId;
        this.updatedData.members[memberIndex].familyNumber =
          member.familyNumber;
      }
    },
    setChosenNominator(nominator) {
      this.chosenNominator = nominator;
      this.chosenNominatorId = nominator.requestId;

      this.$store.dispatch("setGenericData", {
        key: "SplitFamilyChosenNominator",
        data: nominator,
      });
    },
    changeNominator() {
      const nominator = this.allNominators.find(
        (n) => n.requestId === this.chosenNominatorId
      );
      if (nominator) {
        this.setChosenNominator(nominator);
        this.nominations[0].hamperId = this.getHamperReference;
      }
    },
    async resetWindow() {
      this.activePanel = 0;

      const familyDetail = {
        hamperId: `${this.familyData.reference}`,
        adults: 0,
        children: 0,
        members: [],
      };

      for (const [key, member] of Object.entries(this.familyData.members)) {
        familyDetail.members.push({
          requestId: member.requestId,
          familyNumber: 1,
          hamperId: `${this.familyData.reference}`,
          age: member.age,
          ageType: member.ageType,
          who: member.who,
          additionalInfo: member.additionalInfo,
        });
      }
      this.updatedData = { ...this.familyData };

      this.nominations = [familyDetail];
    },
    async splitFamilies() {
      this.splittingFamily = true;
      /* */
      const res = await splitFamily(this.updatedData);
      if (res.status == 200) {
        const familyData = res?.data?.families;
        this.$emit("splitFamilies", familyData);
        this.nominations = [];
      } else {
        if (res?.data?.messages) {
          this.messages = Object.keys(res?.data?.messages).map((k) => ({
            error: res?.data?.messages[k],
          }));
        }
      }
      /* */
      this.splittingFamily = false;
    },
    addFamily() {
      this.nominations.unshift({
        hamperId: this.getHamperReference,
        adults: 0,
        children: 0,
        members: [
          {
            age: "",
            ageType: "Years",
            who: "",
            additionalInfo: "",
          },
        ],
      });
    },
    calculateAges(index) {
      this.nominations[index].adults = this.nominations[index].members.reduce(
        function (a, b) {
          return a + (b["age"] === "" || b["age"] < 18 ? 0 : 1);
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
</style>
