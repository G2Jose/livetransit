SlidingMarker.initializeGlobally();

m = 100; 
b = 10;
var polygons = {};
var xyOld = {};
var xyNew = {};
var vehicles = {};
var routes = {};
var stops = {};
var ages = [];
var circles = {};
var itemsChanged = 0;
var opacity = 0;
var cityCircle;

var options = {
	radius:10,
	strokeOpacity:1,
	strokeWeight:0.5,
	fillOpacity:1, 
	strokeColor: "#FFFFFF"
};

var polygonOptions = {
	icon:{
		path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW, 
		scale: 1.5, 
		fillColor: '#000080', 
		strokeColor: '#000080',
		fillOpacity: 1,
		strokeOpacity: 1, 
	}, 
	duration: 5000,
	draggable: false, 
	title: "ABC"
}

var infoWindow = new google.maps.InfoWindow();  

function toRad(degrees){
	return parseFloat(degrees) * Math.PI/180;
}
// function getDistance(lat1, lat2, lon1, lon2){
// 	// return Math.sqrt(Math.pow((xy2.lat() - xy1.lat()), 2) - Math.pow((xy2.lon() - xy1.lon()), 2));
// 	return Math.sqrt(Math.pow((lat2 - lat1), 2) - Math.pow((lon2, lon1), 2));

// }

var getDistance = function(p1, p2) {
  var R = 6378137; // Earth’s mean radius in meter
  var dLat = toRad(p2.lat() - p1.lat());
  var dLong = toRad(p2.lng() - p1.lng());
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(p1.lat())) * Math.cos(toRad(p2.lat())) *
    Math.sin(dLong / 2) * Math.sin(dLong / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d; // returns the distance in meter
};

function getStops(route){
	$.ajax({
		type: "GET", 
		url: "http://restbus.info/api/agencies/ttc/routes/" + route,
		success: function(response){
			console.log(response);
			stops = response["stops"];
		}
	})
}

function getClosestStop(XY, stops){
	var closestIndex = 0; 
	for(var i = 0; i < stops.length; i ++){
		if(getDistance(XY, new google.maps.LatLng(parseFloat(stops[i]["lat"]), parseFloat(stops[i]["lon"]))) < getDistance(XY, new google.maps.LatLng(parseFloat(stops[closestIndex]["lat"]), parseFloat(stops[i]["lon"]))))
			closestIndex = i;
	}
	var stopPoint = new google.maps.LatLng(stops[closestIndex]["lat"], stops[closestIndex]["lon"]);
	console.log(closestIndex + ": "+ stops[closestIndex]["title"] + " heading: " + google.maps.geometry.spherical.computeHeading(XY,stopPoint));

}

function getNextStop(XY, XYOld, stops){
	var closestIndex = 0; 
	for(var i = 0; i < stops.length; i ++){
		var stopPoint = new google.maps.LatLng(stops[i]["lat"], stops[i]["lon"]);
		var currentDistance = getDistance(XY, new google.maps.LatLng(parseFloat(stops[i]["lat"]), parseFloat(stops[i]["lon"])));
		var oldDistance = getDistance(XY, new google.maps.LatLng(parseFloat(stops[closestIndex]["lat"]), parseFloat(stops[i]["lon"])));
		var angle1 = google.maps.geometry.spherical.computeHeading(XY,stopPoint);
		console.log("old: " + XYOld);
		console.log("new: " + XY);
		var angle2 = google.maps.geometry.spherical.computeHeading(XYOld,XY);

		// console.log("currentDistance: " + currentDistance + " oldDistance: " + oldDistance + " heading: " + angle1 + " heading2: " + angle2);
		if(currentDistance < oldDistance)
			closestIndex = i;
	}
	
	// console.log(closestIndex + ": "+ stops[closestIndex]["title"] + " heading: " + google.maps.geometry.spherical.computeHeading(XY,stopPoint));

}

function initialize() {
	getStops(504);
	var mapOptions = {
		zoom: 15,
		center: new google.maps.LatLng(43.64467,-79.39959),
	};
	var map = new google.maps.Map(document.getElementById('map-canvas'),
	mapOptions);
	options.map = map;
	polygonOptions.map = map;
	function doStuff(){
		$.ajax({
	        type: "GET",
	        url: "http://restbus.info/api/agencies/ttc/routes/504/vehicles",
	        success: function(response) {
	        	// console.log("recieved response");
	        	itemsChanged = 0;
	        	var rl = response.length;

	        	for (var i = 0; i < rl; i++){
	        		var id = response[i]["id"];
	        		var xy = new google.maps.LatLng(parseFloat(response[i]["lat"]), parseFloat(response[i]["lon"]));
	        		xyNew[id] = xy;
	        		var age = response[i]["secsSinceReport"];
	        		var heading = response[i]["heading"];
	        		var color = "#008900";
	        		polygonOptions.title = response[i]["routeId"];
	          		polygonOptions.icon.rotation = parseFloat(heading);
	          		// console.log("Rotation: " + polygonOptions.rotation);
	          		opacity = (100 - 5.0/3.0 * age)/ 100;
	          		
	        		if (!(id in vehicles)){
	        			vehicles[id] = {
	        				"xy": xy,
	        				"age": age
	        			}
	        			xyOld[id]  = xy;
	        			polygonOptions.position = xy;
	        			polygonOptions.icon.fillOpacity = opacity;
	        			polygonOptions.icon.strokeOpacity = opacity;
	        			polygons[id] = new SlidingMarker(polygonOptions);

	        		} else{
						if(vehicles[id]["xy"].lat() != xy.lat()){
							itemsChanged += 1;
							vehicles[id]["xy"] = xy;
							polygonOptions.position = xy;
							polygonOptions.icon.fillOpacity = opacity;
	        				polygonOptions.icon.strokeOpacity = opacity;
							polygons[id].setOpacity(opacity);
							polygons[id].setIcon(polygonOptions.icon);
							polygons[id].setPosition(xy);
						}else{
	        				polygons[id].setOpacity(opacity);
						}
	        		}
	        		getNextStop(xyNew[id], xyOld[id], stops);
	        		xyOld[id] = xyNew[id];
	        		xyNew[id] = '';
	        	}
	        	xyOld = xyNew; 
	        	xyNew = {};
	        }
	    });
	}
	setInterval(doStuff, 3000);
}
google.maps.event.addDomListener(window, 'load', initialize);