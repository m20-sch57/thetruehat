<template>
<div>
	<div
		v-for="(word, id) of words"
		:key="id"
		class="edit-item">
		<h1 class="word">
			{{ word.word }}
		</h1>
		<button
			@click="$emit('update:wordsState', id, {word: word.word, wordState: 'explained'})"
			class="small-white-button explained"
			:class="{selected: word.wordState == 'explained'}">
			угадал
		</button><!--
	 --><button
			@click="$emit('update:wordsState', id, {word: word.word, wordState: 'notExplained'})"
			class="small-white-button not-explained"
			:class="{selected: word.wordState == 'notExplained'}">
			не угадал
		</button><!--
	 --><button
			@click="$emit('update:wordsState', id, {word: word.word, wordState: 'mistake'})"
			class="small-white-button mistake"
			:class="{selected: word.wordState == 'mistake'}">
			ошибка
		</button>
	</div>
	<div style="height: 30px"></div>
</div>
</template>

<script>
export default {
	props: ["words"]
}
</script>
