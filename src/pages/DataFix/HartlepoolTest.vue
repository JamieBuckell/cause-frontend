<template>
  <div class="not-found-page">
    <div class="centered">
      <h1><i class="not-found-icon nc-icon nc-puzzle-10"></i>Cookies Test</h1>
      <p><strong>Test Result (Cookies):</strong> {{ testOutput }}</p>
      <p><strong>Test Result (LS):</strong> {{ testOutput }}</p>
    </div>
  </div>
</template>

<script>
  import Cookies from 'js-cookie';
let secure = (process.env.NODE_ENV === 'production') ;
  export default {
    components: {
    },
    data() {
      return {
        testOutput: "Loading",
        testOutputLS: "Loading",
      };
    },
    mounted () {
      const jKey = 'jamie';
      if (this.$route.query.reset) {
        Cookies.remove(jKey);
        localStorage.removeItem(jKey);
          this.testOutput = 'Data Reset';
          this.testOutputLS = 'Data Reset';
      } else {
        const test = Cookies.get(jKey);
        if (test) {
          this.testOutput = test;
        } else {
          Cookies.set(jKey, "Data Retrieved Successfully", { expires: 31, secure: secure });
          this.testOutput = 'Data Set';
        }

        const testLS = localStorage.getItem(jKey);
        if (testLS) {
          this.testOutputLS = test;
        } else {
          localStorage.setItem(jKey, "Data Retrieved Successfully");
          this.testOutputLS = 'Data Set';
        }
      }
    }
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
      h1, i {
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
