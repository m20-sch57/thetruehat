<template>
<div class="content-small">
	<div id="gamePage_header">
		<h1
			v-if="myRole == 'observere'"
			class="game-title"
			id="gamePage_waitTitle">
			Подготовка
		</h1>
		<h1
			v-if="myRole == 'speaker'"
			class="game-title"
			id="gamePage_speakerTitle">
			Ты объясняешь
		</h1>
		<h1
			v-if="myRole == 'listener'"
			class="game-title"
			id="gamePage_listenerTitle">
			Ты отгадываешь
		</h1>
	</div>
	<div id="gamePage_body">
		<speaker-listener-box></speaker-listener-box>
		<ready-box></ready-box>
	</div>
</div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';

import app from "__/app.js"

import speakerListenerBox from "./boxes/speakerListener.vue"
import readyBox from "./boxes/ready.vue"

export default {
	computed: {
		...mapGetters(["myRole"])
	},
	components: {speakerListenerBox, readyBox}
}
</script>
