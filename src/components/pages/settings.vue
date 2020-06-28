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
						<span
							:class="{active: hints.wordNumber}"
							@click="showHint('wordNumber')"
							class="info"
							id="gameSettingsPage_wordNumberInfo">
							<span><info-svg/></span>
							<div class="arrow"></div>
						</span>
						<div class="popup-hint">
							Когда слова закончатся, закончится и игра.
						</div>
					</div>
					<input
						v-filter="settings.wordNumber"
						class="small-underlined-input input"
						id="gameSettingsPage_wordNumberField"
					>
				</div>
				<div class="layer" id="gameSettingsPage_delayTime">
					<div class="label">
						Время на подготовку
						<span
							:class="{active: hints.delayTime}"
							@click="showHint('delayTime')"
							class="info"
							id="gameSettingsPage_delayTimeInfo">
							<span><info-svg/></span>
							<div class="arrow"></div>
						</span>
						<div class="popup-hint">
							Время обратного отсчёта до начала раунда.
						</div>
					</div>
					<input
						v-filter.number="settings.delayTime"
						class="small-underlined-input input"
						id="gameSettingsPage_delayTimeField">
				</div>
				<div class="layer" id="gameSettingsPage_explanationTime">
					<div class="label">
						Время на объяснение
						<span
							:class="{active: hints.explanationTime}"
							@click="showHint('explanationTime')"
							class="info" id="gameSettingsPage_explanationTimeInfo">
							<span><info-svg/></span>
							<div class="arrow"></div>
						</span>
						<div class="popup-hint">
							По окончании этого времени любое объяснение слов должно быть закончено.
						</div>
					</div>
					<input
						v-filter.number="settings.explanationTime"
						class="small-underlined-input input"
						id="gameSettingsPage_explanationTimeField">
				</div>
				<div class="layer" id="gameSettingsPage_aftermathTime">
					<div class="label">
						Время на последнюю попытку
						<span
							:class="{active: hints.aftermathTime}"
							@click="showHint('aftermathTime')"
							class="info" id="gameSettingsPage_aftermathTimeInfo">
							<span><info-svg/></span>
							<div class="arrow"></div>
						</span>
						<div class="popup-hint">
							В течение этого времени отгадывающий может озвучить последнюю версию.
						</div>
					</div>
					<input
						v-filter.number="settings.aftermathTime"
						class="small-underlined-input input"
						id="gameSettingsPage_aftermathTimeField">
				</div>
				<div class="layer" id="gameSettingsPage_dictionarySelection">
					<div class="label" id="gameSettingsPage_dictionarySelectionLabel">
						Словарь
						<span
							:class="{active: hints.dictionaryId}"
							@click="showHint('dictionaryId')"
							class="info"
							id="gameSettingsPage_dictionarySelectionInfo">
							<span><info-svg/></span>
							<div class="arrow"></div>
						</span>
						<div class="popup-hint">
							Словарь определяет набор слов, из которых будут выбраны слова для этой партии.
						</div>
					</div>
					<select
						v-model="settings.dictionaryId"
						class="medium-select"
						id="gameSettingsPage_dictionaryList">
						<option :value="0">Русский (20000 слов)</option>
						<option :value="1">English (10000 words)</option>
					</select>
				</div>
				<div class="layer" id="gameSettingsPage_strictMode">
					<input
						v-model="settings.strictMode"
						type="checkbox"
						id="gameSettingsPage_strictModeCheckbox">
					<label for="gameSettingsPage_strictModeCheckbox"><span><check-svg/></span></label>
					<label>
						Строгий режим
						<span
							:class="{active: hints.strictMode}"
							@click="showHint('strictMode')"
							class="info"
							id="gameSettingsPage_strictModeInfo">
							<span><info-svg/></span>
							<div class="arrow"></div>
						</span>
						<div class="popup-hint">
							Режим для профессиональных шляпников 😊. По окончании всего времени раунд заканчивается, а последнее слово становится неугаданным.
						</div>
					</label>
				</div>
			</div>
			<div id="gameSettingsPage_actions">
				<button
					@click="applySettings"
					class="medium-button bg-green"
					id="gameSettingsPage_applyButton">
					Применить
				</button><!--
			 --><button
			 		@click="cancelSettings"
			 		class="medium-button bg-blue"
					id="gameSettingsPage_revertButton">
					Отмена
				</button>
			</div>
		</div>
	</div>
</div>
</template>

<script>
import hatHeader from "_/hatHeader.vue"
import store from "__/store.js"
import router from "__/router"
import app from "__/app.js"
import infoSvg from "__/assets/svg/info.svg"
import checkSvg from "__/assets/svg/check.svg"

function number(value, {caretPosition}) {
	caretPosition = value.slice(0, caretPosition).replace(/\D+/g,"").length;
	value = parseInt(value.replace(/\D+/g,""));
	value = isNaN(value) ? null : value;
	return {value, caretPosition}
}
function max(maxValue) {
	return function(value) {
		return Math.min(value, maxValue)
	}
}

export default {
	data: function() {
		return {
			settings: {
				...this.$store.state.room.settings,
				delayTime: this.$store.state.room.settings.delayTime / 1000,
				explanationTime: this.$store.state.room.settings.explanationTime / 1000,
				aftermathTime: this.$store.state.room.settings.aftermathTime / 1000
			},
			hints: {
				wordNumber: false,
				delayTime: false,
				explanationTime: false,
				aftermathTime: false,
				dictionaryId: false,
				strictMode: false
			}
		}
	},
	methods: {
		showHint(hintName) {
			if (this.hints[hintName]) return
			this.hints[hintName] = true;
			let counter = 0;
			let listener = window.addEventListener("click", () => {
				if (counter == 1) {
					this.hints[hintName] = false;
					document.removeEventListener("click", listener)
				}
				counter++;
			});
		},
		applySettings() {
			app.applySettings({
				...this.settings,
				delayTime: this.settings.delayTime * 1000,
				explanationTime: this.settings.explanationTime * 1000,
				aftermathTime: this.settings.aftermathTime * 1000
			})
			this.$router.go(-1);
		},
		cancelSettings() {
			this.$router.go(-1);
		}
	},
	filtrations: {
		"settings.wordNumber": {
			number, max: {filter: max(999), when: "blur"}
		},
		"settings.delayTime": {
			number, max: {filter: max(99), when: "blur"}
		},
		"settings.aftermathTime": {
			number, max: {filter: max(99), when: "blur"}
		},
		"settings.explanationTime": {
			number, max: {filter: max(999), when: "blur"}
		}
	},
	components: {hatHeader, infoSvg, checkSvg},
	beforeRouteEnter: function(to, from, next) {
		if (store.state.room.connection != "online") {
			router.replace({path: "/join", query: {k: store.state.room.key, ...to.query}});
		} else {
			if (to.query.k != store.state.room.key) {
				next(vm => {
					vm.$router.replace({query: {k: store.state.room.key}})
				})
			}
		}
		next();
	},
}
</script>
