# TheTrueHat
*Available languages: [in English](README.md), [in Russian](README.ru.md).*

TheTrueHat is a web-application for the game Alias. You can play the Alias with your friends or organise an Alias tournament.
This project supports a web-interface for the game, and a server that will took responsibility for all technical details.

## Play now!
The beta test is available now [here](https://m20-sch57.site/thetruehat) and [here](https://thetruehat.m20-sch57.site).

## Features
* Cross-platform. You can set the server up on Windows, Linux and Mac OS X, and web-application supports Google Chrome (PC and Android), Mozilla Firefox (PC and Android) and latest Opera (PC and Android).
* Easy to start. It's ready to start right now. You don't need to delve into anything and code anything to start play.
* Good performance: this project is written on Node.js - one of the fastest frameworks.

## Quick start
Warning. Don't use this instruction on production. See our [documentation](docs/main.md) before.

### Installation
1. Install [Node.js](https://nodejs.org/)
1. Install [Caddy v.1](https://caddyserver.com/v1/)
1. Download the repository.
1. Run in a console in the project directory:
    ```shell script
    npm install
    ```
   
### Fast tuning
1. Modify `Caddyfile` in project directory in such way:
    1. Replace `<project_dir>` with the project path.
    1. Replace `<log_dir>` with path for Caddy log file (for example, the project path).
    1. Replace `<error_dir>` with path for Caddy error file (for example, the project path).
    1. Replace all `<port>` with some vacant port.
    1. Replace all `<socket_port>` with another vacant port.
1. Modify `config.json` in project directory in such way:
    1. Update value by key `"port"` with your `<socket_port>` parameter.

### Launching and using
1. Run in the first console with working directory in project directory:
    ```shell script
    caddy -pidfile=caddy.pid
    ```
1. Run in the second console with working directory in project directory:
    ```shell script
    node server.js
    ```
1. Go by the link `http://localhost:<port>` with `<port>` replaced by your `<port>` parameter.
1. Have fun!

### Stopping
Just stop processes in both consoles you used to launch project.

## Documentation
You can see the documentation [here](docs/main.md).

## Gratitude
We want to express gratitude for their cooperation to [SCS.Hat project](https://the-hat.appspot.com/landing). 

## License
This project is available by [MIT license](LICENSE).

## Used projects
- [Caddy v.1](https://caddyserver.com/v1/)
- [Express](https://expressjs.com/)
- [Socket.IO](https://socket.io/)
- [body-parser](https://github.com/expressjs/body-parser#readme)
- [yargs](https://yargs.js.org/)
