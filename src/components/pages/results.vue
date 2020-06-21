<template>
<div class="page" id="resultsPage">
	<hat-header @go-back="$router.go(-1)"></hat-header>
	<div class="content-small">
		<div id="resultsPage_header">
			<h1 id="resultsPage_title">Результаты игры</h1>
		</div>
		<div id="resultsPage_body">
			<table id="resultsPage_table">
			<thead>
				<th>Игрок</th>
				<th>Объяснено</th>
				<th>Угадано</th>
				<th>Сумма</th>
			</thead>
			<tbody id="resultsPage_results">
				<tr
					v-for="(result, index) of results"
					:key="index">
					<td> {{ result.username }} </td>
					<td> {{ result.scoreExplained }} </td>
					<td> {{ result.scoreGuessed }} </td>
					<td> {{ result.scoreExplained+result.scoreGuessed }} </td>
				</tr>
			</tbody>
			</table>
			<button
				@click="$router.push('/feedback')"
				class="medium-button bg-blue"
				id="resultsPage_feedback">
				Оставить отзыв
			</button>
			<button
				@click="$router.push({path: '/join', query: {create: true}})"
				class="medium-button bg-green"
				id="resultsPage_newGame">
				Новая игра
			</button>
		</div>
	</div>
</div>
</template>

<script>
import { mapState } from "vuex"
import hatHeader from "_/hatHeader.vue"

export default {
	computed: {
		...mapState({
			results: state => state.room.results
		})
	},
	beforeRouteEnter: function(from, to, next) {
		next(vm => {
			if (!vm.$store.state.room.results) {
				vm.$router.replace({path: "/join", query: vm.$route.query});
			} else if (vm.$route.query.k != vm.$store.state.room.key) {
				vm.$router.replace({query: {k: vm.$store.state.room.key}})
			}
		})
	},
	components: {hatHeader}
}
</script>
