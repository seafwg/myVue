<template>
  <header :class="$style.mainHeader">
    <h1>JTodo</h1>
    <div @click="reciveMSG">reciveMSG</div>
  </header>
</template>

<script>
import bus from '../views/eventBus.js'

  export default {
    created() {
      bus.$on('testBus', (data) => {
        console.log(data);
      })
    }
  }
</script>

<style lang="stylus" scoped module>
.main-header{
  text-align center
  h1{
    font-size 100px
    color: rgba(175, 47, 47, 0.4)
    font-weight 100
    margin 20px
  }
}
</style>
