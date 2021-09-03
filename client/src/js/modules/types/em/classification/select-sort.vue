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
        Number of Particles
      </option>
      <option value="resolution">
        Resolution
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
