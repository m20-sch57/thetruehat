<template>
<div id="gamePage_gameActions">
	<button
		@click="goBack"
		class="white-bubble action"
		id="gamePage_leave">
		<span><exit-left-svg/></span>
	</button>
	<button
		@click="toggleSound"
		class="white-bubble action"
		id="gamePage_volume">
		<span v-if="!muted"><volume-on-svg/></span>
		<span v-else><volume-off-svg/></span>
	</button>
	<button
		@click="finishGame"
		v-if="isHost"
		:disabled="phase != 'wait'"
		class="white-bubble action"
		id="gamePage_finish">
		<span><flag-check-svg/></span>
	</button>
</div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { sound } from "__/lib"
import app from "__/app.js"
import exitLeftSvg from "__/assets/svg/exit_left.svg"
import volumeOnSvg from "__/assets/svg/volume_on.svg"
import volumeOffSvg from "__/assets/svg/volume_off.svg"
import flagCheckSvg from "__/assets/svg/flag_check.svg"

export default {
	data: function() {
		return {
			muted: sound.isMuted
		}
	},
	computed: {
		...mapState({
			// muted: state => state.settings.muted,
			phase: state => state.room.phase
		}),
		...mapGetters(["isHost"])
	},
	methods: {
		goBack: function() {
			app.leaveRoom();
			this.$router.go(-1);
		},
		toggleSound: function() {
			sound.toggleMute();
			this.muted = !this.muted;
		},
		finishGame: function() {
			if (confirm(
				"Вы уверены, что хотите завершить игру?"+
				" Игра закончится, и вы сможете посмотреть результаты.")) {
				app.finish();
			}
		}
	},
	components: {exitLeftSvg, volumeOnSvg, volumeOffSvg, flagCheckSvg}
}
</script>
