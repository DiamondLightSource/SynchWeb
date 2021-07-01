<template>
  <ul class="clearfix">
    <li>
      Movie Number:
      {{ get('IMAGENUMBER') }}
    </li>
    <li>
      First Frame:
      {{ get('FIRSTFRAME') }}
    </li>
    <li>
      Last Frame:
      {{ get('LASTFRAME') }}
    </li>
    <!-- &#197 = ångström -->
    <li>
      Dose Per Frame:
      {{ get('DOSEPERFRAME') }}
      e<span class="super">-</span>/&#197;<span class="super">2</span>
    </li>
    <li>
      Dose Weight:
      {{ get('DOSEWEIGHT') }}
      ?
    </li>
    <li>
      Total Motion:
      {{ get('TOTALMOTION') }}
      &#197;
    </li>
    <li>
      Average Motion / Frame:
      {{ get('AVERAGEMOTIONPERFRAME') }}
      &#197;
    </li>
    <li>
      Patches Used:
      {{ get('PATCHESUSEDX') }} x {{ get('PATCHESUSEDY') }}
    </li>
    <li
      class="comment"
      title="Click to edit the comment for this data collection"
    >
      Comment:
      <span class="COMMENTS">{{ get('COMMENTS') }}</span>
    </li>
  </ul>
</template>

<script>
import store from 'app/store/store'

export default {
    'name': "Params",
    'methods': {
        'get': function(name) {
            const value = store.state.models.emMotionCorrection[name]
            return value ? value : ''
        }
    }
}
</script>
