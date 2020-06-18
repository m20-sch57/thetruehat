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
			</button>
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
		}
	},
	methods: {
		copyKey: function() {
			navigator.clipboard.writeText(this.$store.state.room.key);
		},
		copyLink: function() {
			navigator.clipboard.writeText(window.location);
		}
	},
	components: {usersTable}
}
</script>
