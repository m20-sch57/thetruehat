const DEVEL = "devel";
const STAGING = "staging";
const PROD = "prod";

// Config
const ENV = DEVEL;

const GLOBAL_APP_SCOPE = !(ENV == PROD);
const DEBUG_OUTPUT = true;
const TIME_SYNC_DELTA = 60000;
const DISCONNECT_TIMEOUT = 5000;
const ERROR_TIMEOUT = 4000;
const DEFAULT_SETTINGS = {
    wordNumber: 100,
    turnNumber: 10
}
const GAME_BUTTON_COOLDOWN_TIME = 200;

const DICTIONARY_LIST_EXTRA_OPTIONS = [
    {
        "name": "От каждого игрока",
        "wordsetType": "playerWords",
    },
    {
        "name": "Загрузить",
        "wordsetType": "hostDictionary"
    }
];

const WORDSET_TYPE_DICT = {
    "playerWords": 0,
    "hostDictionary": 1
};
