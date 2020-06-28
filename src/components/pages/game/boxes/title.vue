<template>
		<h1
			id="gamePage_status"
			class="game-title">
			<span
				id="gamePage_waitTitle"
				v-if="phase == 'wait' && myRole == 'observer'">
				Подготовка
			</span>
			<span
				id="gamePage_explanationTitle"
				v-if="phase == 'explanation' && myRole == 'observer'">
				Идёт объяснение</span>
			<span
				id="gamePage_speakerTitle"
				v-if="myRole == 'speaker' && phase != 'edit'">
				Ты объясняешь
			</span>
			<span
				id="gamePage_listenerTitle"
				v-if="myRole == 'listener' && phase != 'edit'">
				Ты отгадываешь
			</span>
			<span
				id="gamePage_editTitle"
				v-if="phase == 'edit'">
				Редактирование раунда
			</span>
		</h1>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
export default {
	computed: {
		...mapState({
			phase: state => state.room.phase
		}),
		...mapGetters(["myRole"])
	}
}
</script>
