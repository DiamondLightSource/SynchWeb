import MarionetteView from 'app/views/marionette/marionette-wrapper.vue'

import FeedbackView from 'modules/feedback/views/vue-feedback.js'

let routes = [
{
  path: '/feedback',
  component: MarionetteView,
  name: 'legacy-feedback',
  props: {
      mview: FeedbackView,
      breadcrumbs: [{title: 'Feedback'}]
  }
},
]

export default routes