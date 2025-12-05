<template>
  <div class="hampers-data">
    <div class="diagonal-overlay"></div>
    <div class="background-overlay"></div>

    <!-- add hampers-row here -->
    <div
      class="row text-center align-items-center hampers-row"
      :style="cssVars"
    >
      <div class="col-12 col-md-8 mx-auto">
        <div class="row text-center align-items-center">
          <div class="col-12 col-md-6 mx-auto mb-5 mb-md-0">
            <span class="hamper-title">Dropped Off</span>
            <div class="widget-circle in">
              <span class="figure-label">{{ droppped }}</span>
              <span class="bags-label">({{ dropppedBags }} Bags)</span>
            </div>
          </div>

          <div class="col-12 col-md-6 mx-auto mb-5 mb-md-0">
            <span class="hamper-title">Direct</span>
            <div class="widget-circle in">
              <span class="figure-label">{{ direct }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="col-12 col-md-4 mx-auto mt-3 mt-md-0">
        <span class="hamper-title">Awaiting</span>
        <div class="widget-circle out">
          <span class="figure-label">{{ pending }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from "vue";
import { getHamperScreen } from "@/api/dashboard.api";
import config from "@/config";

export default defineComponent({
  components: {},
  computed: {
    cssVars() {
      return {
        "--in-percentage": Math.round(
          (this.droppped * 100) / (this.pending + this.droppped)
        ).toFixed(2),
        "--out-percentage": Math.round(
          (this.pending * 100) / (this.pending + this.droppped)
        ).toFixed(2),
      };
    },
  },
  data() {
    return {
      droppped: 0,
      dropppedBags: 0,
      pending: 0,
      direct: 0,
    };
  },
  methods: {
    updateStats: async (campaignId) => {
      try {
        const dashData = await getHamperScreen(
          campaignId && campaignId.length
            ? campaignId
            : config.portalDefaults.campaign
        );
        const droppped = (dashData.data.hampersDropped ?? 0).toString();
        const dropppedBags = (dashData.data.bagsDropped ?? 0).toString();
        const direct = (dashData.data.hampersDirect ?? 0).toString();
        const pending = (
          (dashData?.data?.allocatedConfirmed ?? 0) -
          (dashData?.data?.hampersDropped ?? 0) -
          (dashData?.data?.hampersDirect ?? 0)
        ).toString();

        return [droppped, dropppedBags, pending, direct];
      } catch (e) {
        /* eslint-disable no-console */
        console.log(error);
        /* eslint-enable no-console */
      }
    },
  },
  async mounted() {
    //const isAdmin = await this.userInGroup('admin')
    //if (!isAdmin) {
    //this.$router.push('/organisations/me')
    //} else {

    const infiniteStats = async () => {
      [this.droppped, this.dropppedBags, this.pending, this.direct] =
        await this.updateStats(
          this.$route.params?.campaignId ??
            this.$store.getters.getActiveCampaign
        );
      setTimeout(async () => {
        await infiniteStats();
      }, "120000");
    };
    infiniteStats();
    //}
  },
});
</script>
<style scoped>
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
  width: 100%;
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
    padding: 2rem 0 3rem;
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
    padding: 2rem 0 4rem;
    background: linear-gradient(90deg, #009643 65.5%, #009643 31.5%);
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
