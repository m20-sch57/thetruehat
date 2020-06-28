<template>
<div class="content-small">
	<game-head/>
	<div id="gamePage_body">
		<speaker-listener-box></speaker-listener-box>
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
	</div>
</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import app from "__/app.js"

import speakerListenerBox from "./boxes/speakerListener.vue"
import readyBox from "./boxes/ready.vue"
import gameHead from "./boxes/head.vue"

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
	},
	components: {speakerListenerBox, readyBox, gameHead}
}
</script>
