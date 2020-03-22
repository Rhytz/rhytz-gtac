"use strict";

let config;

let db;
let logger;
let addLog;

function loadDependencies(){
    logger = findResourceByName("rhytz-logger");
    if(!logger){
        console.log("rhytz-logger resource is required", "warn");
        return false;
    }

    if(!logger.isStarted){
        logger.start();
    }

    addLog = function(message, type){
        logger.exports.logMessage(thisResource.name, message, type);
    };
    return true;
}

function loadConfig(){
    let configFile = openFile("config.json");
    if(!configFile){
        addLog("Could not load config.json", "warn");
        return false;
    }
    config = JSON.parse(configFile.readBytes(configFile.length));

    return true;
}

function initConnection(){
    db = module.mysql.connect(config.sql_host, config.sql_user, config.sql_password, config.sql_database, config.sql_port);
    addLog("Connected to database");
}

function query(query){
    return db.query(query);
}

function escapeString(string){
    return db.escapeString(string);
}

bindEventHandler("OnResourceStart", thisResource, function(event, resource) {
    if(!loadDependencies() || !loadConfig()){
        event.preventDefault();
        return false;
    }
    initConnection();
    addLog("Loaded");
});

exportFunction("query", query);
exportFunction("escapeString", escapeString);