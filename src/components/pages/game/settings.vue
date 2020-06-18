<template>
<div class="page" id="gameSettingsPage">
	<hat-header @go-back="$router.go(-1)"></hat-header>
	<div class="content-small">
		<div id="gameSettingsPage_header">
			<h1 id="gameSettingsPage_title">Настройки игры</h1>
			<h2
				v-if="!$store.getters.isHost"
				id="gameSettingsPage_subtitle">
					Ты больше не хост. Только хост может менять настройки.
			</h2>
		</div>
		<div id="gameSettingsPage_body">
			<div id="gameSettingsPage_layers">
				<div class="layer">
					<div class="label">
						Количество слов в шляпе
						<span class="fa fa-info-circle info" id="gameSettingsPage_wordNumberInfo">
							<div class="arrow"></div>
						</span>
						<div class="popup-hint">
							Когда слова закончатся, закончится и игра.
						</div>
					</div>

						<!-- :value="settings.wordNumber"
						@input="validateNumber" -->
					<input
						v-model="settings.wordNumber"
						class="small-underlined-input input"
						id="gameSettingsPage_wordNumberField">
				</div>
				<div class="layer" id="gameSettingsPage_delayTime">
					<div class="label">
						Время на подготовку
						<span class="fa fa-info-circle info" id="gameSettingsPage_delayTimeInfo">
							<div class="arrow"></div>
						</span>
						<div class="popup-hint">
							Время обратного отсчёта до начала раунда.
						</div>
					</div>
					<input
						v-model.number="settings.delayTime"
						class="small-underlined-input input"
						id="gameSettingsPage_delayTimeField">
				</div>
				<div class="layer" id="gameSettingsPage_explanationTime">
					<div class="label">
						Время на объяснение
						<span class="fa fa-info-circle info" id="gameSettingsPage_explanationTimeInfo">
							<div class="arrow"></div>
						</span>
						<div class="popup-hint">
							По окончании этого времени любое объяснение слов должно быть закончено.
						</div>
					</div>
					<input class="small-underlined-input input" id="gameSettingsPage_explanationTimeField"  name="type.number">
				</div>
				<div class="layer" id="gameSettingsPage_aftermathTime">
					<div class="label">
						Время на последнюю попытку
						<span class="fa fa-info-circle info" id="gameSettingsPage_aftermathTimeInfo">
							<div class="arrow"></div>
						</span>
						<div class="popup-hint">
							В течение этого времени отгадывающий может озвучить последнюю версию.
						</div>
					</div>
					<input class="small-underlined-input input" id="gameSettingsPage_aftermathTimeField"  name="type.number">
				</div>
				<div class="layer" id="gameSettingsPage_dictionarySelection">
					<div class="label" id="gameSettingsPage_dictionarySelectionLabel">
						Словарь
						<span class="fa fa-info-circle info" id="gameSettingsPage_dictionarySelectionInfo">
							<div class="arrow"></div>
						</span>
						<div class="popup-hint">
							Словарь определяет набор слов, из которых будут выбраны слова для этой партии.
						</div>
					</div>
					<select class="medium-select" id="gameSettingsPage_dictionaryList">
						<option>Русский (20000 слов)</option>
						<option>English (10000 words)</option>
					</select>
				</div>
				<div class="layer" id="gameSettingsPage_strictMode">
					<input type="checkbox" id="gameSettingsPage_strictModeCheckbox">
					<label for="gameSettingsPage_strictModeCheckbox"><span class="fa fa-check"></span></label>
					<label>
						Строгий режим
						<span class="fa fa-info-circle info" id="gameSettingsPage_strictModeInfo">
							<div class="arrow"></div>
						</span>
						<div class="popup-hint">
							Режим для профессиональных шляпников 😊. По окончании всего времени раунд заканчивается, а последнее слово становится неугаданным.
						</div>
					</label>
				</div>
			</div>
			<div id="gameSettingsPage_actions">
				<button class="medium-button bg-green" id="gameSettingsPage_applyButton">
					Применить
				</button><button class="medium-button bg-blue" id="gameSettingsPage_revertButton">
					Отмена
				</button>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import hatHeader from "_/hatHeader.vue"

export default {
	data: function() {
		return {
			settings: this.$store.state.room.settings
		}
	},
	methods: {
		// validateNumber: function(e) {
		// 	let el = e.target;
		// 	console.log(el);
		// 	let caretPosition = el.selectionStart;
		// 	let newCaretPosition = el.value.slice(0, caretPosition).replace(/\D+/g,"").length;
		// 	el.value = el.value.replace(/\D+/g,"");
		// 	el.selectionStart = newCaretPosition;
		// 	el.selectionEnd = newCaretPosition;
		// 	console.log(el.value, newCaretPosition, caretPosition, el.value.slice(0, caretPosition));
		// }
	},
	components: {hatHeader},
	beforeRouteEnter: function(to, from, next) {
		next(vm => {
			if (vm.$store.state.room.connection != "online") {
				vm.$router.replace({path: "/join", query: {k: vm.$store.state.room.key, ...vm.$route.query}});
			} else {
				if (vm.$route.query.k != vm.$store.state.room.key) {
					vm.$router.replace({query: {k: vm.$store.state.room.key}})
				}
			}
		})
	},
}
</script>
