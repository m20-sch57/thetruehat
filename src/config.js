import config from "../config.json";

export const DEVEL = config.DEVEL;
export const STAGING = config.STAGING;
export const PROD = config.PROD;

export const ENV = config.env;

export const DEBUG = !(ENV === PROD);
export const TIME_SYNC_DELTA = 70000;
export const DISCONNECT_TIMEOUT = 5000;
export const ERROR_TIMEOUT = 4000;
export const VALIDATION_TIMEOUT = 250;
export const DICTIONARY_MAX_SIZE = 64 * 1000 * 1000;
export const GAME_BUTTON_COOLDOWN_TIME = 200;
export const NEWS_RELEVANCE_TIME = 30 * 24 * 3600 * 1000;
export const SWIPER_OPTIONS = {
    resistanceRatio: 0,
};
export const DEFAULT_GAME_SETTINGS = {
    delayTime: 3,
    explanationTime: 40,
    aftermathTime: 3,
    strictMode: false,
    termCondition: "words",
    wordsetSource: ["serverDictionary", 0],
    dictionaryId: 0,
    wordsNumber: 100,
    roundsNumber: 10
};
export const DEFAULT_STORE_GAME_SETTINGS = {
    delayTime: 3000,
    explanationTime: 40000,
    aftermathTime: 3000,
    strictMode: false,
    termCondition: "words",
    wordsetType: "serverDictionary",
    dictionaryId: 0,
    wordsNumber: 100,
    roundsNumber: 10,
    fixedPairs: false,
    pairMatching: "random"
};
