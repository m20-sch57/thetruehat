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
<div class="page" id="join">
	<article>
		<header>
			<h1>Вход в игру</h1>
		</header>
		<main>
			<section class="game-key">
				<div class="game-key-input">
					<input class="input" placeholder="Ключ игры">
					<div class="game-key-actions">
						<button class="btn-icon btn-transparent">
							<span class="fas fa-clipboard"></span>
						</button>
						<button class="btn-icon btn-transparent">
							<span class="fas fa-redo"></span>
						</button>
					</div>
				</div>
				<div class="game-key-status">
					<div class="room-info no-key">
						<h5>Введите ключ длины не более 8</h5>
					</div>
					<div class="room-info checking" style="display: none;">
						<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
						<h5>Проверка</h5>
					</div>
					<div class="room-info created" style="display: none;">
						<h5><span class="fas fa-check"></span> Игра не началась</h5>
						<button class="select btn-transparent">5 игроков</button>
					</div>
					<div class="room-info invalid" style="display: none;">
						<h5><span class="fas fa-times"></span> Некорректный ключ</h5>
					</div>
				</div>
			</section>
			<section class="your-name">
				<div class="your-name-input">
					<input class="input" placeholder="Ваше имя">
				</div>
				<div class="your-name-status">
					<div class="name-info no-name">
						<h5>Введите имя длины не более 16</h5>
					</div>
					<div class="name-info checking" style="display: none;">
						<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
						<h5>Проверка</h5>
					</div>
					<div class="name-info accepted" style="display: none;">
						<h5><span class="fas fa-check"></span> Нормально</h5>
					</div>
					<div class="name-info not-in-list" style="display: none;">
						<h5><span class="fas fa-times"></span> Не найдено в списке игроков</h5>
					</div>
				</div>
			</section>
		</main>
		<footer>
			<button class="btn btn-shadow btn-green">Поехали!</button>
		</footer>
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
