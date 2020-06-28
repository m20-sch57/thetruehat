<template>
<h2 id="gamePage_additionalStatus">
	<span id="gamePage_additionalStatusText">
		<span v-if="myRole == 'speaker' && phase != 'edit'">
			отгадывает {{ listener }}
		</span>
	</span>
</h2>
</template>

<script>
import { mapGetters, mapState } from 'vuex'
export default {
	computed: {
		...mapGetters(["myRole"]),
		...mapState({
			listener: state => state.room.listener,
			phase: state => state.room.phase
		})
	}
}
</script>
