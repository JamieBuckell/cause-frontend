<template>
  <standalone-layout pageClass="donor-register-page">
    <div v-if="isLoading" class="row" v-loading="isLoading" id="loading"></div>

    <div class="row d-flex justify-content-center" v-if="!isLoading">
      <div class="col-lg-8 col-md-8 col-sm-10 pt-5">
        <fade-render-transition>
          <card>
            <div slot="header" class="text-center">
              <img :src="logo" :alt="logoAlt" class="site-logo" />
              <h3 class="card-title text-center">Email Verification</h3>
            </div>
            <div>
              <div class="row">
                <div class="col-12 col-md-12 text-center">
                  <p v-html="verificationMessage"></p>
                </div>
              </div>
            </div>
          </card>
        </fade-render-transition>
      </div>
    </div>
  </standalone-layout>
</template>
<script>
import Vue from 'vue'
import { FadeRenderTransition } from 'src/components/index'
import StandaloneLayout from '../Dashboard/Pages/StandaloneLayout.vue'
import { verifySubscription } from '@/api/donors.api'
import { Loading } from 'element-ui'

Vue.use(Loading)

export default {
  components: {
    FadeRenderTransition,
    StandaloneLayout,
  },
  data() {
    return {
      isLoading: true,
      logo: '/static/img/cause-foundation-logo.png',
      logoAlt: 'CAUSE Foundation Logo',
      verificationMessage: 'Thank you, your email has been verified.',
    }
  },
  async mounted() {
    if (this?.$route?.params?.email && this?.$route?.query?.v) {
      const verification = await verifySubscription(
        this.$route.params.email,
        this.$route.query.v
      )
      if (verification?.data?.messages?.success) {
        this.verificationMessage = verification?.data?.messages?.success
      } else if (verification?.data?.messages?.unexpected) {
        this.verificationMessage = verification?.data?.messages?.unexpected
      } else if (verification?.data?.messages?.error) {
        this.verificationMessage = verification?.data?.messages?.error
      }
      this.isLoading = false
    }
  },
}
</script>
<style lang="scss">
.form-check-label {
  text-transform: none !important;
}
.marketing-info {
  border-top: none;

  .el-collapse-item {
    .el-collapse-item__header {
      font-weight: 400;
      font-size: 12px;
    }
  }
  .el-collapse-item__content {
    color: #9a9a9a;
  }
}
.card .card-category,
.card label {
  color: #252526;
}
.form-control,
.form-group .el-input__inner,
.el-date-picker .el-input .el-input__inner {
  color: #252526;
}

.form-control::-moz-placeholder {
  color: #888888;
}
.form-control:-moz-placeholder {
  color: #888888;
}
.form-control::-webkit-input-placeholder {
  color: #888888;
}
.form-control:-ms-input-placeholder {
  color: #888888;
}

#loading {
  min-height: 200px;
  display: flex;
  align-items: center;
}

.el-loading-spinner .path {
  stroke: #66615b !important;
}

.el-loading-mask {
  background: transparent !important;
}
</style>
