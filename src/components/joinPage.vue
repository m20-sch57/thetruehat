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
					<input
						:value="key"
						@input="key = formatKey($event.target.value)"
						class="input"
						placeholder="Ключ игры"
					>
					<div class="game-key-actions">
						<button
							@click="pasteKey()"
							class="btn-icon btn-transparent">
							<span class="fas fa-clipboard"></span>
						</button>
						<button
							@click="generateKey()"
							class="btn-icon btn-transparent">
							<span class="fas fa-redo"></span>
						</button>
					</div>
				</div>
				<div class="game-key-status">
					<div class="room-info no-key" v-show="validationStatus.key == 'empty'">
						<h5>Введите ключ длины не более 8</h5>
					</div>
					<div class="room-info checking" v-show="validationStatus.key == 'checking'">
						<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
						<h5>Проверка</h5>
					</div>
					<div class="room-info created" v-show="validationStatus.key == 'accepted'">
						<h5><span class="fas fa-check"></span> Игра началась</h5>
						<button class="select btn-transparent">{{ playersCount }} игроков</button>
					</div>
					<div class="room-info invalid" v-show="validationStatus.key == 'invalid'">
						<h5><span class="fas fa-times"></span> Некорректный ключ</h5>
					</div>
				</div>
			</section>
			<section class="your-name">
				<div class="your-name-input">
					<input
						v-model.trim="username"
						class="input"
						placeholder="Ваше имя"
					>
				</div>
				<div class="your-name-status">
					<div
						class="name-info no-name"
						v-show="validationStatus.username == 'empty'">
						<h5>Введите имя длины не более 16</h5>
					</div>
					<div
						class="name-info checking"
						v-show="validationStatus.username == 'checking'">
						<div class="lds-ellipsis"><div></div><div></div><div></div><div></div></div>
						<h5>Проверка</h5>
					</div>
					<div
						class="name-info accepted"
						v-show="validationStatus.username == 'accepted'">
						<h5><span class="fas fa-check"></span> Нормально</h5>
					</div>
					<div
						class="name-info not-in-list"
						v-show="validationStatus.username == 'not-in-list'">
						<h5><span class="fas fa-times"></span> Не найдено в списке игроков</h5>
					</div>
					<div
						class="name-info not-in-list"
						v-show="validationStatus.username == 'name-occupied'">
						<h5><span class="fas fa-times"></span> Имя уже занято другим игроком</h5>
					</div>
				</div>
			</section>
		</main>
		<footer>
			<button
				class="btn btn-shadow btn-green"
				@click="joinRoom()"
				:disabled="!validated">
				Поехали!
			</button>
		</footer>
	</article>
</div>
</body>
</template>

<script>
import navbar from "_/navbar.vue"
import rules from "_/rules.vue"
import feedback from "_/feedback.vue"

import * as api from "__/api.js"
import app from "__/app.js"
import { playersInfo, debounce } from "__/tools"
import { VALIDATION_TIMEOUT } from "__/config.js"

export default {
	data: function() {
		return {
			username: "",
			key: "",
			playersCount: 0,
			showRules: false,
			showFeedback: false,
			validationStatus: {
				username: "empty",
				key: "empty"
			}
		}
	},
	computed: {
		validated: function() {
			return (
			this.validationStatus.username == "accepted" &&
			this.validationStatus.key == "accepted");
		}
	},
	methods: {
		formatKey: function(key) {
			return key.toUpperCase().trim();
		},
		generateKey: async function() {
			this.key = this.formatKey(await api.getFreeKey());
		},
		pasteKey: async function() {
			this.key = this.formatKey(await navigator.clipboard.readText());
		},
		joinRoom: async function() {
			if (this.validated) {
				app.joinRoom({
					username: this.username,
					key: this.key
				})
			}
		}
	},
	created: function() {
		this.validateKey = debounce(async val => {
			if (val == "") {
				this.validationStatus.key = "empty";
			} else {
				let roomInfo = await api.getRoomInfo(val);
				if (!roomInfo.success) {
					this.validationStatus.key = "invalid";
					return;
				}
				if (!(roomInfo.state == "wait" ||
					this.username in playersInfo(roomInfo.playerList))) {
					this.validationStatus.username = "not-in-list";
				}
				if (this.username in playersInfo(roomInfo.playerList) &&
					playersInfo(roomInfo.playerList)[this.username].online) {
					this.validationStatus.username = "name-occupied";
				}
				this.playersCount = roomInfo.playerList.length;
				this.validationStatus.key = "accepted";
			}
		}, VALIDATION_TIMEOUT);
		this.validateUsername = debounce(async val => {
			window.console.log(val);
			if (val == "" || this.validationStatus.key == "invalid") {
				this.validationStatus.username = "empty";
			} else
			if (this.validationStatus.key == "empty") {
				this.validationStatus.username = "accepted";
			} else {
				let roomInfo = await api.getRoomInfo(this.key);
				if (!roomInfo.success) {
					this.validationStatus.username = "accepted";
				} else
				if (!(roomInfo.state == "wait" ||
					val in playersInfo(roomInfo.playerList))) {
					this.validationStatus.username = "not-in-list";
				} else
				if (val in playersInfo(roomInfo.playerList) &&
					playersInfo(roomInfo.playerList)[val].online) {
					this.validationStatus.username = "name-occupied";
				} else {
					this.validationStatus.username = "accepted";
				}
			}
		}, VALIDATION_TIMEOUT);
	},
	watch: {
		key: function(val) {
			this.validationStatus.key = "checking";
			this.validateKey(val);
		},
		username: function(val) {
			this.validationStatus.username = "checking";
			this.validateUsername(val);
		}
	},
	components: {navbar, rules, feedback}
}
</script>
