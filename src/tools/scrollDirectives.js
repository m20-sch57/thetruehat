export let scrollTop = {
    bind: function(el, binding, vnode) {
        el.addEventListener("scroll", () => {
            // Можно использовать eval для более честого получения реактивного поля
            // Без eval можно обращаться только к корневым полям vue.
            // eval("vnode.context."+binding.expression+"= el.scrollTop == 0");
            vnode.context[binding.expression] = el.scrollTop === 0;
        });
    },
    inserted: function(el, binding, vnode) {
        vnode.context[binding.expression] = el.scrollTop === 0;
    }
};
export let scrollBottom = {
    bind: function(el, binding, vnode) {
        el.addEventListener("scroll", () => {
            vnode.context[binding.expression] = (el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
        });
    },
    inserted: function(el, binding, vnode) {
        vnode.context[binding.expression] = (el.scrollHeight - el.scrollTop <= el.clientHeight + 1);
    }
};
