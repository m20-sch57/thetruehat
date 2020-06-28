export const DEVEL = "devel";
export const STAGING = "staging";
export const PROD = "prod";

export const ENV = DEVEL;

export const DEBUG = !(ENV == PROD);
export const TIME_SYNC_DELTA = 70000;
export const DISCONNECT_TIMEOUT = 5000;
export const ERROR_TIMEOUT = 4000;
