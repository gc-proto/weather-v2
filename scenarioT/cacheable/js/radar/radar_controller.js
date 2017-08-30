var resp = -1;


//Local overlay handlers
$("input#wxo-overlay-cities").change( function() {
	var checked = this.checked;
	$('input#composite-cities-overlay').prop('checked', checked);
	$('input#overlay_default_cities').prop('checked', checked);
	toggleCityOverlay(checked);
	cityOverlayCookie(checked);
});

$("input#overlay_default_cities").change( function() {
	var checked = this.checked;
	$('input#wxo-overlay-cities').prop('checked', checked);
	toggleCityOverlay(checked);
	cityOverlayCookie(checked);
});

$("input#wxo-overlay-more-cities").change( function() {
	var checked = this.checked;
	$('input#overlay_additional_cities').prop('checked', checked);
	toggleAdditionalCitiesOverlay(checked);
	cityOverlay2Cookie(checked);
});

$("input#overlay_additional_cities").change( function() {
	var checked = this.checked;
	$('input#wxo-overlay-more-cities').prop('checked', checked);
	toggleAdditionalCitiesOverlay(checked);
	cityOverlay2Cookie(checked);
});

$("input#wxo-overlay-roads").change( function() {
	var checked = this.checked;
	$('input#overlay_roads').prop('checked', checked);
	toggleOverlayRoads();
	roadCookie(checked);
});

$("input#overlay_roads").change( function() {
	var checked = this.checked;
	$('input#wxo-overlay-roads').prop('checked', checked);
	toggleOverlayRoads();
	roadCookie(checked);
});

$("input#wxo-overlay-road-numbers").change( function() {
	var checked = this.checked;
	$('input#overlay_road_labels').prop('checked', checked);
	toggleOverlayRoadNum();
	roadNumCookie(checked);
});

$("input#overlay_road_labels").change( function() {
	var checked = this.checked;
	$('input#wxo-overlay-road-numbers').prop('checked', checked);
	toggleOverlayRoadNum();
	roadNumCookie(checked);
});

$("input#wxo-overlay-river").change( function() {
	var checked = this.checked;
	$('input#overlay_rivers').prop('checked', checked);
	toggleOverlayRiver();
	riverCookie(checked);
});

$("input#overlay_rivers").change( function() {
	var checked = this.checked;
	$('input#wxo-overlay-river').prop('checked', checked);
	toggleOverlayRiver();
	riverCookie(checked);
});

$("input#wxo-overlay-radar-circles").change( function() {
	var checked = this.checked;
	$('input#overlay_radar_circle').prop('checked', checked);
	toggleRadarCircOverlay(checked);
	radCircCookie(checked);
});

$("input#overlay_radar_circle").change( function() {
	var checked = this.checked;
	$('input#wxo-overlay-radar-circles').prop('checked', checked);
	toggleRadarCircOverlay(checked);
	radCircCookie(checked);
});



/*$('input#').click(function(){
	$("input#").prop('checked', $('input#wxo-overlay-radar-circles').prop('checked'));
	animator.callEvent('overlayClick', $("input#overlay_radar_circle")[0], true);
});*/

//Intensity (colour detail) handlers
$('input#intensity-detailed-mob').click(function(){
	$('input#intensity-detailed').prop('checked', true);
	intensityCookie(1);
	activateDetailed();
});

$('input#intensity-standard-mob').click(function(){
	$('input#intensity-standard').prop('checked', true);
	intensityCookie(0);
	activateStandard();
});

//Composite overlay handler
$('input#composite-cities-overlay').change(function(){
	if(this.checked){
		$("input#wxo-overlay-cities").prop('checked', true);
		toggleCityOverlay(true);
		cityOverlayCookie(1);

	} else {
		$("input#wxo-overlay-cities").prop('checked', false);
		toggleCityOverlay(false);
		cityOverlayCookie(0);

	}
});

/* Time Duration Control */
$('[name=duration-mob]').click(function(){
    var val = this.id.slice(0, -4);
    $("#" + val).prop('checked', true); 
    animator.callEvent('durationClick',this,true);
});

function isBreakpoint( alias ) {
  return $('.device-' + alias).is(':visible');
}


function serviceErrorTrigger(){
	$('#wxo-rad-choose').hide();
	$('#animation-frame').hide();
	$('#wxo-rad-error').show();
}

//Align everything that bootstrap can't handle
function resizeComponents(){
	var padding = 10; //l-pad and r-pad on main image is 5
  	var actualWidth = $('img#animation-image').width();
	var actualHeight = $('img#animation-image').height();
	var specWidth = parseInt($('img#animation-image').attr('width'));
	var winWidth = $(window).width();
	var diff = specWidth - winWidth;
	var factor = Math.ceil((winWidth-specWidth)/2);
	$('div#animation-frame').css('height', actualHeight);
	$('div#animation-info').css('width', actualWidth);
	if( factor <= padding) {

		lMarginCalc = -1*(padding) + factor;
		if (lMarginCalc < -10) { lMarginCalc = -10;}
		$('div#animation-info').css('margin-left', lMarginCalc + 'px'); 
		$('div#animator-controller').css('width', actualWidth+25);
		resp=1;
	} else if(resp != 0) {
		$('div#animator-controller').css('width', 720);
		$('div#animation-info').css('margin-left', 'auto');
		resp=0;
	}
}
