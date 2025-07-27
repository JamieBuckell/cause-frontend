<template>
  <div class="container">
    <card>
      <div slot="header">
        <h4 class="title">Nominate Families</h4>
      </div>
      <div>
        <button
          type="submit"
          class="btn btn-info btn-fill btn-wd"
          @click.prevent="addFamily"
        >
          Add Family
        </button>

        <button
          type="submit"
          class="btn btn-info btn-fill btn-wd float-right"
          @click.prevent="createFamilies"
        >
          Save Families
        </button>
      </div>
    </card>
    <form>
      <div v-for="(nomination, nomIndex) in nominations" :key="nomIndex">
        <div class="row">
          <div class="col-md-3">
            <card>
              <template slot="header">
                <h4 class="card-title">{{ nomination.hamperId }}</h4>
                <p class="card-category">
                  Family Total:
                  {{ nomination.adults + nomination.children }}<br /><br />
                  Adults: {{ nomination.adults }}<br />
                  Children: {{ nomination.children }}
                </p>
              </template>
            </card>
          </div>
          <div class="col-md-9">
            <card>
              <template slot="header">
                <button
                  type="submit"
                  class="btn btn-info btn-fill btn-wd mt-2 float-right"
                  @click.prevent="addFamilyMember(nomIndex)"
                >
                  Add Family Member
                </button>
                <h4 class="card-title">Family Members</h4>
                <p class="card-category">
                  Family Total:
                  {{ nomination.adults + nomination.children }}
                </p>
              </template>
              <div
                class="row d-none d-md-flex"
                v-if="nomination.members.length"
              >
                <div class="col-md-2"><label>&nbsp;</label></div>
                <div class="col-md-2"><label>Who</label></div>
                <div class="col-md-2"><label>Age</label></div>
                <div class="col-md-6">
                  <label>Any Additional Information</label>
                </div>
              </div>

              <el-collapse v-model="activePanel">
                <el-collapse-item
                  :title="
                    collapseTitle(
                      member,
                      nomination.members.length - memberIndex
                    )
                  "
                  :name="memberIndex"
                  v-for="(member, memberIndex) in nomination.members"
                  :key="memberIndex"
                >
                  <div class="row pt-3">
                    <div class="col-md-3">
                      <el-select
                        class="select-default mb-3 w-100"
                        v-model="member.who"
                        placeholder="Who"
                        filterable
                        default-first-option
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
                      <div v-if="member.who == 'Other'">
                        <el-input
                          type="text"
                          class="mb-3"
                          placeholder="Please specify"
                          v-model="member.whoOther"
                        />
                      </div>
                    </div>
                    <div class="col-md-3">
                      <el-select
                        class="select-default mb-3 w-100"
                        v-model="member.age"
                        @change="calculateAges(nomIndex)"
                        placeholder="Age"
                        filterable
                        default-first-option
                      >
                        <el-option
                          class="select-default"
                          v-for="item in ageList"
                          :key="item"
                          :label="item"
                          :value="item"
                        >
                        </el-option>
                      </el-select>

                      <el-select
                        class="select-default mb-3 w-100"
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
                    <div class="col-md-6">
                      <fg-input
                        type="text"
                        placeholder="Dietary Requirements/Special Needs etc"
                        :label="isMobile ? 'Any Additional Information' : ''"
                        v-model="member.additionalInfo"
                      >
                      </fg-input
                      ><br />

                      <button
                        type="submit"
                        class="btn btn-danger btn-fill btn-wd pull-right"
                        @click.prevent="
                          removeFamilyMember(nomIndex, memberIndex)
                        "
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
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
import { createFamily } from "@/api/families.api";
import { getMeData } from "@/api/users.api";
export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    [Collapse.name]: Collapse,
    [CollapseItem.name]: CollapseItem,
  },
  data() {
    return {
      activePanel: 0,
      nominations: [],
      selectionOptions: {
        adult: ["mum", "dad"],
        child: ["Boy", "Girl"],
      },
    };
  },
  computed: {
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
    nextHamperId() {
      let nextId = (this.nominations.length + 1).toString().padStart(3, "0");

      return nextId;
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
    const userData = await getMeData();
    // console.log(userData);
  },
  methods: {
    async createFamilies() {
      await createFamily({
        nominatorId: "4c57e2bc-cd99-4a7f-8b49-4aeecf368fba",
        nominations: this.nominations,
      });
    },
    addFamily() {
      this.nominations.unshift({
        hamperId: `MS1-${this.nextHamperId}`,
        adults: 0,
        children: 0,
        members: [],
      });
    },
    addFamilyMember(index) {
      this.nominations[index].members.unshift({
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
  },
};
</script>
<style></style>
