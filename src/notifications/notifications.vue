<template>
<div v-if="notification">
	<div id="failure">
		<span id="failureMsg">
			{{ notification.msg }}
		</span>
		<button
			@click="destroy"
			class="close"
			id="failureClose"><!--
			-->&times;
		</button>
	</div>
</div>
</template>

<script>
import { events } from "./events.js"

export default {
	data: function() {
		return {
			notification: null,
			timeout: null
		}
	},
	methods: {
		notify(params) {
			this.destroy();
			this.notification = params;
			this.timeout = setTimeout(() => {
				this.notification = null;
			}, params.duration)
		},
		destroy() {
			if (this.notification) {
				clearTimeout(this.timeout);
				this.notification = null;
			}
		}
	},
	mounted: function() {
		events.$on("notify", this.notify);
	}
}
</script>
