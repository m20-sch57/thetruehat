<template>
<div>
	<div
		v-for="user of users"
		:key="user"
		class="user-item"
		:class="{
			you: user == username,
			host: user == host
		}"
		:id="`user_${user}`">
		{{ user }}
	</div>
</div>
</template>

<script>
export default {
	props: ["users", "username", "host"]
}
</script>
