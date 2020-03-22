/*
 * Copyright (c) 2020. Rhytz
 *
 * @link https://github.com/Rhytz/rhytz-gtac
 */

"use strict";

let config;
let logger;
let database;
let addLog;
let loggedInUsers = {};

// var db;



/**
 * Checks if the client is currently logged in
 *
 * @param client
 * @returns {boolean}
 */
function isClientLoggedIn(client){
	return !!loggedInUsers[client.index];
}

/**
 * Logs a user in
 *
 * @param client
 * @param username
 * @param password
 * @returns {boolean} Successfully logged in
 */
function loginUser(client, username, password){
	if(isClientLoggedIn(client)){ throw "You're already logged in"; }

	username = database.exports.escapeString(username);
	password = database.exports.escapeString(config.password_salt + password);
	let result = database.exports.query("SELECT administrator FROM users WHERE username='" + username + "' AND password=SHA2('" + password + "', '256')");
	if(result.numRows < 1) {
		throw "Incorrect username or password";
	}

	//console.log(result.fetchAssoc()); //Whatever i try with result.fetchAssoc(), server crashes
	client.administrator = true;
	loggedInUsers[client.index] = username;
	addLog(username + " logged in");
	return true;
}

/**
 * Register account for user
 *
 * @param client
 * @param username
 * @param password
 * @returns {boolean} Successfully registered
 */
function registerUser(client, username, password){
	if(isClientLoggedIn(client)){ throw "You're already logged in"; }

	username = database.exports.escapeString(username);
	password = database.exports.escapeString(config.password_salt + password);
	let result = database.exports.query(
		"INSERT INTO users (username, password) VALUES ('" + username + "', SHA2('" + password + "', '256'))"
	);
	addLog(username + " registered");
	return true;
}

/**
 * Logs user out
 *
 * @param client
 * @returns {boolean} Successfully logged out
 */
function logoutUser(client){
	if(loggedInUsers[client.index]) {
		delete loggedInUsers[client.index];
	}
	return true;
}

bindEventHandler("OnResourceStart", thisResource, function(event, resource) {
	logger = findResourceByName("rhytz-logger");
	if(!logger){
		console.log("rhytz-logger resource is required", "warn");
		event.preventDefault();
		return false;
	}

	if(!logger.isStarted){
		logger.start();
	}

	addLog = function(message, type){
		logger.exports.logMessage(thisResource.name, message, type);
	};

	database = findResourceByName("rhytz-mysql");
	if(!database){
		addLog("rhytz-mysql resource is required", "warn");
		event.preventDefault();
		return false;
	}

	if(!database.isStarted){
		database.start();
	}

	let configFile = openFile("config.json");
	if(!configFile){
		addLog("Could not load config.json", "warn");
		event.preventDefault();
		return false;
	}
	config = JSON.parse(configFile.readBytes(configFile.length));

	let create = `CREATE TABLE IF NOT EXISTS users (
		id int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
		username varchar(64) NOT NULL,
		password varchar(64) NOT NULL,
		registered datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
		updated datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
		lastseen datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
		administrator tinyint(1) NOT NULL DEFAULT '0',
		money int(10) UNSIGNED NOT NULL DEFAULT '0',
		PRIMARY KEY (id),
		UNIQUE KEY username (username)
	) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
	database.exports.query(create);

	addLog("Loaded user manager");
});

addEventHandler("onPlayerQuit", function(event, client, disconnectType){
	if(loggedInUsers[client.index]){
		delete loggedInUsers[client.index];
	}
});


addCommandHandler("logout", function(command, parameters, client){
	logoutUser(client);
	messageClient("Successfully logged out", client);
});

addCommandHandler("register", function(command, parameters, client){
	let param = parameters.split(" ");
	let username = param[0];
	let password = param[1];
	try {
		registerUser(client, username, password);
		messageClient("Successfully registered", client);
	}catch(err){
		messageClient("Could not register: " + err, client);
	}
});

addNetworkHandler("clientLogin", function(client, username, password){
	try {
		if(loginUser(client, username, password)){
			messageClient("Successfully logged in", client);
		}
	}catch(err){
		messageClient("Could not log you in: " + err, client);
	}
});
