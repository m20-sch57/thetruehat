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
const GAME_BUTTON_COOLDOWN_TIME = 200;
const DICTIONARY_MAX_SIZE = 64 * 1000 * 1000
const DEFAULT_SETTINGS = {
    wordNumber: 100,
    turnsNumber: 10
}
const ERROR_MSGS = {
	101: "Нужно ввести ключ комнаты",
	102: "Нужно ввести имя",
	103: "Такое имя уже занято",
	104: "Чтобы войти в игру нужно ввести имя, с которым вы играли."
}
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
