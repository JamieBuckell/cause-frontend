<template>
  <div class="hampers-data">
    <div class="diagonal-overlay"></div>
    <div class="background-overlay"></div>

    <div class="screen-status">
      <span>{{ campaignName || "Waiting for campaign data" }}</span>
      <span>{{ lastUpdatedLabel }}</span>
    </div>
    <div
      class="row text-center align-items-center hampers-row"
      :style="cssVars"
    >
      <div class="col-12 col-md-8 mx-auto">
        <div class="row text-center align-items-center">
          <div class="col-12 col-md-6 mx-auto mb-5 mb-md-0">
            <span class="hamper-title">Dropped Off</span>
            <div class="widget-circle in">
              <span class="figure-label">{{ hasStats ? droppped : "—" }}</span>
              <span class="bags-label">({{ hasStats ? dropppedBags : "—" }} Bags)</span>
            </div>
          </div>

          <div class="col-12 col-md-6 mx-auto mb-5 mb-md-0">
            <span class="hamper-title">Direct</span>
            <div class="widget-circle in">
              <span class="figure-label">{{ hasStats ? direct : "—" }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4 mx-auto mt-3 mt-md-0 pending-hampers">
        <span class="hamper-title">Awaiting</span>
        <div class="widget-circle out">
          <span class="figure-label">{{ hasStats ? pending : "—" }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { getHamperScreen } from "@/api/dashboard.api";
import { getScannerCampaign } from "@/api/families.api";

export default defineComponent({
  computed: {
    cssVars() {
      const total = this.pending + this.droppped;
      return {
        "--in-percentage": `${total ? Math.round(this.droppped * 100 / total) : 0}%`,
        "--out-percentage": `${total ? Math.round(this.pending * 100 / total) : 0}%`,
      };
    },
    lastUpdatedLabel() {
      return this.lastUpdated
        ? `Last updated ${new Date(this.lastUpdated).toLocaleString("en-GB")}`
        : "Waiting for first update";
    },
  },
  data() {
    return {
      droppped: 0,
      dropppedBags: 0,
      pending: 0,
      direct: 0,
      hasStats: false,
      campaignName: "",
      lastUpdated: null,
      refreshTimer: null,
      refreshing: false,
      stopped: false,
    };
  },
  watch: {
    "$route.params.campaignId"() {
      this.refreshStats();
    },
  },
  methods: {
    async refreshStats() {
      clearTimeout(this.refreshTimer);
      if (this.stopped || this.refreshing) return;
      this.refreshing = true;
      const requestedCampaign = this.$route.params?.campaignId || "";
      try {
        let campaignId = requestedCampaign;
        let campaignName = requestedCampaign;
        if (!campaignId) {
          const response = await getScannerCampaign();
          if (response.status !== 200 || !response.data?.success || !response.data.campaignId) {
            return;
          }
          campaignId = response.data.campaignId;
          campaignName = response.data.campaignName || campaignId;
        }
        const response = await getHamperScreen(campaignId);
        const counts = response.data;
        const fields = ["hampersDropped", "bagsDropped", "hampersDirect", "allocatedConfirmed"];
        if (response.status !== 200 || !fields.every(field =>
          typeof counts?.[field] === "number" && Number.isFinite(counts[field]) && counts[field] >= 0
        )) return;
        // Ignore late responses after navigation or unmounting.
        if (this.stopped || requestedCampaign !== (this.$route.params?.campaignId || "")) return;
        this.droppped = counts.hampersDropped;
        this.dropppedBags = counts.bagsDropped;
        this.direct = counts.hampersDirect;
        this.pending = Math.max(0, counts.allocatedConfirmed - counts.hampersDropped - counts.hampersDirect);
        this.campaignName = campaignName;
        this.hasStats = true;
        this.lastUpdated = Date.now();
      } catch {
        // Keep the last successful figures visible during connection failures.
      } finally {
        this.refreshing = false;
        if (!this.stopped) {
          const routeChanged = requestedCampaign !== (this.$route.params?.campaignId || "");
          this.refreshTimer = setTimeout(() => this.refreshStats(), routeChanged ? 0 : 120000);
        }
      }
    },
  },
  mounted() {
    this.refreshStats();
  },
  beforeDestroy() {
    this.stopped = true;
    clearTimeout(this.refreshTimer);
  },
});
</script>
<style scoped>
.screen-status {
  position: absolute;
  top: 1rem;
  left: 1rem;
  right: 1rem;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: normal;
}

.hampers-data {
  overflow: hidden;
}
</style>
<style>
.hampers-data {
  position: relative;
  background: linear-gradient(90deg, #009643 65.5%, #a68888 31.5%);
  color: #fff;
  font-weight: bold;
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.hampers-row {
  min-width: 100%;
  position: relative;
  z-index: 1; /* above the overlays */
}

.hampers-data .hamper-title {
  font-size: 3.4rem;
  display: block;
  margin-bottom: 1.5rem;
}

.hampers-data .figure-label,
.hampers-data .bags-label {
  display: block;
}

.hampers-data .bags-label {
  font-size: 1.5rem;
}

/* CIRCLES – dynamic, non-overlapping */
div.widget-circle {
  --circle-size: clamp(260px, 28vw, 720px);

  z-index: 1;
  width: var(--circle-size);
  height: var(--circle-size);

  box-shadow: 0 0 0 1.875vmin,
    inset 3.75vmin 3.75vmin 7.5vmin rgba(0, 0, 0, 0.125),
    3.75vmin 3.75vmin 7.5vmin rgba(0, 0, 0, 0.125);

  /* base font-size for the big number */
  font-size: calc(var(--circle-size) / 2.6);
  text-shadow: 3.75vmin 3.75vmin 7.5vmin rgba(0, 0, 0, 0.125);

  position: relative; /* important: anchor for absolute children */
  margin: 0 auto;
  border-radius: 50%;
  overflow: hidden;
  color: white;
  font-weight: 700;
}

.hampers-data .figure-label {
  position: absolute;
  top: 48%; /* centre-ish */
  left: 50%;
  transform: translate(-50%, -50%);
  line-height: 1;
}

.hampers-data .bags-label {
  position: absolute;
  bottom: 12%; /* percentage of circle height, scales nicely */
  left: 50%;
  transform: translateX(-50%);
  font-size: calc(var(--circle-size) / 14); /* smaller than main figure */
  line-height: 1.2;
}

/* Slight tweaks on medium and down */
@media (max-width: 991.98px) {
  .hampers-data {
    align-items: flex-start;
    padding: 5rem 0 3rem;
  }

  .hampers-data .hamper-title {
    font-size: 2.4rem;
    margin-bottom: 1rem;
  }

  div.widget-circle {
    --circle-size: clamp(200px, 55vmin, 360px);
    margin-bottom: 2.5rem;
  }
}

/* Mobile: stack, smaller titles, optional overlay hide */
@media (max-width: 767.98px) {
  .hampers-data {
    padding: 5rem 0 4rem;
    background: linear-gradient(90deg, #009643 65.5%, #009643 31.5%);
  }

  .pending-hampers {
    background-color: #a68888;
  }

  .hampers-data .hamper-title {
    font-size: 2rem;
  }

  .diagonal-overlay,
  .background-overlay {
    display: none; /* optional: keeps tiny screens clean */
  }
}

/* Beat animation kept as-is */
@-webkit-keyframes timer_beat {
  40%,
  80% {
    transform: none;
  }
  50% {
    transform: scale(1.125);
  }
}
@keyframes timer_beat {
  40%,
  80% {
    transform: none;
  }
  50% {
    transform: scale(1.125);
  }
}

/* Fill overlay inside the circle */
div.widget-circle:after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  z-index: -100;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.125);
}

div.widget-circle.in:after {
  transform: translateY(var(--in-percentage));
}

div.widget-circle.out:after {
  transform: translateY(var(--out-percentage));
}

/* Background overlays */
.diagonal-overlay {
  width: 100%;
  height: 100%;
  border-bottom: 63vh solid rgba(0, 0, 0, 0.1);
  border-left: 100vw solid transparent;
  position: absolute;
  z-index: 0;
  bottom: 20vh;
  left: 0;
}

.background-overlay {
  height: 20vh !important;
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 0;
}
</style>
