<template>
<div class="content-small">
	<div id="gamePage_header">
		<h1
			:class="{shadow: !maxTopScroll}"
			class="game-title"
			id="gamePage_editTitle">
			Редактирование раунда
		</h1>
	</div>
	<div id="gamePage_body">
		<div
			v-if="myRole == 'speaker'"
			id="gamePage_editBox">
			<div
				@scroll="console.log('kek2')"
				id="gamePage_editList">
				<edit-list
					v-scroll-top="maxTopScroll"
					v-scroll-bottom="maxBottomScroll"
					@update:wordsState="updateWords"
					:words="words"
					id="gamePage_editListScrollable">
				</edit-list>
			</div>
			<button
				@click="accept"
				:class="{shadow: !maxBottomScroll}"
				class="medium-button bg-green"
				id="gamePage_editConfirm">
				Подтверждаю
			</button>
		</div>
		<speaker-listener-box v-else></speaker-listener-box>
	</div>
</div>
</template>

<script>
import { mapGetters } from 'vuex'
import Vue from "vue"

import editList from "./boxes/editList.vue"
import speakerListenerBox from "./boxes/speakerListener.vue"

export default {
	data: function() {
		return {
			words: this.$store.state.room.editWords,
			maxTopScroll: true,
			maxBottomScroll: true
		}
	},
	computed: {
		...mapGetters(["myRole"])
	},
	methods: {
		updateWords(id, value) {
			this.$set(this.words, id, value);
		},
		accept() {
			app.editWords(this.words);
		}
	},
	directives: {
		scrollTop: {
			bind: function(el, binding, vnode) {
				el.addEventListener("scroll", () => {
					// Можно использовать eval для более честого получения реактивного поля
					// Без eval можно обращаться только к корневым поля vue.
					// eval("vnode.context."+binding.expression+"= el.scrollTop == 0");
					vnode.context[binding.expression] = el.scrollTop == 0;
				})
			},
			inserted: function(el, binding, vnode) {
				vnode.context[binding.expression] = el.scrollTop == 0;
			}
		},
		scrollBottom: {
			bind: function(el, binding, vnode) {
				el.addEventListener("scroll", () => {
					vnode.context[binding.expression] = (el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
				})
			},
			inserted: function(el, binding, vnode) {
				vnode.context[binding.expression] = (el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
			}
		}
	},
	components: {editList, speakerListenerBox}
}
</script>
