<template>
	<body>

	</body>
</template>

<script>
export default {
	beforeRouteEnter: function(to, from, next) {
		next(vm => {
			if (vm.$store.state.room.connection != "online") {
				vm.$router.replace({path: "/join", query: vm.$route.query});
			} else {
				if (Object.keys(vm.$route.query)[0] != vm.$store.state.room.key) {
					let query = []; query[vm.$store.state.room.key] = null;
					vm.$router.replace({path: "/game", query});
				}
			}
		})
	},
}
</script>
