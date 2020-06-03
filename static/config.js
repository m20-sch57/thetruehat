const DEVEL = "devel";
const STAGING = "staging";
const PROD = "prod";

// Config
const ENVIROMENT = PROD;

const GLOBAL_APP_SCOPE = !(ENVIROMENT == PROD);
const DEBUG_OUTPUT = true;
const TIME_SYNC_DELTA = 60000;
const DISCONNECT_TIMEOUT = 5000;
const ERROR_TIMEOUT = 4000;
