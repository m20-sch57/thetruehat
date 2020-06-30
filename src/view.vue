<template>
<div>
	<router-view/>
	<notifications/>
	<draft-mark v-if="showMark" />
</div>
</template>

<script>
import draftMark from "_/draftMark.vue"
import {ENV, STAGING} from "__/config.js"

export default {
	data: function() {
		return {
			showMark: ENV == STAGING
		}
	},
	components: {draftMark}
}
</script>
