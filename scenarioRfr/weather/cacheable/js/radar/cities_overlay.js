

function addCityOverlay(){

	//First, check cookie to see if it should be displayed
	//var cookieSet = isSettingOn('overlay_cities');
	var cookieSet = cityOverlayCookie();
	var hideClass = " wxo-hide-overlay";
	if (cookieSet) {hideClass = "";}
	$('#animation-frame').append('<div id="composite-animation-image-wrapper"></div>');

	var imgUrl = $('input#composite-cities-overlay').attr('data-overlay_src');
	var imgRegion = $('input#composite-cities-overlay').attr('data-overlay_region');
	if (typeof imgUrl !== 'undefined') {
    	// variable is undefined
    	if (imgUrl.indexOf("nat") != -1){
			$('#composite-animation-image-wrapper').html('<img class="overlay-img img-responsive ' + hideClass +'"  width="600" height="522" id="composite-cities-image" alt="'+ _("Cities") +'" src="' + imgUrl + '" usemap="#COMPOSITE_' + imgRegion.toUpperCase() +'" />');
		} else {
			$('#composite-animation-image-wrapper').html('<img class="overlay-img img-responsive' + hideClass +'"  width="573" height="300" id="composite-cities-image" alt="'+ _("Cities") +'" src="' + imgUrl + '" usemap="#COMPOSITE_' + imgRegion.toUpperCase() +'" />');
		}
	}	
	

}


function toggleCityOverlay(toState){
	$('img#composite-cities-image').toggleClass('wxo-hide-overlay');
}

function toggleAdditionalCitiesOverlay(toState){
	$('img#additional_cities').toggleClass('wxo-hide-overlay');
}

function toggleRadarCircOverlay(){
	$('img#radar_circle').toggleClass('wxo-hide-overlay');
}

function toggleOverlayRoads(){
	$('img#roads').toggleClass('wxo-hide-overlay');
}

function toggleOverlayRoadNum(){
	$('img#road_num').toggleClass('wxo-hide-overlay');
}

function toggleOverlayRiver(){
	$('img#river').toggleClass('wxo-hide-overlay');
}


function evalJSON (str) {
	if (str && str.replace) return eval("(" + (str.replace(/^\s|\s$/g,'') || "''") + ")");
	else return "";
}
