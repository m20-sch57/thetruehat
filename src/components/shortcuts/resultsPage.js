import resultsPage from "cmp/resultsPage.vue";

import {mount} from "@vue/test-utils";
import Vuex from "vuex";

function choose(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}

const turnsHistory = [];
const players = ["Феофан", "Балда", "Мастер", "Поп"];
for (let i = 0; i < 15; i++) {
    turnsHistory.push({
        speaker: players[i % 4],
        listener: players[(i + 2) % 4],
        score: 4,
        words: [
            {
                word: choose(["турок", "шерсть", "синхрофазотрон", "пятилетка", "шарф"]),
                status: choose(["explained", "not-explained", "mistake"])
            }, {
                word: choose(["турок", "шерсть", "синхрофазотрон", "пятилетка", "шарф"]),
                status: choose(["explained", "not-explained", "mistake"])
            }, {
                word: choose(["турок", "шерсть", "синхрофазотрон", "пятилетка", "шарф"]),
                status: choose(["explained", "not-explained", "mistake"])
            }, {
                word: choose(["турок", "шерсть", "синхрофазотрон", "пятилетка", "шарф"]),
                status: choose(["explained", "not-explained", "mistake"])
            }, {
                word: choose(["турок", "шерсть", "синхрофазотрон", "пятилетка", "шарф"]),
                status: choose(["explained", "not-explained", "mistake"])
            }
        ],
        collapsed: true
    });
}

export default () => {
    const wrapper = mount(resultsPage, {
        attachTo: "#test",
        store: new Vuex.Store({
            modules: {
                room: {
                    state: {
                        key: "БЕЗОБРАЗИЕ",
                        results: [
                            {
                                username: "Поп",
                                scoreExplained: 57,
                                scoreGuessed: 42
                            },
                            {
                                username: "Балда",
                                scoreExplained: 58,
                                scoreGuessed: 24
                            },
                            {
                                username: "Мастер",
                                scoreExplained: 6,
                                scoreGuessed: 43
                            },
                            {
                                username: "Феофан",
                                scoreExplained: 10,
                                scoreGuessed: 7
                            },
                        ],
                        turnsHistory
                    }
                }
            }
        })
    });
    return () => {wrapper.destroy();};
};
