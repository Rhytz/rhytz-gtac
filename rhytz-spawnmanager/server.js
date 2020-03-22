/*
 * Copyright (c) 2020. Rhytz
 *
 * @link https://github.com/Rhytz/rhytz-gtac
 */

"use strict";

// Enable strict errors
setErrorMode(RESOURCEERRORMODE_STRICT);

let spawnpointFilename = "spawns_" + server.game + ".json";
let spawnpoints = [[0, 0, 0, 0]]; //Default spawnpoint in case there is no file

let hospitalFilename = "hospitals_" + server.game + ".json";
let hospitals = [];
//let hospitalsVec3 = [];

function randomSkin(){
	let skin = Math.floor(Math.random() * 78);
	if (skin >= 26)
		skin += 4;
	return skin;
}


function getClientFromPed(ped) {
	let clients = getClients();
	for(let i in clients) {
		if(clients[i].player == ped) {
			return clients[i];
		}
	}
	
	return false;
}


function getClosestHospital(pos){
	return hospitals.reduce((i, j) => (i.vec3.distance(pos) <= j.vec3.distance(pos)) ? i : j);
}


bindEventHandler("OnResourceStart", thisResource, (event,resource) => {
	let loadSpawnFile = openFile(spawnpointFilename);
	if(loadSpawnFile !== null) {
		spawnpoints = JSON.parse(loadSpawnFile.readBytes(loadSpawnFile.length));
		loadSpawnFile.close();
	}
	
	let loadHospitalFile = openFile(hospitalFilename);
	if(loadHospitalFile !== null) {
		let hospitalData = JSON.parse(loadHospitalFile.readBytes(loadHospitalFile.length));
		for(let hospital of hospitalData){
			hospitals.push({vec3: new Vec3(hospital[0],hospital[1],hospital[2]), rot: hospital[3]});
		}
		loadHospitalFile.close();
	}
});


addEventHandler("OnPlayerJoined", (event,client) => {
	let randomSpawn = spawnpoints[Math.floor(Math.random() * spawnpoints.length)];
	spawnPlayer(client, [randomSpawn[0], randomSpawn[1], randomSpawn[2]], randomSpawn[3], randomSkin());
	messageClient("Welcome to Rhytz's Super Phun Thyme", client);
	fadeCamera(client, true);
});


addEventHandler("OnPedWasted", function(event, wastedPed, attackerPed, Weapon, PedPiece){
	setTimeout(function(){
		if(wastedPed.type != ELEMENT_PLAYER) {
			return;
		}
		let client = getClientFromPed(wastedPed);
		if(client == null){ return; }
		
		let closestHospital = getClosestHospital(wastedPed.position);
		spawnPlayer(client, closestHospital.vec3, closestHospital.rot, randomSkin());
		
	},
	5000);
});


addCommandHandler("savespawn", function(cmdName, params, client) {
	if(!client.administrator){ return false; }	
	
	spawnpoints.push([client.player.position.x, client.player.position.y, client.player.position.z, client.player.heading]);
	
	let saveSpawnFile = createFile(spawnpointFilename);
	saveSpawnFile.writeBytes(JSON.stringify(spawnpoints));
	saveSpawnFile.close();
	messageClient("Spawnpoint saved " + client.player.position.x, client, COLOUR_YELLOW);
});


addCommandHandler("savehospital", function(cmdName, params, client) {
	if(!client.administrator){ return false; }
	
	let loadSpawnFile = openFile(hospitalFilename);
	let spawnData = [];
	if(loadSpawnFile !== null) {
		spawnData = JSON.parse(loadSpawnFile.readBytes(loadSpawnFile.length));
		loadSpawnFile.close();
	}	
	
	spawnData.push([client.player.position.x, client.player.position.y, client.player.position.z, client.player.heading]);
	
	let saveSpawnFile = createFile(hospitalFilename);
	saveSpawnFile.writeBytes(JSON.stringify(spawnData));
	saveSpawnFile.close();
	messageClient("Hospital saved " + client.player.position.x, client, COLOUR_YELLOW);
});



addCommandHandler('veh', function(command, parameters, client)
{
	if(!client.administrator){ return false; }
    if(!client.player)
    {
        messageClient('You must be spawned to spawn a vehicle!', client);
    }
    else if(parameters.trim() == '')
    {
        messageClient('You must type a model number! Command syntax: /vehicle model', client);
    }
    else
    {
        var model = parseInt(parameters);
        var vehicle = createVehicle(model, client.player.position);
        addToWorld(vehicle);
    }
});