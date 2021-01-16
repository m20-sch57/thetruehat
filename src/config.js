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
