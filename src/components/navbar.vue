<template>
<nav class="nav" id="navbar">
	<button
		@click="$router.push('/')"
		class="link nav-brand">
		<img src="img/hat.png">
		<div class="nav-brand-stack">
			<h3>The True Hat</h3>
			<h4><version/></h4>
		</div>
	</button>
	<div class="nav-links">
		<button
			class="btn-icon btn-transparent nav-expand"
			@click="collapseMenu = !collapseMenu">
			<span class="fas fa-ellipsis-h"></span>
		</button>
		<div class="nav-collapsible" :class="{'collapsed': !collapseMenu}">
			<div class="nav-links-center">
				<button class="nav-link active">Игра</button>
				<button class="nav-link">Новости</button>
				<button class="nav-link">FAQ</button>
				<button class="nav-link">О нас</button>
			</div>
			<div class="nav-links-right">
				<button class="link nav-rules" @click="$emit('show-rules')">
					<span class="fas fa-book-open"></span>
				</button>
				<button class="link nav-feedback" @click="$emit('show-feedback')">
					<span class="fas fa-comments"></span>
				</button>
				<select class="select btn-transparent">
					<option value="ru">RU</option>
					<option value="en">EN</option>
				</select>
			</div>
		</div>
	</div>
</nav>
</template>

<script>
export default {
	data: function() {
		return {
			collapseMenu: false
		}
	}
}
</script>
