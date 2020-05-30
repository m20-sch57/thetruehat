#!/usr/bin/node

const mysqlx = require("@mysql/xdevapi");

async function main() {
    console.log("Connecting to database...");
    const session = await mysqlx.getSession({
        user: "root",
        password: "root",
        host: "localhost",
        schema: "test"
    });
    console.log("Connected to database.");

    console.log("Rolling database back...");
    try {
        await session.sql("START TRANSACTION;")
        await session.sql("DELETE FROM Games;").execute();
        await session.sql("DELETE FROM Players;").execute();
        await session.sql("DELETE FROM Rooms;").execute();
        await session.sql("DELETE FROM ExplanationRecords;").execute();
        await session.sql("DELETE FROM Participating;").execute();
        await session.sql("COMMIT;").execute();
        console.log("Rolled database back.");
        process.exit(0);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

main();
