<template>
  <div class="dashboard-container">
    <div class="dashboard-text">name: {{ name }}</div>
  </div>
</template>

<script>
import {mapGetters, mapState} from 'vuex'

export default {
  name: 'Dashboard',
  computed: {
    ...mapGetters([
      'token',
      'name',
      'avatar',
      'roles',
      'userId'
    ])
  },
  created() {
    console.log(this.name)
    console.log(this.roles)
    console.log(this.userId)
  }
}
</script>

<style lang="scss" scoped>
.dashboard {
  &-container {
    margin: 30px;
  }
  &-text {
    font-size: 30px;
    line-height: 46px;
  }
}
</style>
