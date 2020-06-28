<template>
<div class="page" id="joinPage">
	<hat-header @go-back="$router.go(-1)"></hat-header>
	<div class="content-small">
		<div id="joinPage_header">
			<input
				v-model.trim="key"
				class="large-underlined-input"
				id="joinPage_inputKey"
				spellcheck="false"
				placeholder="Ключ игры">
			<p class="hint">Введённый выше ключ необходим для игры.</p>
			<button
				@click="pasteKey"
				class="small-button bg-blue"
				id="joinPage_pasteKey">
				Вставить
			</button><!--
		 --><button
		 		@click="generateKey"
		 		class="small-button bg-blue"
				id="joinPage_generateKey">
				Сгенерировать новый
			</button>
		</div>
		<div id="joinPage_body">
			<input
				v-model.trim="username"
				class="medium-input"
				id="joinPage_inputName"
				spellcheck="false"
				placeholder="Введи своё имя">
			<p class="hint">Имя нужно, чтобы друзья могли тебя опознать</p>
			<button
				@click="enterRoom"
				class="medium-button bg-green"
				id="joinPage_go">
				Поехали!
			</button>
			<p
				v-if="!validated"
				class="hint"
				id="joinPage_goHint">
				{{ validationMsg }}
			</p>
		</div>
	</div>
</div>
</template>

<script>
import * as api from "__/api.js"
import app from "__/app.js"

import hatHeader from "_/hatHeader.vue"

export default {
	data: function() {
		return {
			username: "",
			key: this.$route.query.k,
			validated: true,
			validationMsg: ""
		}
	},
	methods: {
		generateKey: async function() {
			this.key = await api.getFreeKey();
		},
		pasteKey: async function() {
			this.key = await navigator.clipboard.readText();
		},
		enterRoom: function() {
			this.validate();
			if (this.validated) {
				app.joinRoom({
					username: this.username,
					key: this.key
				})
			}
		},
		validate: function() {
			if (!this.key) {
				this.validationError("Пустой ключ комнаты - низзя");
				return
			}
			if (!this.username) {
				this.validationError("Нужно представиться");
				return
			}
			this.validated = true;
		},
		validationError: function(msg) {
			this.validated = false;
			this.validationMsg = msg;
		}
	},
	watch: {
		key: function(value) {
			if (this.$route.query.k != value) {
				this.$router.replace({query: {k: value}});
			}
		}
	},
	beforeRouteEnter: function(to, from, next) {
		next(vm => {
			if (vm.$route.params.k && vm.$route.path != "/join") {
				vm.$router.replace({path: "/join", query: {k: vm.$route.params.k}});
			} else if (vm.$route.query.k) {
				vm.key = vm.$route.query.k;
			} else if (vm.$route.query.create) {
				vm.generateKey();
			}
		})
	},
	components: {hatHeader}
}
</script>
