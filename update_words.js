const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('DB.db');

const request = require('request');
request('http://the-hat.appspot.com/api/v2/dictionary/ru', function (error, response, body) {
    db.serialize(function () {
        db.run("BEGIN;")
        JSON.parse(body).forEach((word) => {
            db.run("INSERT INTO Words VALUES (?,?,?,?);",
                word.word,
                word.diff,
                word.used,
                word.tags)
        })
        db.run("COMMIT;")
    })
});