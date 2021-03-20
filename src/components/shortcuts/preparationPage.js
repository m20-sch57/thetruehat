import preparationPage from "cmp/preparationPage.vue";

import {mount} from "@vue/test-utils";
import Vuex from "vuex";

import {DEFAULT_STORE_GAME_SETTINGS} from "src/config.js";

export default () => {
    const wrapper = mount(preparationPage, {
        attachTo: "#test",
        store: new Vuex.Store({
            modules: {
                room: {
                    state: {
                        key: "БЕЗОБРАЗИЕ",
                        host: "Феофан",
                        settings: DEFAULT_STORE_GAME_SETTINGS
                    },
                    getters: {
                        onlinePlayers: () => [
                            "Феофан",
                            "Балда",
                            "Мастер",
                            "Поп"
                        ],
                        isHost: () => true
                    }
                }
            }
        })
    });
    return () => {
        wrapper.destroy();
    };
};
