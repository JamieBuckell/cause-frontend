<template>
  <div class="container">
    <div class="split-loading" v-if="splittingFamily">
      <div class="center">
        <div class="spinner-border text-muted" role="status">
          <span class="sr-only">Loading...</span>
        </div>
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
      <div>
        <div class="row">
          <div class="col-md-12">
            <card class="mb-3">
              <template slot="header">
                <h4 class="card-title">Family Members</h4>
                <p class="card-category">
                  Family Total:
                  {{ hamperData.adults + hamperData.children }} (Adults:
                  {{ hamperData.adults }} Children: {{ hamperData.children }})
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
                v-for="(member, memberIndex) in hamperData.members"
                :key="memberIndex"
              >
                <div class="col-md-2">
                  <el-select
                    class="select-default mb-0 w-100"
                    autocomplete="off"
                    v-model="member.familyNumber"
                    placeholder="Group"
                    filterable
                    default-first-option
                    data-lpignore="true"
                    data-form-type="other"
                    @change="assignNewHamperID(member)"
                  >
                    <el-option
                      class="select-default"
                      v-for="(mem, familyNumber) in hamperData.members"
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
import Swal from "sweetalert2";

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
    async familyData() {
      this.resetWindow();
      this.chosenNominatorId = this.nominatorId;
      this.addFamily();
    },
  },
  data() {
    return {
      splittingFamily: false,
      activePanel: 0,
      hamperData: {},
      familyMembers: [],
      chosenNominatorId: "",
      nominatorRef: "",
      orgRef: "",
      chosenNominator: {},
      usedReferences: {},
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
        (f) => f?.nominatorId == this.chosenNominatorId
      );
    },
    breakpoints: () => breakpoints.screen,
    familyCount() {
      return this.nominatorsFamilies.length;
    },
    nominatorsReference() {
      let returnRef = this.nominatorRef;

      if (!returnRef && this.chosenNominator.userReference) {
        returnRef = this.chosenNominator.userReference;
      }

      return returnRef;
    },
    platformData() {
      return this.$store.getters.getPlatformData;
    },
  },
  async mounted() {
    this.resetWindow();
    this.chosenNominatorId = this.nominatorId;
    this.addFamily();
  },
  methods: {
    getHamperReference() {
      return `${this.orgRef}${this.nominatorsReference}-${this.nextHamperId()}`;
    },
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
    nextHamperId() {
      // Todo: check all hampers for this user
      // hamperData
      const totalNewNominations = 0;

      let validHamperId = (
        this.familyCount +
        Object.entries(this.usedReferences).length +
        1
      )
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
            (f) => f.reference === this.getHamperReference()
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
    manualHamperId(member) {
      const memberIndex = this.hamperData.members.findIndex(
        (fm) => fm.requestId === member.requestId
      );
      this.hamperData.members[memberIndex].hamperId = member.hamperId;
    },
    assignNewHamperID(member) {
      if (member.familyNumber > 1) {
        if (this.usedReferences[member.familyNumber]) {
          member.hamperId = this.usedReferences[member.familyNumber];
        } else {
          member.hamperId = `${member.hamperId}${(member.familyNumber + 9)
            .toString(36)
            .toUpperCase()}`; // this.getHamperReference();
          this.usedReferences[member.familyNumber] = member.hamperId;

          if (member.hamperId !== this.hamperData.reference) {
            const refCheck = this.splitData.find(
              (f) => f.hamperId === member.hamperId
            );
            if (!refCheck) {
              this.splitData.push({ hamperId: member.hamperId });
            }
          }
        }
        /* */
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
    changeNominator(nominatorId) {
      const nominator = this.allNominators.find(
        (n) => n.requestId === this.chosenNominatorId
      );
      if (nominator) {
        this.setChosenNominator(nominator);
        // this.hamperData.hamperId = this.getHamperReference();
      }
    },
    async resetWindow() {
      this.activePanel = 0;
      this.hamperData = {};
      this.usedReferences = {};
    },
    async splitFamilies() {
      this.splittingFamily = true;
      const res = await splitFamily(this.hamperData);
      if (res.status == 200) {
        const familyData = res?.data?.families;
        this.$emit("splitFamilies", familyData);
        this.hamperData = {};
      } else {
        if (res?.data?.messages) {
          this.messages = Object.keys(res?.data?.messages).map((k) => ({
            error: res?.data?.messages[k],
          }));
        }
      }
      this.splittingFamily = false;
    },
    addFamily() {
      const nom = this.platformData.nominators.find(
        (n) => n.GSI2PK === this.familyData?.nominatorId
      );
      const org = this.platformData.organisations.find(
        (o) => o.GSI2PK === nom.GSI3PK
      );
      this.orgRef = org.SK;
      this.nominatorRef = nom.nominatorDetails.reference;

      this.hamperData = {
        campaign: this.$store.getters.getActiveCampaign,
        familyId: this.familyData?.requestId,
        nominatorId: this.familyData?.nominatorId,
        hamperId: this.familyData?.reference
          ? this.familyData.reference
          : this.getHamperReference(),
        adults: 0,
        children: 0,
        members: [],
      };
      if (this.familyData.members.length) {
        for (const [k, member] of this.familyData.members.entries()) {
          this.hamperData.members.push({
            memberId: member.requestId,
            age: member.age,
            ageType: member.ageType,
            who: member.who,
            whoOther: member.whoOther,
            additionalInfo: member.additionalInfo,
            familyNumber: 1,
            hamperId: this.hamperData.hamperId,
          });
        }
      } else {
        this.hamperData.members.push({
          age: "",
          ageType: "Years",
          who: "",
          additionalInfo: "",
        });
      }

      this.calculateAges(this.hamperData.members.length - 1);
    },
    calculateAges(index) {
      this.hamperData.adults = this.hamperData.members.reduce(function (a, b) {
        return a + (b["age"] === "" || b["age"] < 18 ? 0 : 1);
      }, 0);
      this.hamperData.children = this.hamperData.members.reduce(function (
        a,
        b
      ) {
        return a + (b["age"] !== "" && b["age"] < 18 ? 1 : 0);
      },
      0);
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
.container {
  position: relative;
}
.split-loading {
  padding: 30px 15px;
  min-height: 100%;
  position: absolute;
  background: rgba(255, 255, 255, 0.7);
  width: 100%;
  z-index: 1000;
  padding-top: 90px;
  text-align: center;
  .center {
    margin: 0;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .spinner-border {
      z-index: 1001;
      width: 4rem;
      height: 4rem;
      border-width: 0.5em;
    }
  }
}
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
