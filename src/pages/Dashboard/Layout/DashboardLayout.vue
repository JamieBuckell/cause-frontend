<template>
  <div class="wrapper" :class="{ 'nav-open': $sidebar.showSidebar }">
    <notifications></notifications>
    <side-bar>
      <user-menu :title="getUsersName"></user-menu>
      <!--<mobile-menu></mobile-menu>-->
      <template slot="links">
        <sidebar-item
          v-if="checkRole('admin')"
          :link="{
            name: 'Dashboard',
            icon: 'nc-icon nc-chart-pie-35',
            path: '/admin/overview',
          }"
        >
        </sidebar-item>

        <sidebar-item
          v-if="checkRole('admin')"
          :link="{ name: 'Campaigns', icon: 'nc-icon nc-spaceship' }"
        >
          <sidebar-item
            :link="{ name: 'View All', path: '/campaigns' }"
          ></sidebar-item>
          <sidebar-item
            :link="{ name: 'Add New', path: '/campaigns/add' }"
          ></sidebar-item>
        </sidebar-item>
        <sidebar-item
          v-if="checkRole('admin')"
          :link="{ name: 'QR Scanner', icon: 'nc-icon nc-mobile' }"
        >
          <sidebar-item
            :link="{
              name: 'Hampers',
              path: '/hampers/scan',
              target: '_blank',
              isRoute: false,
            }"
          ></sidebar-item>
        </sidebar-item>

        <sidebar-item
          v-if="checkRole('admin')"
          :link="{ name: 'Organisations', icon: 'nc-icon nc-istanbul' }"
        >
          <sidebar-item
            v-if="checkRole('admin')"
            :link="{ name: 'Add New', path: '/organisations/add' }"
          ></sidebar-item>
          <sidebar-item
            v-if="checkRole('admin')"
            :link="{ name: 'View All', path: '/organisations' }"
          ></sidebar-item>
        </sidebar-item>

        <sidebar-item
          v-if="
            !checkRole('admin') &&
            (checkRole('teamlead') || checkRole('nominator'))
          "
          :link="{
            name: 'My Organisation',
            icon: 'nc-icon nc-istanbul',
            path: '/organisations/me',
          }"
        >
        </sidebar-item>

        <sidebar-item
          v-if="checkRole('admin')"
          :link="{ name: 'Nominators', icon: 'nc-icon nc-light-3' }"
        >
          <sidebar-item
            :link="{ name: 'View All', path: '/nominators' }"
          ></sidebar-item>
        </sidebar-item>

        <sidebar-item
          v-if="checkRole('admin')"
          :link="{ name: 'Families', icon: 'nc-icon nc-app' }"
        >
          <sidebar-item
            :link="{ name: 'View All', path: '/families/list' }"
          ></sidebar-item>
          <sidebar-item
            :link="{ name: 'Hampers', path: '/hampers/list' }"
          ></sidebar-item>
        </sidebar-item>

        <sidebar-item
          v-if="checkRole('admin')"
          :link="{ name: 'Donors', icon: 'nc-icon nc-delivery-fast' }"
        >
          <sidebar-item
            :link="{ name: 'View All', path: '/donors' }"
          ></sidebar-item>
        </sidebar-item>

        <sidebar-item
          v-if="checkRole('admin')"
          :link="{ name: 'Subscribers', icon: 'nc-icon nc-email-85' }"
        >
          <sidebar-item
            :link="{ name: 'View All', path: '/subscribers' }"
          ></sidebar-item>
        </sidebar-item>

        <sidebar-item
          v-if="checkRole('admin')"
          :link="{ name: 'Feedback', icon: 'nc-icon nc-quote' }"
        >
          <sidebar-item
            :link="{ name: 'Families', path: '/feedback/families' }"
          ></sidebar-item>
          <sidebar-item
            :link="{ name: 'Volunteers', path: '/feedback/volunteers' }"
          ></sidebar-item>
        </sidebar-item>

        <sidebar-item
          v-if="checkRole('admin')"
          :link="{ name: 'Communications', icon: 'nc-icon nc-notification-70' }"
        >
          <sidebar-item
            :link="{ name: 'Send Email', path: '/communications/create' }"
          ></sidebar-item>
          <sidebar-item
            :link="{ name: 'Previous Emails', path: '/communications/sent' }"
          ></sidebar-item>
          <sidebar-item
            :link="{ name: 'Email Templates', path: '/communications/emails' }"
          ></sidebar-item>
        </sidebar-item>

        <!----
        <sidebar-item
          v-if="checkRole('admin')"
          :link="{ name: 'Lists', icon: 'nc-icon nc-notes' }"
        >
          <sidebar-item
            :link="{
              name: 'Undelivered Hampers',
              path: '/lists/undelivered',
            }"
          ></sidebar-item>
          <sidebar-item
            :link="{
              name: 'Undelivered Donors',
              path: '/lists/undelivered-donors',
            }"
          ></sidebar-item>
        </sidebar-item>
        -->

        <sidebar-item
          v-if="checkRole('admin')"
          :link="{ name: 'Admin Users', icon: 'nc-icon nc-badge' }"
        >
          <sidebar-item
            :link="{ name: 'View All', path: '/admin/users' }"
          ></sidebar-item>
          <sidebar-item
            v-if="checkRole('admin')"
            :link="{ name: 'Add New', path: '/admin/users/add' }"
          ></sidebar-item>
        </sidebar-item>

        <sidebar-item
          v-if="checkRole('admin')"
          :link="{
            name: 'Screens',
            icon: 'nc-icon nc-tv-2',
            path: '/screens/drop-offs',
          }"
        >
          <sidebar-item
            v-if="checkRole('admin')"
            :link="{
              name: 'Drop Offs',
              path: '/screens/drop-offs',
              target: '_blank',
              isRoute: false,
            }"
          ></sidebar-item>
        </sidebar-item>

        <sidebar-item
          v-if="isJamie()"
          :link="{ name: 'Data Stuff', icon: 'nc-icon nc-app' }"
        >
          <sidebar-item
            :link="{
              name: 'Invalid Hamper IDs',
              path: '/data/hamper-refs-check',
            }"
          ></sidebar-item>
          <sidebar-item
            :link="{
              name: 'Allocation Mismatch',
              path: '/data/allocation-mismatch',
            }"
          ></sidebar-item>
          <sidebar-item
            :link="{
              name: 'Export Orgs',
              path: '/data/export-orgs',
            }"
          ></sidebar-item>
        </sidebar-item>

        <sidebar-item
          v-if="isJamie()"
          :link="{ name: 'Template Stuff', icon: 'nc-icon nc-app' }"
        >
          <sidebar-item :link="{ name: 'Components', icon: 'nc-icon nc-app' }">
            <sidebar-item
              :link="{ name: 'Buttons', path: '/components/buttons' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Grid System', path: '/components/grid-system' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Panels', path: '/components/panels' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Sweet Alert', path: '/components/sweet-alert' }"
            ></sidebar-item>
            <sidebar-item
              :link="{
                name: 'Notifications',
                path: '/components/notifications',
              }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Icons', path: '/components/icons' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Typography', path: '/components/typography' }"
            ></sidebar-item>
          </sidebar-item>
          <sidebar-item :link="{ name: 'Forms', icon: 'nc-icon nc-notes' }">
            <sidebar-item
              :link="{ name: 'Regular Forms', path: '/forms/regular' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Extended Forms', path: '/forms/extended' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Validation Forms', path: '/forms/validation' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Wizard', path: '/forms/wizard' }"
            ></sidebar-item>
          </sidebar-item>
          <sidebar-item :link="{ name: 'Tables', icon: 'nc-icon nc-paper-2' }">
            <sidebar-item
              :link="{ name: 'Regular Tables', path: '/table-list/regular' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Extended Tables', path: '/table-list/extended' }"
            ></sidebar-item>
            <sidebar-item
              :link="{
                name: 'Paginated Tables',
                path: '/table-list/paginated',
              }"
            ></sidebar-item>
          </sidebar-item>
          <sidebar-item :link="{ name: 'Maps', icon: 'nc-icon nc-pin-3' }">
            <sidebar-item
              :link="{ name: 'Google Maps', path: '/maps/google' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Full Screen Maps', path: '/maps/full-screen' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Vector Maps', path: '/maps/vector-map' }"
            ></sidebar-item>
          </sidebar-item>
          <sidebar-item
            :link="{
              name: 'Charts',
              icon: 'nc-icon nc-chart-bar-32',
              path: '/admin/charts',
            }"
          ></sidebar-item>
          <sidebar-item
            :link="{
              name: 'Calendar',
              icon: 'nc-icon nc-single-copy-04',
              path: '/admin/calendar',
            }"
          ></sidebar-item>
          <sidebar-item :link="{ name: 'Pages', icon: 'nc-icon nc-puzzle-10' }">
            <sidebar-item
              :link="{ name: 'User Page', path: '/pages/user' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Login Page', path: '/login' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Register', path: '/register' }"
            ></sidebar-item>
            <sidebar-item
              :link="{ name: 'Lock Screen Page', path: '/lock' }"
            ></sidebar-item>
          </sidebar-item>
        </sidebar-item>
      </template>
    </side-bar>
    <div class="main-panel">
      <top-navbar></top-navbar>

      <div class="global-loading" v-if="isLoading">
        <div class="center">
          <div class="spinner-border text-muted" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      </div>

      <dashboard-content @click.native="toggleSidebar"> </dashboard-content>

      <content-footer></content-footer>
    </div>
  </div>
</template>
<script>
import TopNavbar from "./TopNavbar.vue";
import ContentFooter from "./ContentFooter.vue";
import DashboardContent from "./Content.vue";
import UserMenu from "./Extra/UserMenu.vue";
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
import { getPlatformData } from "@/services/campaignData";

function hasElement(className) {
  return document.getElementsByClassName(className).length > 0;
}

function initScrollbar(className) {
  if (hasElement(className)) {
    new PerfectScrollbar(`.${className}`);
  } else {
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      initScrollbar(className);
    }, 100);
  }
}

export default {
  components: {
    TopNavbar,
    ContentFooter,
    DashboardContent,
    UserMenu,
  },

  data() {
    return {
      idleTimeLimit: 10, //In minutes
      isLoading: false,
    };
  },
  computed: {
    getUsersName() {
      return `${this.$store.getters.usersName}`;
    },
    activeCampaignId() {
      return this.$store.getters.getActiveCampaign;
    },
    forceRefresh() {
      return this.$store.getters.getForceRefresh;
    },
    globalLoading() {
      return this.$store.getters.isLoading;
    },
  },
  methods: {
    checkRole(role) {
      return this.userInGroup(role);
    },
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false);
      }
    },
    initScrollbar() {
      let docClasses = document.body.classList;
      let isWindows = navigator.platform.startsWith("Win");
      if (isWindows) {
        // if we are on windows OS we activate the perfectScrollbar function
        initScrollbar("main-panel");

        docClasses.add("perfect-scrollbar-on");
      } else {
        docClasses.add("perfect-scrollbar-off");
      }
    },
    idleTimer: () => {
      var time;
      window.onload = resetTimer;
      // DOM Events
      document.onmousemove = resetTimer;
      document.onkeydown = resetTimer;

      function logout() {
        alert("Inactivity Timeout");
        this.$store.dispatch("signOut");
      }

      function resetTimer() {
        clearTimeout(time);
        time = setTimeout(logout, 60 * this.idleTimeLimit * 1000);
        // 1000 milliseconds = 1 second
      }
    },
  },
  async mounted() {
    this.initScrollbar();
    this.$store.dispatch("checkTokenExpiration");
    await getPlatformData();
  },
  watch: {
    $route(to, from) {
      this.$store.dispatch("checkTokenExpiration");
    },
    async activeCampaignId() {
      this.isLoading = true;
      await getPlatformData();
      this.isLoading = false;
    },
    async forceRefresh(to) {
      if (to) {
        this.isLoading = true;
        await getPlatformData(true);
        this.isLoading = false;
      }
    },
    async globalLoading(isLoading) {
      this.isLoading = isLoading;
    },
  },
};
</script>
<style lang="scss" scoped>
.global-loading {
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
</style>
