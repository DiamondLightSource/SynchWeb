<template>
  <span>
    <label for="picker-sort-select">
      Sort by:
    </label>
    <select
      id="picker-sort-select"
      :value="value"
      @change="$emit('input', $event.target.value)"
    >
      <option value="particles">
        Particles Per Class
      </option>
      <option value="resolution">
        Estimated Resolution
      </option>
    </select>
  </span>
</template>

<script>
export default {
    'name': 'SelectSort',
    'props': {
        'value': {
            'type': String,
            'required': true,
        },
    },
}
</script>
