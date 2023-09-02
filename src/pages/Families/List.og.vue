<template>
  <div class="row">
    <div class="col-12">
      <FamiliesList
        :paginate="true"
        :allowSearch="true"
        :paginateOptions="paginateOptions"
      />
    </div>
  </div>
</template>
<script>
import FamiliesList from "@/components/Cards/FamiliesList.vue";

export default {
  components: { FamiliesList },
  data() {
    return {
      paginateOptions: {
        perPage: 50,
        perPageOptions: [25, 50, 100, 150, 200]
      }
    };
  },
  computed: {},
  methods: {},
  mounted() {
  },
};
</script>
<style></style>
