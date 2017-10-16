function supportedGeolocAPI () {
	if (window.navigator.geolocation) {
		return "w3c";
	} else if(window.blackberry && blackberry.location.GPSSupported) {
		return "blackberry";
	} else {
		return "none";
	}
}

function getGPSLocation () {
	if (supportedGeolocAPI() == "w3c") {
		getGPSLocationW3C();
	} else if (supportedGeolocAPI() == "blackberry") {
		getGPSLocationBlackberry();
	} else {
		document.getElementById('GPSResults').innerHTML = translate("Your device's location can not be accessed through your web browser");
	}
}

function getGPSLocationW3C () {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(success, fail);
		document.getElementById('GPSResults').innerHTML = translate("Please wait while your location is being obtained...");
	} else {
		document.getElementById('GPSResults').innerHTML = translate("Your device's location can not be accessed through your web browser");
	}
}
function success(position) {
	//gpsForm = document.getElementById("gpsForm");
	var lat = position.coords.latitude;
	var lon = position.coords.longitude;

	var MAX_RADIUS_KM = 60;
	var MAX_RETURNED_CITIES = 3;
      	var distance;
      	for (var i=cities.length-1; i>=0; i--) {
      		cities[i].dist = findClosestCities(lat, lon, cities[i].lat, cities[i].lon);
      	}
      	cities.sort(function(a, b) { 
    		return (a.dist - b.dist)
    	});
      	console.log(cities);
	var html = "<p>" + translate("The closest cities relative to Current Location:") + "</p>";
      	html += "<ol>";
      	//document.getElementById('GPSResults').innerHTML = "<ol>";

			var pagelang;
			var cityname;
			if (LANG == 'fr-CA') {
				pagelang = "f";
			}	
			else {
				pagelang = "e";
			}	

      	for (var i=0; i<MAX_RETURNED_CITIES; i++)
      	{
      		if (cities[i].dist < MAX_RADIUS_KM) {
						if (LANG == 'fr-CA') {
        				    cityname = cities[i].name_f;
         			}
         			else {
            			cityname = cities[i].name_e;
         			}
      		html += "<li><a href=\"city/pages/" + cities[i].key + "_metric_" + pagelang + ".html\">" + cityname + " (" + cities[i].dist + " km)</a></li>";
      		}
      	}
      	html += "</ol>";

      	document.getElementById('GPSResults').innerHTML = html;
}

function fail(error) {
	switch(error.code) {
		case 0:
			// Unknown error alert error message
			document.getElementById('GPSResults').innerHTML = translate("Your device's location could not be accessed. An unknown error occured");
			break;
 
		case 1:
			// Permission denied alert error message
			document.getElementById('GPSResults').innerHTML = translate("Your location can not be determined because access to your Location has been denied for this web site. If you would like to use this feature, please allow this web site to access your Location when prompted.");
			break;

		case 2:
			// Position Unavailable
			document.getElementById('GPSResults').innerHTML = translate("Your position is unavailable at the moment. Please try again later.");
			break;

		case 3:
			// Timeout
			document.getElementById('GPSResults').innerHTML = translate("Your position could not be obtained because the request has timed out");
			break;
	}
}

var numUpdates = 0;
function locationCallBack() {
	if (numUpdates == 0) {
		var lat = blackberry.location.latitude;
		var lon = blackberry.location.longitude;
		document.gpsForm.lat.value = lat;
		document.gpsForm.lon.value = lon;
		document.gpsForm.command.value = 'findClosestCities';
		numUpdates++;
		clearTimeout(t);
		document.gpsForm.submit();
		return true;
	}
	numUpdates++;
}
function getGPSLocationBlackberry() {
	document.getElementById('GPSResults').innerHTML = translate("Please wait while your location is being obtained...");
	t = setTimeout("blackberryGPSTimeout()",20000);
	blackberry.location.setAidMode(2);
	blackberry.location.onLocationUpdate("locationCallBack()");
	blackberry.location.refreshLocation();
}

function blackberryGPSTimeout() {
	document.getElementById('GPSResults').innerHTML = translate("Your position could not be obtained because the request has timed out.");
}

function findClosestCities(lat1,lon1,lat2,lon2) {
	var R = 6371; // km (change this constant to get miles)
	var dLat = (lat2-lat1) * Math.PI / 180;
	var dLon = (lon2-lon1) * Math.PI / 180;
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
		Math.cos(lat1 * Math.PI / 180 ) * Math.cos(lat2 * Math.PI / 180 ) *
		Math.sin(dLon/2) * Math.sin(dLon/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;
	if (d>1) return Math.round(d);
	else if (d<=1) return Math.round(d*1000);
	return d; 
}

