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
        <div id="mainPage_languages">
            <button
				class="flat-button"
				id="mainPage_ru">
                <img src="img/rus.png">
            </button><!--
		 --><button
		 		class="flat-button"
				id="mainPage_en">
                <img src="img/eng.png">
            </button>
        </div>
</div>
</template>
