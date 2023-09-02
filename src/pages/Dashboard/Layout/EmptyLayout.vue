<template>
  <div class="wrapper py-5" :class="{ 'nav-open': $sidebar.showSidebar }">
    <notifications></notifications>
    <div>
      <dashboard-content @click.native="toggleSidebar"> </dashboard-content>

      <content-footer></content-footer>
    </div>
  </div>
</template>
<script>
import ContentFooter from './ContentFooter.vue'
import DashboardContent from './Content.vue'
import PerfectScrollbar from 'perfect-scrollbar'
import 'perfect-scrollbar/css/perfect-scrollbar.css'

function hasElement(className) {
  return document.getElementsByClassName(className).length > 0
}

function initScrollbar(className) {
  if (hasElement(className)) {
    new PerfectScrollbar(`.${className}`)
  } else {
    // try to init it later in case this component is loaded async
    setTimeout(() => {
      initScrollbar(className)
    }, 100)
  }
}

export default {
  components: {
    ContentFooter,
    DashboardContent,
  },

  data() {
    return {
      idleTimeLimit: 10, //In minutes
    }
  },
  computed: {
    getUsersName() {
      return `${this.$store.getters.usersName}`
    },
  },
  methods: {
    checkRole(role) {
      return this.userInGroup(role)
    },
    toggleSidebar() {
      if (this.$sidebar.showSidebar) {
        this.$sidebar.displaySidebar(false)
      }
    },
    initScrollbar() {
      let docClasses = document.body.classList
      let isWindows = navigator.platform.startsWith('Win')
      if (isWindows) {
        // if we are on windows OS we activate the perfectScrollbar function
        initScrollbar('main-panel')

        docClasses.add('perfect-scrollbar-on')
      } else {
        docClasses.add('perfect-scrollbar-off')
      }
    },
    idleTimer: () => {
      var time
      window.onload = resetTimer
      // DOM Events
      document.onmousemove = resetTimer
      document.onkeydown = resetTimer

      function logout() {
        alert('Inactivity Timeout')
        this.$store.dispatch('signOut')
      }

      function resetTimer() {
        clearTimeout(time)
        time = setTimeout(logout, 60 * this.idleTimeLimit * 1000)
        // 1000 milliseconds = 1 second
      }
    },
  },
  async mounted() {
    this.initScrollbar()
    this.$store.dispatch('checkTokenExpiration')
  },
  watch: {
    $route(to, from) {
      this.$store.dispatch('checkTokenExpiration')
    },
  },
}
</script>
