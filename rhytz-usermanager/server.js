/*
 * Copyright (c) 2020. Rhytz
 *
 * @link https://github.com/Rhytz/rhytz-gtac
 */

"use strict";

let config;
let loggedInUsers = {};

// var db;

/**
 * Shows a message in the server console
 *
 * @param message
 * @param type
 */
function consoleMessage(message, type){
	type = type || "log";
	let prefix = "[rhytz-usermanager] ";
	switch(type){
		case "warn":
			console.warn(prefix + message);
			break;
		case "log":
		default:
			console.log(prefix + message);
	}
}

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

	// let passwordhash = CryptoJS.SHA256(password).toString();
	// username = db.escapeString(username);
	// let result = db.query("SELECT administrator FROM users WHERE username='${username}' AND password='${passwordhash}'");
	// if(result.numRows > 0) {
	// 	return true;
	// }
	//
	if(username !== config.admin_user || password !== config.admin_password){
		throw "Incorrect username or password";
	}

	client.administrator = true;
	loggedInUsers[client.index] = username;
	consoleMessage(username + " logged in");
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

	// let passwordhash = CryptoJS.SHA256(password).toString();
	// username = db.escapeString(username);
	// let result = db.query("INSERT INTO users (username, password) VALUES ('${username}', '${passwordhash}')");
	console.log("[rhytz-usermanager] " + username + " registered");
	return true;
}

/**
 * Logs user out
 *
 * @param client
 * @returns {boolean} Successfully logged out
 */
function logoutUser(client){
	delete loggedInUsers[client.index];
	return true;
}


bindEventHandler("OnResourceStart", thisResource, function(event, resource) {
	let configFile = openFile("config.json");
	if(!configFile){
		consoleMessage("Could not load config.json.", "warn");
		return false;
	}
	config = JSON.parse(configFile.readBytes(configFile.length));
	// db = module.mysql.connect("localhost", "gtac", "", "gtac", 3306);
	// let create = `CREATE TABLE IF NOT EXISTS users (
	// 	id int(10) UNSIGNED NOT NULL AUTO_INCREMENT,
	// 	username varchar(64) NOT NULL,
	// 	password varchar(64) NOT NULL,
	// 	registered datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	// 	updated datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	// 	lastseen datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
	// 	administrator tinyint(1) NOT NULL DEFAULT '0',
	// 	PRIMARY KEY (id),
	// 	UNIQUE KEY username (username)
	// ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`;
	// let initialize = db.query(create);
});

addCommandHandler("login", function(command, parameters, client){
	let param = parameters.split(" ");
	let username = param[0];
	let password = param[1];
	
	try {
		if(loginUser(client, username, password)){
			messageClient("Succesfully logged in", client);
		}
	}catch(err){
		messageClient("Could not log you in: " + err, client);
	}
});

addCommandHandler("logout", function(command, parameters, client){
	logoutUser(client);
	messageClient("Succesfully logged out", client);
});

addCommandHandler("register", function(command, parameters, client){
	let param = parameters.split(" ");
	let username = param[0];
	let password = param[1];
	registerUser(client, username, password);
	messageClient("Succesfully registered", client);
});

// addCommandHandler("crypttest", function(command, parameters, client){
// 	var encrypted = CryptoJS.SHA256("password");
// 	messageClient(encrypted.toString(), client);
// });

