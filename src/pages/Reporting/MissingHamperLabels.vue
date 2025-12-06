<template>
  <div v-if="!loading">
    <div>Pending Hampers: {{ pendingHampers.length }}</div>
    <div
      class="page landscape"
      v-for="hamper in pendingHampers"
      :key="hamper.requestId"
    >
      <div class="middle label-grid">
        <div class="label" v-for="count in labelCount" :key="count">
          <p class="id"><strong>ID:</strong> {{ hamper.reference }}</p>

          <p class="code">
            <img :src="hamper.qrDataUrl" />
            <strong>Dynamics</strong>
            <br />
            {{ hamper.familyDetail }}
          </p>

          <div class="label-footer">
            <p>
              <strong>{{ count }} of </strong> <span class="ellipsis">...</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { listFamilies } from "@/api/families.api";

import { createFamilyDetailBasic } from "src/util/common";

import QRCode from "qrcode";
import moment from "moment";

export default defineComponent({
  components: {},
  computed: {
    pendingHampers() {
      let result = this?.familyData ? this.familyData : [];

      const pData = this.$store.getters.getPlatformData;

      result.map((f) => {
        f.authorised = pData?.nominators
          ? pData.nominators.find((n) => n?.GSI2PK === f?.nominatorId)
              ?.status !== "Approved" ?? false
          : false;
        return f;
      });

      if (result.length) {
        const allowedStatuses = [""];
        result = result.filter((d) => {
          return allowedStatuses.length
            ? allowedStatuses.includes(d?.receiveStatus)
            : false;
        });
      }

      result.sort((a, b) =>
        b.reference < a.reference ? 1 : a.reference < b.reference ? -1 : 0
      );

      return result;
    },
  },
  data() {
    return {
      familyData: [],
      labelCount: 6,
      loading: true,
    };
  },
  methods: {
    async getFamilyData() {
      let familiesData = [];

      if (this.data && typeof this.data === "object") {
        familiesData = this.data;
      } else {
        const familiesResult = await listFamilies(
          this.$store.getters.getActiveCampaign
        );
        familiesData = familiesResult?.data ?? [];
      }

      const familyData = await Promise.all(
        familiesData.map(async (f) => {
          const reference = f?.SK ? f.GSI2SK.replace("SK#", "") : "";

          let qrDataUrl = "";
          if (reference) {
            try {
              qrDataUrl = await QRCode.toDataURL(reference, {
                width: 200,
                margin: 2,
                errorCorrectionLevel: "M",
              });
            } catch (err) {
              console.error("Failed to generate QR for", reference, err);
              qrDataUrl = "";
            }
          }

          return {
            requestId: f?.GSI2PK ?? "",
            nominatorId: f?.GSI3SK,
            reference,
            familyDetail: createFamilyDetailBasic(f?.members),
            qrDataUrl,
            receiveStatus: f?.receiveStatus ?? "",
            dateAddedSort: moment(f?.dateAdded).format("YYYYMMDDHHmmss"),
          };
        })
      );

      this.familyData = familyData;
      this.loading = false;
    },
  },

  async mounted() {
    if (!this.userInGroup("admin")) {
      this.$router.push("/");
    }
    await this.getFamilyData();
  },
});
</script>
<style scoped></style>
<style type="text/css">
@page {
  size: a4 landscape;
  margin: 0;
}
html,
body {
  height: 100%;
  font-family: Verdana, sans-serif;
}
html.landscape,
html.landscape {
  size: a4 landscape;
  margin: 0;
}
.page {
  position: relative;
  overflow: hidden;
  page-break-after: always;
  padding: 0;
}
.page.landscape {
  width: 11.7in;
  height: 8.2in;
}
.page.portrait {
  width: 8.3in;
  height: 11.6in;
}
.middle {
  width: 100%;
  height: 90%;
  position: absolute;
  top: 0px;
  bottom: 0px;
  margin: auto;
  margin-top: 0px !important;
  padding: 2rem;
}
.label-grid {
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 20px;
  font-size: 2rem;
}
.label {
  border: dashed 4px black;
  width: 85%;
  padding: 20px;
  font-size: 1.5rem;
}
.label p,
.label-footer p {
  margin: 0;
}
.label-footer {
  display: grid;
  grid-template-columns: 1fr 0.4fr;
  grid-gap: 20px;
  margin-top: 20px;
  width: 100%;
}
.label .id {
}
.label .code {
  font-size: 0.75rem;
  text-align: center;
}
.label .code img {
  margin: 0 auto;
  width: 100%;
  max-width: 160px;
  display: block;
}
.ellipsis {
  font-size: 1.5rem;
  letter-spacing: 0.25rem;
}
</style>
