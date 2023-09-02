<template>
  <div class="row">
    <div class="col-12">
      <card title="User Details">
        <div class="row" v-if="messages.length">
          <div class="col-12">
            <l-alert type="danger" v-for="m in messages" :key="m">
              <span> {{ getErrorMessage(m) }}</span>
            </l-alert>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <ValidationObserver v-slot="{ handleSubmit }">
              <form @submit.prevent="handleSubmit(submit)">
                <div class="row">
                  <div class="col-md-4">
                    <label for="email">Email Address:</label>
                    <ValidationProvider
                      name="email"
                      rules="required|email"
                      v-slot="{ passed, failed }"
                    >
                      <fg-input
                        type="email"
                        :error="failed ? 'The Email field is required' : null"
                        :hasSuccess="passed"
                        name="email"
                        v-model="userData.email"
                      >
                      </fg-input>
                    </ValidationProvider>
                  </div>
                  <div class="col-md-4">
                    <label for="firstname">First Name:</label>
                    <ValidationProvider
                      name="firstname"
                      rules="required"
                      v-slot="{ passed, failed }"
                    >
                      <fg-input
                        type="firstname"
                        :error="
                          failed ? 'The First Name field is required' : null
                        "
                        :hasSuccess="passed"
                        name="firstname"
                        v-model="userData.firstname"
                      >
                      </fg-input>
                    </ValidationProvider>
                  </div>
                  <div class="col-md-4">
                    <label for="lastname">Last Name:</label>
                    <ValidationProvider
                      name="lastname"
                      rules="required"
                      v-slot="{ passed, failed }"
                    >
                      <fg-input
                        type="lastname"
                        :error="
                          failed ? 'The Last Name field is required' : null
                        "
                        :hasSuccess="passed"
                        name="lastname"
                        v-model="userData.lastname"
                      >
                      </fg-input>
                    </ValidationProvider>
                  </div>
                </div>

                <div>
                  <button type="submit" class="btn btn-info btn-fill btn-wd">
                    Create Admin
                  </button>
                </div>
                <div class="clearfix"></div>
              </form>
            </ValidationObserver>
          </div>
        </div>
      </card>
    </div>
  </div>
</template>
<script>
import { extend } from "vee-validate";
import { required, email, confirmed } from "vee-validate/dist/rules";
import { Table, TableColumn, Select, Option } from "element-ui";
import { createAdmin } from "@/api/users.api";
import LAlert from "src/components/Alert";

extend("email", email);
extend("required", required);
extend("confirmed", confirmed);

export default {
  components: {
    [Select.name]: Select,
    [Option.name]: Option,
    [Table.name]: Table,
    [TableColumn.name]: TableColumn,
    LAlert,
  },
  data() {
    return {
      userData: {
        email: "",
        firstname: "",
        lastname: "",
      },
      messages: [], //[{ error: "There has been an error!" }]
    };
  },
  computed: {},
  methods: {
    async submit() {
      const res = await createAdmin(this.userData);
      if (res.data.success) {
        this.$router.push("/admin/users");
      } else {
        if (res?.data?.messages) {
          this.messages = Object.keys(res?.data?.messages).map((k) => ({
            error: res?.data?.messages[k],
          }));
        }
      }
    },
    getErrorMessage(m) {
      for (const [key, value] of Object.entries(m)) {
        return `${value}`;
      }
    },
  },
  async mounted() {},
};
</script>
<style></style>
