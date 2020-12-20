<template>
<body>
<navbar
	@show-rules="showRules = true"
	@show-feedback="showFeedback = true"
/>
<rules
	v-show="showRules"
	@close="showRules = false"
/>
<feedback
	v-show="showFeedback"
	@close="showFeedback = false"
/>
<div class="page" id="main">
	<article>
		<header>
			<picture>
				<img src="img/hat.png" alt="hat">
			</picture>
		</header>
		<main>
			<button
				class="btn btn-bordered btn-shadow btn-green"
				@click="$router.push('/join')">
				Играть
			</button>
			<button
				class="btn btn-bordered btn-shadow btn-yellow"
				@click="showRules = true">
				Правила
			</button>
		</main>
	</article>
</div>
</body>
</template>

<script>
import navbar from "_/navbar.vue"
import rules from "_/rules.vue"
import feedback from "_/feedback.vue"

export default {
	data: function() {
		return {
			showRules: false,
			showFeedback: false
		}
	},
	components: {navbar, rules, feedback}
}
</script>
