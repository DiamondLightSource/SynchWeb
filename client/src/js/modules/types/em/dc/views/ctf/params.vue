<template>
  <ul class="clearfix">
    <li>
      Movie Number: {{ model.get('IMAGENUMBER') }}
    </li>
    <li>
      Box size:
      {{ model.get('BOXSIZEX') }}x{{ model.get('BOXSIZEY') }}&micro;m
    </li>
    <!-- &#197 = ångström -->
    <li>
      Resolution:
      {{ model.get('MINRESOLUTION') }}
      -
      {{ model.get('MAXRESOLUTION') }}&#197;
    </li>
    <li>
      Defocus:
      {{ model.get('MINDEFOCUS') }}
      -
      {{ model.get('MINDEFOCUS') }}&#197;
    </li>
    <li>
      Defocus Step Size:
      {{ model.get('DEFOCUSSTEPSIZE') }}&#197;
    </li>
    <li>
      Astigmatism:
      {{ model.get('ASTIGMATISM') }}&#197;
    </li>
    <li>
      Astigmatism Angle:
      {{ model.get('ASTIGMATISMANGLE') }}&deg;
    </li>
    <li>
      Estimated Resolution:
      {{ model.get('ESTIMATEDRESOLUTION') }}&#197;
    </li>
    <li>
      Estimated Defocus:
      {{ model.get('ESTIMATEDDEFOCUS') }}&#197;
    </li>
    <li>
      Amplitude Contrast:
      {{ model.get('AMPLITUDECONTRAST') }}
    </li>
    <li>
      CC Value:
      {{ model.get('CCVALUE') }}
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
