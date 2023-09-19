<template>
  <div class="container">
    <form>
      <div class="row">
        <div class="col-md-12">
          <card>
            <template slot="header">
              <h4 class="card-title">New Subscriber</h4>
            </template>

            <div class="row" v-if="messages.length">
              <div class="col-12">
                <l-alert type="danger" v-for="(m, i) in messages" :key="i">
                  <span> {{ m }}</span>
                </l-alert>
              </div>
            </div>
            <div class="row">
              <div class="col-md-6">
                <fg-input
                  type="text"
                  label="Firstname"
                  v-model="model.firstName"
                >
                </fg-input>
              </div>
              <div class="col-md-6">
                <fg-input type="text" label="Lastname" v-model="model.lastName">
                </fg-input>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <fg-input
                  type="text"
                  label="Email"
                  v-model="model.emailAddress"
                >
                </fg-input>
              </div>
            </div>
            <div class="row">
              <div class="col-md-12">
                <fg-input type="text" label="Company" v-model="model.company">
                </fg-input>
              </div>
            </div>
          </card>
        </div>
      </div>
      <div class="pb-4">
        <button
          type="submit"
          class="btn btn-info btn-fill btn-wd float-right"
          @click.prevent="createSubscriber"
        >
          Create Subscriber
        </button>
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
import { createSubscriber } from "@/api/subscribers.api";
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
  props: {},
  data() {
    return {
      messages: [],
      model: {
        firstName: "",
        lastName: "",
        emailAddress: "",
        company: "",
      },
      activePanel: 0,
      nominations: [],
    };
  },
  computed: {
    breakpoints: () => breakpoints.screen,
  },
  mounted() {
    this.resetWindow();
  },
  methods: {
    async resetWindow() {
      this.activePanel = 0;
      this.nominations = [];
    },
    async createSubscriber() {
      const created = await createSubscriber({
        firstname: this.model.firstName,
        lastname: this.model.lastName,
        email: this.model.emailAddress,
        company: this.model.company,
      });
      if (created.status == 200) {
        return true;
      } else {
        if (created.data.messages) {
          this.messages = [];
          for (const [key, value] of Object.entries(created.data.messages)) {
            this.messages.push(value);
          }
        }
      }
    },
  },
};
</script>
<style></style>
