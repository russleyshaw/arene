const express       = require("express");
const config        = require("config");
const bodyParser    = require("body-parser");
const path          = require("path");
const winston       = require("winston");

winston.level = config.logging;

// let clientApi       = require("./client/api");
// let matchApi        = require("./match/api");
// let logApi          = require("./log/api");
let scheduleApi     = require("./schedule_api");
let playApi         = require("./play_api");

let app = express();

app.use("/lib/bootstrap", express.static(path.join(__dirname, "./bower_components/bootstrap/dist")));
app.use("/lib/jquery", express.static(path.join(__dirname, "./bower_components/jquery/dist")));
app.use("/lib/react", express.static(path.join(__dirname, "./bower_components/react")));
app.use("/lib/babel", express.static(path.join(__dirname, "./bower_components/babel")));

app.use( bodyParser.json() );
app.use( bodyParser.urlencoded({ extended: true }) );
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept");
    next();
});

// app.use("/", clientApi);
// app.use("/", matchApi);
// app.use("/", logApi);
// app.use("/", scheduleApi);
app.use("/api/v2/play/", playApi);

app.listen(config.port, () => {
    winston.info(`Listening on port ${config.port}`);
});