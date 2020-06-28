<template>
<div id="gamePage_header">
	<game-actions/>
	<game-title/>
	<game-subtitle/>
</div>
</template>

<script>
import gameTitle from "./title.vue"
import gameSubtitle from "./subtitle.vue"
import gameActions from "./actions.vue"

export default {
	components: {gameTitle, gameSubtitle, gameActions}
}
</script>
