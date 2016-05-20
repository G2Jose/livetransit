SlidingMarker.initializeGlobally();

m = 100;
b = 10;
var cityCircle;

var options = {
	radius: 10,
	strokeOpacity: 1,
	strokeWeight: 0.5,
	fillOpacity: 1,
	strokeColor: "#FFFFFF"
};

var polygonOptions = {
	icon: {
		path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
		scale: 1.5,
		fillColor: '#000080',
		strokeColor: '#000080',
		fillOpacity: 1,
		strokeOpacity: 1
	},
	duration: 5000,
	draggable: false,
	title: "ABC"
};

var infoWindow = new google.maps.InfoWindow();

var polygons = {};
var vehicles = {};
var ages = [];
var circles = {};
var itemsChanged = 0;
var opacity = 0;

function initialize() {
	var mapOptions = {
		zoom: 15,
		center: new google.maps.LatLng(43.64467, -79.39959)
	};
	var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
	options.map = map;
	polygonOptions.map = map;
	function doStuff() {
		$.ajax({
			type: "GET",
			url: "http://restbus.info/api/agencies/ttc/vehicles",
			success: function (response) {
				itemsChanged = 0;
				var rl = response.length;
				for (var i = 0; i < rl; i++) {
					var id = response[i]["id"];
					var xy = new google.maps.LatLng(parseFloat(response[i]["lat"]), parseFloat(response[i]["lon"]));
					var age = response[i]["secsSinceReport"];
					var heading = response[i]["heading"];
					var color = "#008900";
					polygonOptions.title = response[i]["routeId"];
					polygonOptions.icon.rotation = parseFloat(heading);
					opacity = (100 - 5.0 / 3.0 * age) / 100;
					if (!(id in vehicles)) {
						vehicles[id] = {
							"xy": xy,
							"age": age
						};
						polygonOptions.position = xy;
						polygonOptions.icon.fillOpacity = opacity;
						polygonOptions.icon.strokeOpacity = opacity;
						polygons[id] = new SlidingMarker(polygonOptions);
					} else {
						if (vehicles[id]["xy"].lat() != xy.lat()) {
							itemsChanged += 1;
							vehicles[id]["xy"] = xy;
							polygonOptions.position = xy;
							polygonOptions.icon.fillOpacity = opacity;
							polygonOptions.icon.strokeOpacity = opacity;
							polygons[id].setOpacity(opacity);
							polygons[id].setIcon(polygonOptions.icon);
							polygons[id].setPosition(xy);
						} else {
							polygons[id].setOpacity(opacity);
						}
					}
				}
			}
		});
	}
	setInterval(doStuff, 3000);
}
google.maps.event.addDomListener(window, 'load', initialize);
