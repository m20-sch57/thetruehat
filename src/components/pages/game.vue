<template>
<div class="page" id="gamePage">
	<hat-header @go-back="goBack"></hat-header>
	<component :is="gamePage"></component>
</div>
</template>

<script>
import app from "__/app.js"

import hatHeader from "_/hatHeader.vue"
import preparationPage from "_/pages/game/preparation.vue"

export default {
	computed: {
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
	components: {hatHeader, preparationPage}
}
</script>
