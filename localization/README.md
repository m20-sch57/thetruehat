Перевод берётся из `.po` файлов, которые должны лежать в этой директории.

Запустите, чтобы создать `json` файл с переводом.
```
	node localization/po2json.js localization/<language>.po static/localization/<language>.json -p
```
`<language>` - язык, на который осуществлён перевод.

`po2json.js` и `gettext.js` взяты отсюда: https://github.com/guillaumepotier/gettext.js.
