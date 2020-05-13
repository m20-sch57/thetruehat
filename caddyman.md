1. Install caddy **v1** from official [https://caddyserver.com/v1/download](website).
1. Run caddy server:
```sh
caddy -agree=true -http-port 8005 -https-port 3005 -conf=<path_to_Caddyfile> -pidfile=<path_to_pidfile> -root=/var/tmp &
```
1. To stop it run:
```sh
kill `cat <pidFile>`
```
