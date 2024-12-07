<template>
  <div class="hampers-data">
    <div class="diagonal-overlay"></div>
    <div class="background-overlay"></div>
    <div class="row text-center align-items-center" :style="cssVars">
      <div class="col col-6 mx-auto">
        <span>Dropped Off</span>
        <div class="widget-circle in">
          {{ droppped }}<br />
          <span style="font-size: 1.5rem; position: absolute; bottom: 70px"
            >({{ dropppedBags }} Bags)</span
          >
        </div>
      </div>
      <div class="col col-6 mx-auto">
        <span>Awaiting</span>
        <div class="widget-circle out">
          {{ pending }}
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
        const pending = (
          (dashData?.data?.allocatedConfirmed ?? 0) -
          (dashData?.data?.hampersDropped ?? 0) -
          (dashData?.data?.hampersDirect ?? 0)
        ).toString();

        return [droppped, dropppedBags, pending];
      } catch (e) {
        console.log(error);
      }
    },
  },
  async mounted() {
    //const isAdmin = await this.userInGroup('admin')
    //if (!isAdmin) {
    //this.$router.push('/organisations/me')
    //} else {

    const infiniteStats = async () => {
      [this.droppped, this.dropppedBags, this.pending] = await this.updateStats(
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
html,
body,
.hampers-data {
  overflow: hidden;
}
</style>
<style>
.hampers-data span {
  font-size: 4.2em;
  display: block;
  margin-top: -44vmin;
}
.hampers-data {
  background: linear-gradient(90deg, #009643 50%, #a68888 50%);
  color: #fff;
  font-weight: bold;
  height: 100vh;
}
.hampers-data > div {
  height: 100vh;
}

div.widget-circle {
  z-index: 1;
  width: 75vmin;
  height: 75vmin;
  box-shadow: 0 0 0 1.875vmin,
    inset 3.75vmin 3.75vmin 7.5vmin rgba(0, 0, 0, 0.125),
    3.75vmin 3.75vmin 7.5vmin rgba(0, 0, 0, 0.125);
  font-size: 37.5vmin;
  text-shadow: 3.75vmin 3.75vmin 7.5vmin rgba(0, 0, 0, 0.125);
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: white;
  border-radius: 50%;
  font-weight: 700;
}
@media (min-width: 600px) {
  div.widget-circle {
    width: 50vmin;
    height: 50vmin;
    box-shadow: 0 0 0 1.25vmin, inset 2.5vmin 2.5vmin 5vmin rgba(0, 0, 0, 0.125),
      2.5vmin 2.5vmin 5vmin rgba(0, 0, 0, 0.125);
    font-size: 18vmin;
    text-shadow: 2.5vmin 2.5vmin 5vmin rgba(0, 0, 0, 0.125);
  }
}

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
.diagonal-overlay {
  width: 100%;
  height: 100%;
  border-bottom: 63vh solid rgba(0, 0, 0, 0.1);
  border-left: 100vw solid transparent;
  position: absolute;
  z-index: 0;
  bottom: 20vh;
}
.background-overlay {
  height: 20vh !important;
  width: 100%;
  position: absolute;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
}
</style>
