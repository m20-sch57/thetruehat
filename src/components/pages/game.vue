<template>
<div class="page" id="gamePage">
	<hat-header
		:hat-picture="true"
		@go-back="goBack">
		<template v-if="phase != 'preparation'">
			Слов в шляпе: <span id="gamePage_wordsCnt"> {{wordsCount }} </span>
		</template>
	</hat-header>
	<component :is="gamePage"></component>
</div>
</template>

<script>
import app from "__/app.js"

import hatHeader from "_/hatHeader.vue"
import preparationPage from "_/pages/game/preparation.vue"
import waitPage from "_/pages/game/wait.vue"
import explanationPage from "_/pages/game/explanation.vue"
import editPage from "_/pages/game/edit.vue"
import { mapState } from 'vuex'

export default {
	computed: {
		...mapState({
			phase: state => state.room.phase,
			wordsCount: state => state.room.wordsCount
		}),
		gamePage: function() {
			if (this.$store.state.room.connection == "online") {
				return this.$store.state.room.phase + "Page"
			}
		}
	},
	methods: {
		goBack: function() {
			app.leaveRoom();
			this.$router.go(-1);
		}
	},
	beforeRouteEnter: function(to, from, next) {
		next(vm => {
			if (vm.$store.state.room.connection != "online") {
				vm.$router.replace({path: "/join", query: vm.$route.query});
			} else {
				if (vm.$route.query.k != vm.$store.state.room.key) {
					vm.$router.replace({query: {k: vm.$store.state.room.key}})
				}
			}
		})
	},
	components: {hatHeader, preparationPage, waitPage, explanationPage, editPage}
}
</script>
