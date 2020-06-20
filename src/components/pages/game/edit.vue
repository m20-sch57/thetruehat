<template>
<div class="content-small">
	<div id="gamePage_header">
		<h1 class="game-title" id="gamePage_editTitle">
			Редактирование раунда
		</h1>
	</div>
	<div id="gamePage_body">
		<div
			v-if="myRole == 'speaker'"
			id="gamePage_editBox">
			<div id="gamePage_editList">
				<edit-list
					@update:wordsState="updateWords"
					:words="words"
					id="gamePage_editListScrollable">
				</edit-list>
			</div>
			<button
				@click="accept"
				class="medium-button bg-green"
				id="gamePage_editConfirm">
				Подтверждаю
			</button>
		</div>
		<speaker-listener-box v-else></speaker-listener-box>
	</div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'

import editList from "./boxes/editList.vue"
import speakerListenerBox from "./boxes/speakerListener.vue"

export default {
	data: function() {
		return {
			words: this.$store.state.room.editWords
		}
	},
	computed: {
		...mapGetters(["myRole"])
	},
	methods: {
		updateWords(id, value) {
			this.$set(this.words, id, value);
		},
		accept() {
			app.editWords(this.words);
		}
	},
	components: {editList, speakerListenerBox}
}
</script>
