export default function install(Vue, options = {}) {

    let defaultConfig = {
        availableLanguages: ["en"],
        defaultLanguage: "en",
        silent: false,
        plural: []
    };

    Object.keys(options).forEach(key => {
        if (Object.keys(defaultConfig).indexOf(key) === -1) {
            throw new Error(`${key} is an invalid option for the translate plugin.`);
        }
    });

    options = Object.assign(defaultConfig, options);

    for (let locale of options.availableLanguages) {
        if (Object.keys(options.plural).indexOf(locale) === -1) {
            plural[locale] = n => n > 1 ? 1 : 0;
        }
    }

    function error(msg) {
        if (options.silent) return;
        throw new Error(msg);
    }

    function warn(...msg) {
        if (options.silent) return;
        console.warn(...msg);
    }

    let languageVm = new Vue({
        created: function () {
            this.available = options.availableLanguages;
            this._error = error;
        },
        data: {
            current: options.defaultLanguage
        }
    });

    function setLocale(locale) {
        if (options.availableLanguages.indexOf(locale) === -1 && !options.silent) {
            error(`${locale} is invalid locale.`);
        } else {
            languageVm.current = locale;
        }
    }

    function checkLocalesList(localesList) {
        if (!options.silent) {
            for (let locale of options.availableLanguages) {
                if (localesList.indexOf(locale) === -1) {
                    error(`No ${locale} translation available.`);
                }
            }
            for (let locale of localesList) {
                if (options.availableLanguages.indexOf(locale) === -1) {
                    error(`Locale '${locale}' not in the list of available languages.`);
                }
            }
        }
    }

    function translate(translateObject) {
        checkLocalesList(Object.keys(translateObject));
        return translateObject[languageVm.current];
    }

    function plural(n, ...translateObject) {
        return translateObject[options.plural[languageVm.current](n)];
    }

    function translatePlural(n, translateObject) {
        checkLocalesList(Object.keys(translateObject));
        return plural(n, ...translateObject[languageVm.current]);
    }

    Vue.prototype.$language = languageVm;
    Vue.prototype.$setLocale = setLocale;
    Vue.prototype.$translate = translate;
    Vue.prototype.$translatePlural = translatePlural;
    Vue.prototype.$plural = plural;
    Vue.prototype.$t = translate;
    Vue.prototype.$p = plural;
    Vue.prototype.$tp = translatePlural;

    Vue.directive("translate", {
        bind: function (el, {arg, modifiers}, vnode) {
            let html = el.innerHTML;
            el.innerHTML = arg === languageVm.current ? html : "";
            el.style.display = arg === languageVm.current ? "initial" : "none";
            languageVm.$watch("current", (locale) => {
                el.innerHTML = arg === languageVm.current ? html : "";
                el.style.display = arg === locale ? "initial" : "none";
            });

            if (options.silent) return;

            if (modifiers.draft) {
                warn(`Draft translation at component ${vnode.context.$options.name}: ${arg} - "${html}"`);
            }
        }
    });
}
