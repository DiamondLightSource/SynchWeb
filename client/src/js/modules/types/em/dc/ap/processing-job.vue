<template>
  <section>
    <h1>Processing Job: {{ job.ID }}</h1>

    <h1 style="background-color: #ffa; padding: 20px;">
      TODO: astigmatism, estimated focus &amp; estimated resolution graphs
    </h1>

    <div class="holder">
      <h1
        title="Click to show autoprocessing results"
        class="ap"
      >
        Auto Processing
        <span>
          <status-item
            title="Motion Correction"
            :status="job.MC"
          />
          <status-item
            title="CTF Estimation"
            :status="job.CTF"
          />
        </span>
      </h1>
      <div class="autoproc" />
    </div>
  </section>
</template>

<script>
import statusItem from 'modules/types/em/dc/ap/status-item.vue'

export default {
    'name': 'ProcessingJob',
    'components': {
        'status-item': statusItem
    },
    'props': {
        'job': {
            'type': Object,
            'required': true,
        },
    },
}
</script>
