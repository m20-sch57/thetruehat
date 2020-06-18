<template>
<div class="page" id="mainPage">
	<div id="mainPage_actions">
		<button
			id="mainPage_createRoom"
			@click="$router.push({path: '/join', query: {create: true}})">
			Создать
		</button><!--
		--><button
			id="mainPage_joinRoom"
			@click="$router.push('/join')">
			Войти
		</button>
		<button
			id="mainPage_viewHelp"
			@click="$router.push('/help/rules')">
		</button>
	</div>
</div>
</template>
