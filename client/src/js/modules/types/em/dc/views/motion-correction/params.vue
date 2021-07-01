<template>
  <ul class="clearfix">
    <li>
      Movie Number:
      {{ model.get('IMAGENUMBER') }}
    </li>
    <li>
      First Frame:
      {{ model.get('FIRSTFRAME') }}
    </li>
    <li>
      Last Frame:
      {{ model.get('LASTFRAME') }}
    </li>
    <!-- &#197 = ångström -->
    <li>
      Dose Per Frame:
      {{ model.get('DOSEPERFRAME') }}
      e<span class="super">-</span>/&#197;<span class="super">2</span>
    </li>
    <li>
      Dose Weight:
      {{ model.get('DOSEWEIGHT') }}
      ?
    </li>
    <li>
      Total Motion:
      {{ model.get('TOTALMOTION') }}
      &#197;
    </li>
    <li>
      Average Motion / Frame:
      {{ model.get('AVERAGEMOTIONPERFRAME') }}
      &#197;
    </li>
    <li>
      Patches Used:
      {{ model.get('PATCHESUSEDX') }} x {{ model.get('PATCHESUSEDY') }}
    </li>
    <li
      class="comment"
      title="Click to edit the comment for this data collection"
    >
      Comment:
      <span class="COMMENTS">{{ model.get('COMMENTS') }}</span>
    </li>
  </ul>
</template>

<script>
export default {
    'name': "Params",
    'props': {
        'model': {
            'type': Object,
            'required': true,
        },
    },
}
</script>
