<template>
  <ul class="clearfix">
    <li>
      Movie Number: {{ get('IMAGENUMBER') }}
    </li>
    <li>
      Box size:
      {{ get('BOXSIZEX') }}x{{ get('BOXSIZEY') }}&micro;m
    </li>
    <!-- &#197 = ångström -->
    <li>
      Resolution:
      {{ get('MINRESOLUTION') }}
      -
      {{ get('MAXRESOLUTION') }}&#197;
    </li>
    <li>
      Defocus:
      {{ get('MINDEFOCUS') }}
      -
      {{ get('MINDEFOCUS') }}&#197;
    </li>
    <li>
      Defocus Step Size:
      {{ get('DEFOCUSSTEPSIZE') }}&#197;
    </li>
    <li>
      Astigmatism:
      {{ get('ASTIGMATISM') }}&#197;
    </li>
    <li>
      Astigmatism Angle:
      {{ get('ASTIGMATISMANGLE') }}&deg;
    </li>
    <li>
      Estimated Resolution:
      {{ get('ESTIMATEDRESOLUTION') }}&#197;
    </li>
    <li>
      Estimated Defocus:
      {{ get('ESTIMATEDDEFOCUS') }}&#197;
    </li>
    <li>
      Amplitude Contrast:
      {{ get('AMPLITUDECONTRAST') }}
    </li>
    <li>
      CC Value:
      {{ get('CCVALUE') }}
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
            const value = store.state.models.emCtf[name]
            return value ? value : ''
        }
    }
}
</script>
