1. Install caddy **v1** from official [website](https://caddyserver.com/v1/download).
1. Run caddy server (note: in local networks https isn't supported):
```sh
caddy -agree=true -http-port <http_port> -https-port <https_port> -conf=<path_to_Caddyfile> -pidfile=<path_to_pidfile> -root=/var/tmp &
```
1. To stop it run:
```sh
kill `cat <pidFile>`
```
