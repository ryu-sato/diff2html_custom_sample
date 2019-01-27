<template>
  <diff-detail-page :diff-string="diffString"></diff-detail-page>
</template>

<script>
import DiffDetailPage from './DiffDetailPage'

export default {
  props: ['diffUnit'],
  components: {
    DiffDetailPage
  },
  data () {
    return {
      diffString: this.diffUnit
    }
  }
};
</script>
