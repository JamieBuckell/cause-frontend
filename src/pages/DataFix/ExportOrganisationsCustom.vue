<template>
  <div class="row">
    <div class="col-12">Download should start automagically</div>
  </div>
</template>
<script>
export default {
  props: {
    organisationId: {
      type: String,
      default: "",
    },
    paginateOptions: {
      type: Object,
      default: () => ({
        perPage: 50,
        perPageOptions: [25, 50, 100, 150, 200],
      }),
    },
    searchKeys: {
      type: Array,
      default: () => ["reference", "name"],
    },
    options: {
      type: Object,
      default: () => ({
        create: false,
        update: true,
        delete: true,
        download: true,
      }),
    },
  },
  data() {
    return {};
  },
  methods: {
    async getOrganisationsData() {
      var pData = this.$store.getters.getPlatformData;

      if (!pData?.organisations) {
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

      this.tableData = Object.values(pData?.organisations ?? []);

      this.tableData.map((o) => {
        o.reference = `${o.SK}`;
        o.name = `${o.organisation.name}`;
        o.totalFamilies = `${o.totalFamilies}`;
        o.totalNominators = `${
          this.platformData.nominators.filter((f) => f?.GSI3PK === o.GSI2PK)
            .length ?? 0
        }`;
        return true;
      });
    },
  },
  computed: {
    platformData() {
      return this.$store.getters.getPlatformData;
    },
  },
  async mounted() {
    if (!this.userInGroup("admin") && !this.organisationId) {
      this.$router.push("/");
    }
    await this.getOrganisationsData();

    let rows = [
      [
        "Ref",
        "Name",
        "Team Lead Name",
        "Team Lead Email",
        "Team Lead Contact Number",
      ],
    ];

    const allNominators = await this.platformData?.nominators;

    const data = this.tableData.map((organisation) => {
      const orgTls = allNominators.filter(
        (n) => n?.GSI3PK === organisation.GSI2PK && n?.type === "team-lead"
      );

      if (orgTls.length) {
        return orgTls.map((teamLead) => {
          return [
            `"${organisation.reference}"`,
            `"${organisation.name ? organisation.name : ""}"`,
            `"${teamLead?.nominatorDetails?.firstName} ${teamLead?.nominatorDetails?.lastName}"`,
            `"${teamLead?.nominatorDetails?.email}"`,
            `"${teamLead?.nominatorDetails?.telephone}"`,
          ];
        });
      } else {
        return [
          `"${organisation.reference}"`,
          `"${organisation.name ? organisation.name : ""}"`,
          `""`,
          `""`,
          `""`,
        ];
      }
    });
    rows.push(...data);

    let csvContent =
      "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");

    var encodedUri = encodeURI(csvContent);
    /* */
    var link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `all-organisations-list.csv`);
    document.body.appendChild(link); // Required for FF

    link.click();
    link.remove();
  },
};
</script>
