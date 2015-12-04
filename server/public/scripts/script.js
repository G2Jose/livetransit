m = 100; 
b = 10;
var cityCircle;

var options = {
	radius:10,
	strokeOpacity:1,
	strokeWeight:0.01,
	fillOpacity:1, 
	strokeColor: "#FFFFFF"
};

var infoWindow = new google.maps.InfoWindow();  

function toRad(degrees){
	return parseFloat(degrees) * Math.PI/180;
}
function x1(theta){
	return Math.sin(theta * Math.PI / 180) * Math.pow((Math.pow(m, 2) - Math.pow(b, 2)), 1/2);
}
function y1(theta){
	return Math.cos(theta * Math.PI / 180) * Math.pow((Math.pow(m, 2) - Math.pow(b, 2)), 1/2);
}
function x2(theta){
	return Math.cos( -1 * theta * Math.PI / 180) * b
}
function y2(theta){
	return b * Math.sin(-1* theta * Math.PI/ 180)
}
function x3(theta){
	return -1 * Math.cos( -1 * theta * Math.PI / 180) * b
}
function y3(theta){
	return -1 * b * Math.sin(-1* theta * Math.PI/ 180)
}

var vehicles = {};
var ages = [];
var allCircles =[];
var circlesToRemove = [];
var circles = {};
var itemsChanged = 0;

function initialize() {
	var mapOptions = {
		zoom: 15,
		center: new google.maps.LatLng(43.64467,-79.39959),
	};
	var map = new google.maps.Map(document.getElementById('map-canvas'),
	mapOptions);
	options.map = map;
	function doStuff(){
		$.ajax({
	        type: "GET",
	        url: "http://restbus.info/api/agencies/ttc/vehicles",
	        success: function(response) {
	        	console.log("recieved response");
	        	itemsChanged = 0;
	        	var rl = response.length;

	        	for (var i = 0; i < rl; i++){
	        		var id = response[i]["id"];
	        		var xy = new google.maps.LatLng(parseFloat(response[i]["lat"]), parseFloat(response[i]["lon"]));
	        		var age = response[i]["secsSinceReport"];
	        		var color = "#000000";
	        		if(age>=30){
	            		color = "#CC0000";
	            	}else if(age>=15){
	            		color = "#000000";
	            	}else{
	            		color = "#008900";
	            	}
	        		if (!(id in vehicles)){
	        			vehicles[id] = {
	        				"xy": xy,
	        				"age": age
	        			}
	        			options.center = xy;
	        			options.fillColor = color;
	        			circles[id] = new google.maps.Circle(options);
	        		} else{
						if(vehicles[id]["xy"].lat() != xy.lat()){
							circles[id].setMap(null);
							itemsChanged += 1;
							vehicles[id]["xy"] = xy;
							options.center = xy;
							options.fillColor = color;
							circles[id] = new google.maps.Circle(options);
						}else{
							circles[id].setOptions({
								"fillColor": color
							})
						}
	        		}
	        	}
	        }
	    });
	}
	setInterval(doStuff, 5000);
}
google.maps.event.addDomListener(window, 'load', initialize);