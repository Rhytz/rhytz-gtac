/*
 * Copyright (c) 2020. Rhytz
 *
 * @link https://github.com/Rhytz/rhytz-gtac
 */

/**
 * Shows a message in the server console
 *
 * @param source
 * @param message
 * @param type
 */
function logMessage(source, message, type){
    type = type || "log";
    let prefix = "[" + source + "] ";
    switch(type){
        case "warn":
            console.warn(prefix + message);
            break;
        case "log":
        default:
            console.log(prefix + message);
    }
}

bindEventHandler("OnResourceStart", thisResource, function(event, resource) {
    logMessage(thisResource.name, "Started");
});

exportFunction("logMessage", logMessage);