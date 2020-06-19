function setReactiveProperty(obj, propName, value) {
	let prop = obj;
	let propPath = propName.split(".");
	console.log(propPath)
	for (let i=0; i<propPath.length-1; i++) {
		console.log(prop);
		prop = prop[propPath[i]];
	}
	prop[propPath[propPath.length-1]] = value;
}

export default {
	install: function(Vue, options) {
		Vue.directive("filter", {
			bind: function(el, binding, vnode) {
				el.value = binding.value;
				let filters = vnode.context.$options.filtrations[binding.expression];
				if (!filters) return
				let hotFilters = [];
				let blurFilters = [];
				for (let filterName of Object.keys(filters)) {
					let filter = filters[filterName];
					if (typeof filter != "object") {
						filter = {filter, when: "hot"}
					}
					if (filter.when == "hot") hotFilters.push(filter.filter)
					if (filter.when == "blur") blurFilters.push(filter.filter)
				}

				function applyFilters(filters) {
					let value = el.value;
					let caretPosition = el.selectionStart;
					for (let filter of filters) {
						value = filter(value, {caretPosition});
						if (typeof value == "object") {
							caretPosition = value.caretPosition;
							value = value.value;
						}
					}
					el.value = value;
					el.selectionStart = caretPosition;
					el.selectionEnd = caretPosition;
					setReactiveProperty(vnode.context, binding.expression, value);
				}

				el.oninput = function() {
					applyFilters(hotFilters);
				}

				el.onblur = function() {
					applyFilters(blurFilters)
				}
			}
		})
	}
}
