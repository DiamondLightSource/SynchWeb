<template>
	<div>
		<h1 class="tw-text-xl">Processing Job Parameters for Job ID: {{this.id}}</h1>
		<table-component
			:headers="parameterHeaders"
			:data="parameters"
		>
		</table-component>
	</div>
</template>

<script>
import ProcessingParameters from 'modules/types/em/collections/processingjobparameters'
import Table from 'app/components/table.vue'

export default {
	name: 'Parameter-View',
	props: {
		id: Number,
	},
	components: {
			'table-component': Table,
	},
	data: function() {
		return {
			parameterHeaders: [
				{title: 'Parameter', key: 'PARAMETERKEY'},
				{title: 'Value', key: 'PARAMETERVALUE'},
			],
			parameters: [],
		}
	},
	watch: {
		id: function(newVal) {
			this.getProcessingParameters(newVal)
		}
	},
	methods: {
		getProcessingParameters: function(processingJobId) {
			let processingParametersCollection = new ProcessingParameters()
			processingParametersCollection.queryParams.processingJobId = processingJobId

			this.$store.dispatch('getCollection', processingParametersCollection).then( (collection) => {
				this.parameters = collection.toJSON()
			}, () => {
				this.$store.commit('notifications/addNotification', {title: 'Warning', message: 'No parameters found for this processing job', level: 'warning'})
			})
 		}
	}
}
</script>
