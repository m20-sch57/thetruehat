<template>
	<div
		v-if="myRole == 'speaker'"
		id="gamePage_speakerReadyBox">
		<button
			@click="getReady"
			:disabled="ready"
			class="medium-button bg-green"
			id="gamePage_speakerReadyButton">
			Я готов объяснять
		</button>
	</div>
	<div
		v-else-if="myRole == 'listener'"
		id="gamePage_listenerReadyBox">
		<button
			@click="getReady"
			:disabled="ready"
			class="medium-button bg-blue"
			id="gamePage_listenerReadyButton">
			Я готов отгадывать
		</button>
	</div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	data: function() {
		return {
			ready: false
		}
	},
	computed: {
		...mapGetters(["myRole"])
	},
	methods: {
		getReady: function() {
			app.getReady();
			this.ready = true;
		}
	}
}
</script>
