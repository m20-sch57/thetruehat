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
					<div class="room-info created" v-show="validationStatus.key == 'not-created'">
						<h5><span class="fas fa-check"></span> Игра не началась</h5>
						<button class="select btn-transparent">{{ playersList.length }} игроков</button>
					</div>
					<div class="room-info created" v-show="validationStatus.key == 'created'">
						<h5><span class="fas fa-check"></span> Игра началась</h5>
						<button class="select btn-transparent">{{ playersList.length }} игроков</button>
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
import navbar from "cmp/navbar.vue"
import rules from "cmp/rules.vue"
import feedback from "cmp/feedback.vue"

import * as api from "src/api.js"
import app from "src/app.js"
import { VALIDATION_TIMEOUT } from "src/config.js"
import { debounce } from "src/tools"

export default {
	components: {navbar, rules, feedback},
	data: function() {
		return {
			showRules: false,
			showFeedback: false,
			username: "",
			key: "",
			playersInfo: {},
			playersList: [],
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
			(this.validationStatus.key == "not-created" ||
			this.validationStatus.key == "created"));
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
		this.validateKey = key => {
			if (key == "") {
				this.validationStatus.key = "empty";
			} else
			if (!this.roomInfo.success) {
				this.validationStatus.key = "invalid";
			} else
			if (this.roomInfo.state == "wait") {
				this.validationStatus.key = "not-created";
			} else {
				this.validationStatus.key = "created";
			}
			this.validateUsername(this.username);
		};
		this.validateUsername = username => {
			if (username == "") {
				this.validationStatus.username = "empty";
			} else
			if (!this.roomInfo.success) {
				this.validationStatus.username = "accepted";
			} else
			if (!(this.roomInfo.state == "wait" ||
				username in this.roomInfo.playersInfo)) {
				this.validationStatus.username = "not-in-list";
			} else
			if (username in this.roomInfo.playersInfo &&
				this.roomInfo.playersInfo[username]) {
				this.validationStatus.username = "name-occupied";
			} else {
				this.validationStatus.username = "accepted";
			}
		};
		this.watchKey = debounce(async key => {
			this.roomInfo = await api.getRoomInfo(key);
			this.validateKey(key);
			if (this.roomInfo.success) {
				this.playersInfo = this.roomInfo.playersInfo;
				this.playersList = this.roomInfo.playersList;
			}
		}, VALIDATION_TIMEOUT);
		this.watchUsername = debounce(async username => {
			this.roomInfo = await api.getRoomInfo(this.key);
			this.validateUsername(username);
		}, VALIDATION_TIMEOUT)
	},
	watch: {
		key: function(val) {
			this.validationStatus.key = "checking";
			this.watchKey(val);
			if (Object.keys(this.$route.query)[0] != this.key) {
				let query = []; query[this.key] = null;
				this.$router.replace({path: "/join", query});
			}
		},
		username: function(val) {
			this.validationStatus.username = "checking";
			this.watchUsername(val);
		}
	},
	beforeRouteEnter: function(to, from, next) {
		next(vm => {
			if (Object.keys(vm.$route.query).length &&
				vm.key != Object.keys(vm.$route.query)[0])
			{
				vm.key = vm.formatKey(Object.keys(vm.$route.query)[0]);
				let query = []; query[vm.key] = null;
				vm.$router.replace({path: "/join", query});
			}
		})
	}
}
</script>
