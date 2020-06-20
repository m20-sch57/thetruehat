<template>
	<div class="content-small">
		<div id="preparationPage_header">
			<div id="preparationPage_titleSettings">
				<span id="preparationPage_title">
					{{ title }}
				</span><!--
			 --><button
			 		@click="$router.push('/game/settings')"
			 		class="flat-button"
					id="preparationPage_openSettings">
					<span class="fa fa-cog"></span>
				</button>
			</div>
			<button
				@click="copyKey"
				class="small-button bg-blue"
				id="preparationPage_copyKey">
				Копир. ключ
			</button><!--
		 --><button
		 		@click="copyLink"
		 		class="small-button bg-blue"
				id="preparationPage_copyLink">
				Копир. ссылку
			</button><br>
			<!-- <span> {{ settingsPreview }}</span> -->
		</div>
		<div id="preparationPage_body">
			<div id="preparationPage_usersTable">
				<div class="spacer"></div>
				<users-table
					:users="$store.getters.onlinePlayers"
					:host="$store.state.room.host"
					:username="$store.state.room.username"
					id="preparationPage_users">
				</users-table>
				<div class="spacer"></div>
			</div>
			<button
				v-if="isHost"
				:disabled="!canStart"
				@click="startGame"
				class="medium-button bg-green"
				id="preparationPage_start">
				Начать игру
			</button>
			<p
				v-if="isHost && !canStart"
				class="hint"
				id="preparationPage_startHint">
				Меньше 2 игроков
			</p>
			<h1
				v-if="!isHost"
				id="preparationPage_startLabel">
				Игра не началась
			</h1>
		</div>
	</div>
</template>

<script>
import usersTable from "_/usersTable.vue"
import app from "__/app.js"
import { mapGetters } from 'vuex'

export default {
	data: function() {
		return {
			title: this.$store.state.room.key
		}
	},
	computed: {
		...mapGetters(["isHost"]),
		canStart: function() {
			return this.$store.getters.onlinePlayers.length >= 2
		},
		settingsPreview: function() {
			let settings = this.$store.state.room.settings;
			let result =
				[`words: ${settings.wordNumber}`,`time: ${settings.delayTime / 1000}+${
				settings.explanationTime / 1000}+${
				settings.aftermathTime / 1000}`]
			if (settings.strictMode) result.push("strict mode");
			return result.join("; ");
		}
	},
	methods: {
		copyKey: function() {
			navigator.clipboard.writeText(this.$store.state.room.key);
		},
		copyLink: function() {
			navigator.clipboard.writeText(window.location);
		},
		startGame: function() {
			app.startGame()
		}
	},
	components: {usersTable}
}
</script>
