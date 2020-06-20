<template>
<div id="gamePage_speakerListener">
	<div id="gamePage_speakerBox">
		<h1 id="gamePage_speakerLabel">
			<span class="fa fa-microphone"></span>
			<span id="gamePage_speaker"> {{ speaker }} </span>
		</h1>
		<p id="gamePage_speakerHint">объясняет</p>
	</div>
	<div id="gamePage_listenerBox">
		<p id="gamePage_listenerHint">отгадывает</p>
		<h1 id="gamePage_listenerLabel">
			<span id="gamePage_listener"> {{ listener }} </span>
			<span class="fa fa-headphones"></span>
		</h1>
	</div>
</div>
</template>

<script>
import { mapState } from 'vuex'

export default {
	computed: {
		...mapState({
			listener: state => state.room.listener,
			speaker: state => state.room.speaker
		})
	}
}
</script>
