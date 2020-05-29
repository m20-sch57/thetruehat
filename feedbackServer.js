#!/usr/bin/node

"use strict"

const config = require("./config.json");
const PORT = config.feedbackPort;

const argv = require("yargs")
    .option('pidfile', {
        default: config.feedbackPIDPath
    })
    .option('logfile', {
        default: config.feedbackPath
    })
    .argv;

const fs = require("fs");
fs.writeFile(argv.pidfile, process.pid.toString(), function(err, data) {
    if (err) {
        console.log(err);
    }
});

const express = require("express");
const app = express();

app.listen(PORT);
console.log("Listening on port " + PORT);

const bodyParser = require('body-parser');
app.use(bodyParser.json());

app.post("/feedback", function (req, res) {
    // Getting feedback
    const feedback = req.body;

    // Approving
    res.end();
    res.status(200);

    fs.appendFile(argv.logfile,
        JSON.stringify(feedback, {}, "    ") + "\n",
        (err, data) => {if (err) {console.warn(err);}})
})
