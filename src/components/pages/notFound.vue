<template>
	<div id="notFoundContainer">
		<span id="notFoundMsg">Здесь ничего нет.</span><br>
		<router-link to="/" class="link-button">на главную</router-link>
	</div>
</template>

<style>
#notFoundContainer {
	margin-top: 100px;
	width: 100%;
	text-align: center;
}

#notFoundMsg {
	font-size: 50px;
}
</style>
