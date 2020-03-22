/*
 * Copyright (c) 2020. Rhytz
 *
 * @link https://github.com/Rhytz/rhytz-gtac
 */

let introAudioFile;
let introAudio;

bindEventHandler("OnResourceReady", thisResource, function(event, resource) {
	//introAudioFile = openFile("intro.mp3");
	if(introAudioFile != null){
		introAudio = audio.createSound(introAudioFile, true);
		introAudio.play();
		introAudioFile.close();
	}


});

addCommandHandler("createspheretest", function(cmdName, params) {
	//if(!client.administrator){ return false; }
	//createSphere(localPlayer.position, 1000);
	let pickup = createPickup(localPlayer.position, 1361, 1);
	
	bindEventHandler("OnPickupUse", pickup, (event,pickup,player) => {
        localPlayer.health = 90;
    });
	message("OK");
});

