var _COOKIE_DEFAULTS = {
	overlay_cities: 1,
	duration_short: 1,
	intensity_detailed: 1,
	overlay_roads: 1,
	overlay_radcirc: 1,
	overlay_roadnum: 0,
	overlay_cities2: 0,
	overlay_rivers: 0
}                
var keyEq  = "radar_settings=";


//Private set cookie function
function setCookieValue(key, value){    
	if (value == true) { value = 1;}
	if (value == false) { value = 0;}
	var $expiry = new Date();
	var milliseconds = 7776000000; //90days * 24hr/day * 3600seconds/hr * 1000ms/s = x ms;
	$expiry.setTime($expiry.getTime() + milliseconds);
	var settingsCookie = document.cookie.split(';'); 
	var settingsJSON = -1;
	for (var i = 0; i < settingsCookie.length; i++) {
	var c = settingsCookie[i];
	    while (c.charAt(0) == ' ') c = c.substring(1, c.length);
	    if (c.indexOf(keyEq) == 0){
	    	settingsJSON = c.substring(keyEq.length, c.length);
	    	break;
	    } 
	}
	if (settingsJSON != -1){
		var settings = jQuery.parseJSON(decodeURIComponent(settingsJSON));
		settings[key] = value;
	}

	//document.cookie=keyEq + jQuery.encodeJSON(settings) + "; path=/radar/; expires=" + $expiry.toGMTString();
	document.cookie=keyEq + JSON.stringify(settings) + "; path=/radar/; expires=" + $expiry.toGMTString();
}



//Private cookie lookup boolean value from radar_settings cookie (use get/set functions below instead)
function isSettingOn(key){
	var settingsCookie = document.cookie.split(';'); 
	var settingsJSON = -1;
	for (var i = 0; i < settingsCookie.length; i++) {
	    var c = settingsCookie[i];
	    while (c.charAt(0) == ' ') c = c.substring(1, c.length);

	    if (c.indexOf(keyEq) == 0){
	    	settingsJSON = c.substring(keyEq.length, c.length);

	    	break;
	    } 
	}
	if (settingsJSON != -1 && settingsJSON != 'undefined'){
		var settings = jQuery.parseJSON(decodeURIComponent(settingsJSON));
		if(settings.hasOwnProperty(key)){
			return settings[key];
		}
	}
	if (_COOKIE_DEFAULTS.hasOwnProperty(key)){  //return default value if no cookie value found
		return _COOKIE_DEFAULTS[key];
	}
	return -1; //return -1 if value is not part of cookie
	
}

//Public Get/Set Functions for Non-Overlay Cookie Values 
function intensityCookie(detailed){
	//setCookieValue('', detailed);
	if (typeof(detailed) !== 'undefined'){
		setCookieValue('intensity_detailed', detailed);
	} else {
		return isSettingOn('intensity_detailed');
	}	
}

function durationShortCookie(length){
	if (typeof(length) !== 'undefined'){
		if(length == 'short') {
			setCookieValue('duration_short', 1);
		} else {
			setCookieValue('duration_short', 0);
		}
	} else {
		return isSettingOn('duration_short');
	}

}

//Public Get/Set Function for Overlay Cookie Values
function cityOverlayCookie(overlay){
	if (typeof(overlay) !== 'undefined'){
		setCookieValue('overlay_cities', overlay);
	} else {
		return isSettingOn('overlay_cities');
	}
}

function roadCookie(roads){
	if (typeof(roads) !== 'undefined'){
		setCookieValue('overlay_roads', roads);
	} else {
		return isSettingOn('overlay_roads');
	}
}	

function radCircCookie(radCirc){
	if (typeof(radCirc) !== 'undefined'){
		setCookieValue('overlay_radcirc', radCirc);
	} else {
		return isSettingOn('overlay_radcirc');
	}
}

function roadNumCookie(roadNum){
	if (typeof(roadNum) !== 'undefined'){
		setCookieValue('overlay_roadnum', roadNum);
	} else {
		return isSettingOn('overlay_roadnum');
	}	
}

function cityOverlay2Cookie(overlay){
	if (typeof(overlay) !== 'undefined'){
		setCookieValue('overlay_cities2', overlay);
	} else {
		return isSettingOn('overlay_cities2');
	}	
}

function riverCookie(rivers){
	if (typeof(rivers) !== 'undefined'){
		setCookieValue('overlay_rivers', rivers);
	} else {
		return isSettingOn('overlay_rivers');
	}	
}


function getActive(){
	active = [];
	if (roadCookie()){
		active.push('overlay_roads');
	}

	if(cityOverlayCookie()){
		active.push('overlay_default_cities');
	}

	if(radCircCookie()){
		active.push('overlay_radar_circle');
	}

	if(roadNumCookie()){
		active.push('overlay_road_labels');
	}

	if(cityOverlay2Cookie()){
		active.push('overlay_additional_cities');
	}

	if(riverCookie()){
		active.push('overlay_rivers');
	}
	return active;
}