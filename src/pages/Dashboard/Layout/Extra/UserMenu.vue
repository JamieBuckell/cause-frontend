<template>
  <div class="user">
    <div class="photo">
      <img src="/static/img/default-avatar.png" alt="avatar" />
    </div>
    <div class="info">
      <a
        data-toggle="collapse"
        :aria-expanded="!isClosed"
        @click.stop="toggleMenu"
        href="#"
      >
        <span>
          {{ title }}
          <b class="caret"></b>
        </span>
      </a>
      <div class="clearfix"></div>
      <div>
        <el-collapse-transition>
          <ul class="nav" v-show="!isClosed">
            <slot>
              <!--
              <li>
                <a class="profile-dropdown" href="#">
                  <span class="sidebar-mini">MP</span>
                  <span class="sidebar-normal">My Profile</span>
                </a>
              </li>
              <li>
                <a class="profile-dropdown" href="#">
                  <span class="sidebar-mini">EP</span>
                  <span class="sidebar-normal">Edit Profile</span>
                </a>
              </li>
              <li>
                <a class="profile-dropdown" href="#">
                  <span class="sidebar-mini">S</span>
                  <span class="sidebar-normal">Settings</span>
                </a>
              </li>
              -->
              <li>
                <router-link class="profile-dropdown" to="/change-password">
                  <span class="sidebar-mini">CP</span>
                  <span class="sidebar-normal">Change Password</span>
                </router-link>
              </li>
              <li>
                <a class="profile-dropdown" href="#" @click="logOut">
                  <span class="sidebar-mini">L</span>
                  <span class="sidebar-normal">Logout</span>
                </a>
              </li>
            </slot>
          </ul>
        </el-collapse-transition>
      </div>
    </div>
  </div>
</template>
<script>
import CollapseTransition from "element-ui/lib/transitions/collapse-transition";

export default {
  components: {
    [CollapseTransition.name]: CollapseTransition,
  },
  props: {
    title: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      isClosed: true,
    };
  },
  methods: {
    toggleMenu() {
      this.isClosed = !this.isClosed;
    },
    logOut() {
      this.$store.dispatch("signOut");
      return false;
    },
  },
};
</script>
<style>
.collapsed {
  transition: opacity 1s;
}
</style>
