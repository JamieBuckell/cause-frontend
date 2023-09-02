<template>
  <div class="not-found-page">
    <div class="centered">
      <img src="/static/img/500-error-cat.png" />
      <h1><i class="not-found-icon nc-icon nc-battery-81"></i>500</h1>
      <p>Internal server error.</p>
      <p>
        <small
          >Don't worry, it's not you it's me... The issue has been logged,
          <router-link to="/">click here to start again</router-link></small
        >
      </p>
    </div>
  </div>
</template>

<script>
import { getMeData } from '@/api/users.api'
export default {
  async mounted() {
    try {
      await getMeData()
    } catch (e) {
      // this.$store.dispatch("signOut");
    }
  },
}
</script>
<style lang="scss">
.not-found-page {
  .full-page > .content,
  .centered {
    min-height: calc(100vh - 160px);
  }
  .not-found-icon {
    margin-right: 10px;
  }
  .centered {
    h1,
    i {
      font-size: 50px;
    }
    p {
      font-size: 20px;
    }
    display: flex;
    padding-bottom: 150px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: grey;
  }
}
</style>
