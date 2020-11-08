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
<div class="page" id="preparation">
	<article class="left">
		<header>
			<h1>ЧЕБУРЕК</h1>
			<button class="btn-icon btn-transparent">
				<span class="fas fa-clipboard"></span>
			</button>
			<button class="btn-icon expand">
				<span class="fas fa-angle-down"></span>
			</button>
		</header>
		<main>

		</main>
		<footer>
			<button class="btn btn-green">Начать игру</button>
		</footer>
	</article>
	<article class="right collapsed">
		<header>
			<h1>Параметры игры</h1>
			<button class="btn-icon expand">
				<span class="fas fa-angle-down"></span>
			</button>
		</header>
		<main>

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
