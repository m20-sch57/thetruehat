#!/usr/bin/node

"use strict"

const config = require("./config.json");
const PORT = config.feedbackPort;

const fs = require("fs");
fs.writeFile(config.feedbackPIDPath, process.pid.toString(), function(err, data) {
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

    fs.writeFile(config.feedbackPath,
        JSON.stringify(feedback, {}, "    ") + "\n",
        (err, data) => {if (err) {console.warn(err);}})
})
