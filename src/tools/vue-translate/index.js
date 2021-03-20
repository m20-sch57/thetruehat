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

    let languageVm = new Vue({
        created: function () {
            this.available = options.availableLanguages;
        },
        data: {
            current: options.defaultLanguage
        }
    });

    function error(msg) {
        if (options.silent) return;
        throw new Error(msg);
    }

    function warn(...msg) {
        if (options.silent) return;
        console.warn(...msg);
    }

    function setLocale(locale) {
        if (options.availableLanguages.indexOf(locale) === -1 && !options.silent) {
            error(`${locale} is invalid locale.`);
        } else {
            languageVm.current = locale;
            localStorage.preferredLang = locale;
        }
    }

    if (localStorage.preferredLang) {
        setLocale(localStorage.preferredLang);
    } else {
        localStorage.preferredLang = languageVm.current;
    }

    function translate(translateObject) {
        return translateObject[languageVm.current];
    }

    function plural(n, ...translateObject) {
        return translateObject[options.plural[languageVm.current](n)];
    }

    function translatePlural(n, translateObject) {
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

    for (let lang of options.availableLanguages) {
        Vue.component(lang, {
            render: function (createElement) {
                if (languageVm.current === lang) {
                    return createElement(
                        this.tag,
                        this.$slots.default
                    );
                }
                return createElement();
            },
            name: lang,
            props: {
                draft: {
                    type: Boolean,
                    default: false
                },
                tag: {
                    type: String,
                    default: "span"
                }
            },
            mounted: function () {
                const concatArray = (arr) => {
                    let result = "";
                    for (let elem of arr) result += elem;
                    return result;
                };
                if (this.draft) {
                    const component = this.$parent.$options.name;
                    const text = concatArray(this.$slots.default.map(node => node.text || node.elm.innerText));
                    warn(`Draft translation at component ${component}: ${lang} - "${text}"`);
                }
            }
        });
    }
}
