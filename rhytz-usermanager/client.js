/*
 * Copyright (c) 2020. Rhytz
 *
 * @link https://github.com/Rhytz/rhytz-gtac
 */

let autoLogConfigFileName = "autolog.json";
let autoLogConfig = {};


bindEventHandler("OnResourceReady", thisResource, function(event, resource) {
    let autoLogConfigFile = openFile(autoLogConfigFileName);
    if(!autoLogConfigFile){ return; }

    autoLogConfig = JSON.parse(autoLogConfigFile.readBytes(autoLogConfigFile.length));
    autoLogConfigFile.close();
    if(autoLogConfig.autolog){
        triggerNetworkEvent("clientLogin", autoLogConfig.username, autoLogConfig.password);
    }

});

addCommandHandler('login', function(command, parameters) {
    let param = parameters.split(" ");
    autoLogConfig.username = param[0];
    autoLogConfig.password = param[1];
    message("To automatically log in next time, type /autolog on");
    triggerNetworkEvent("clientLogin", autoLogConfig.username, autoLogConfig.password);
});

addCommandHandler('autolog', function(command, parameters) {
    let param = parameters.split(" ");
    autoLogConfig.autolog = param[0] === "on";

    if(autoLogConfig.autolog){
        message("Automatic login enabled");
    }else{
        message("Automatic login disabled");
    }

    let autoLogConfigFile = createFile(autoLogConfigFileName);
    autoLogConfigFile.writeBytes(JSON.stringify(autoLogConfig));
    autoLogConfigFile.close();
});