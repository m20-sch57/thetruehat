<template>
<div>
	<button
		class="white-bubble go-back"
		@click="$emit('go-back')"
		>
		<span class="fa fa-chevron-left"></span>
	</button><!--
	--><button
		v-if="!hideHat"
		class="white-bubble view-help"
		@click="$router.push('/help/rules')">
	</button><!--
	--><button
		class="white-bubble feedback"
		@click="$router.push('/feedback')">
		<span class="fa fa-comment-dots"></span>
	</button>
</div>
</template>

<script>
export default {
	props: ["hideHat"]
}
</script>
