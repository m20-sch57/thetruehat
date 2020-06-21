import Notifications from "./notifications.vue"
import { events } from "./events"

export default {
	install(Vue, opt) {
		Vue.component("notifications", Notifications);

		Vue.notify = function(params) {
			events.$emit("notify", params);
		}
		Vue.prototype.$notify = function(params) {
			events.$emit("notify", params);
		}
	}
}
