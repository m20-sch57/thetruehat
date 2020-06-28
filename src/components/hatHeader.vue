<template>
<div>
	<button
		class="white-bubble go-back"
		@click="$emit('go-back')">
		<span><arrow-left-svg/></span>
	</button><!--
	--><button
		v-if="!hideHat && !wordsCounter"
		class="white-bubble view-help"
		@click="$router.push('/help/rules')">
	</button><!--
	--><button
		class="white-bubble feedback"
		@click="$router.push('/feedback')">
		<span><feedback-svg/></span>
	</button>
	<div
		v-if="!hideHat && wordsCounter"
		id="gamePage_hatSvg">
		<hat-svg></hat-svg>
	</div>
</div>
</template>

<script>
import arrowLeftSvg from "__/assets/svg/arrow_left.svg"
import feedbackSvg from "__/assets/svg/feedback.svg"
import hatSvg from "__/assets/svg/hat_words_small.svg"

export default {
	props: ["hideHat", "wordsCounter"],
	components: {arrowLeftSvg, feedbackSvg, hatSvg}
}
</script>
