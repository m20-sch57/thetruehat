<template>
<div class="page" id="helpPage">
	<hat-header
		@go-back="$router.go(-1)"
		:hide-hat="true"
	></hat-header>
	<div class="content-large">
		<div id="helpPage_header">
			<div id="helpPage_navigation">
				<button
					@click="$router.replace('/help/news')"
					class="flat-button option"
					:class="{active: option == 'news'}"
					id="helpPage_newsOption">
					Новости
				</button>
				<button
					@click="$router.replace('/help/rules')"
					class="flat-button option"
					:class="{active: option == 'rules'}"
					id="helpPage_rulesOption">
					Правила
				</button>
				<button
					@click="$router.replace('/help/faq')"
					class="flat-button option"
					:class="{active: option == 'faq'}"
					id="helpPage_faqOption">
					FAQ
				</button>
				<button
					@click="$router.replace('/help/about')"
					class="flat-button option"
					:class="{active: option == 'about'}"
					id="helpPage_aboutOption">
					О нас
				</button>
			</div>
		</div>
		<div id="helpPage_body" :is="option"></div>
	</div>
</div>
</template>

<script>
import hatHeader from "_/hatHeader.vue"
import news from "_/pages/help/news.vue"
import rules from "_/pages/help/rules.vue"
import faq from "_/pages/help/faq.vue"
import about from "_/pages/help/about.vue"

export default {
	computed: {
		option: function() {
			return this.$route.params.option
		}
	},
	components: {hatHeader, news, rules, faq, about}
}
</script>
