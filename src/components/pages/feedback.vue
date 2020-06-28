<template>
<div class="page" id="feedbackPage">
	<hat-header @go-back="$router.go(-1)"></hat-header>
	<div class="content-medium">
		<div id="feedbackPage_header">
			<h1 id="feedbackPage_title">Обратная связь</h1>
			<h3 id="feedbackPage_version"><version/></h3>
		</div>
		<div id="feedbackPage_body">
			<textarea class="default-textarea" id="feedbackPage_textarea" placeholder="Оставьте свой комментарий здесь"></textarea>
			<div id="feedbackPage_clientInfo">
				<input type="checkbox" id="feedbackPage_clientInfoCheckbox" checked>
				<label for="feedbackPage_clientInfoCheckbox">
					<span><check-svg/></span>
				</label>
				<label>Отправить дополнительные сведения</label>
			</div>
			<button class="medium-button bg-green" id="feedbackPage_submit">Отправить</button>
		</div>
	</div>
</div>
</template>

<script>
import hatHeader from "_/hatHeader.vue"
import checkSvg from "__/assets/svg/check.svg"

export default {
	components: {hatHeader, checkSvg}
}
</script>
