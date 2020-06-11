#!/usr/bin/node

const mysqlx = require("@mysql/xdevapi");

const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function rlAsync(question, answer) {
    return new Promise(function(resolve, reject) {
        rl.question(question, function(input) {
            if (input === answer) {
                resolve(true);
            } else {
                resolve(false);
            }
            rl.close();
        });
    });
}

async function main() {
    await console.log("This action cannot be undone. Recreating database will remove ALL data from it. Please be certain.");
    const res = await rlAsync("Type \"I understand the consequences, recreate database `test`\" to continue\n.", "I understand the consequences, recreate database `test`");
    if (!res) {
        console.log("Aborting...");
        process.exit(1);
    }

    console.log("Connecting to mysql server...");
    const session = await mysqlx.getSession({
        user: "root",
        password: "root",
        host: "localhost"
    });
    console.log("Connected to mysql server.");

    console.log("Recreating database...");
    try {
        await session.sql("drop database test;").bind().execute();
        await session.sql("create database test;").bind().execute();
        console.log("Database recreated.");
        process.exit(0);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}

main();
