<template>
  <diff-detail :diff-string="diffString"></diff-detail>
</template>

<script>
import DiffDetail from './DiffDetail'

export default {
  props: ['diffUnit'],
  components: {
    DiffDetail
  },
  data () {
    return {
      diffString: this.diffUnit
    }
  }
};
</script>
