const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('DB.db');

db.run("DELETE FROM Players")
db.run("DELETE FROM Games")
db.run("DELETE FROM Rooms")
db.run("DELETE FROM ExplanationRecords")
db.run("DELETE FROM Participating")