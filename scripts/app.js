(function(){
	gmapInit();
	var geo;
	if("geolocation" in navigator){
		navigator.geolocation.getCurrentPosition(geoSuccess, geoError);

		function geoSuccess(position){
			var lat = position.coords.latitude, lon = position.coords.longitude;
			geoLoc(lat, lon);
			console.log('coords:', position, 'lat: ', position.coords.latitude, 'lon: ', position.coords.longitude);
		}
		function geoError(error){
			console.log('Geolocation error:', error.code, error.message);
		}
		function gmapInit(){
			geo = new google.maps.Geocoder();
		}
		function geoLoc(lat, lon){
			var latlng = new google.maps.LatLng(lat, lon);
			geo.geocode(
				{'latLng': latlng},
				function(results, status){
					if (status == google.maps.GeocoderStatus.OK) {
						if (results[0]) {
							var city = results[0].address_components[3].short_name,
									state = results[0].address_components[5].short_name,
									zip = results[0].address_components[7].short_name;
							weather(city, state, zip);
						}
					}
				}
			);
		}
		// can use lat / lng to get the weather data. google not needed!
		function weather(city, state, zip, lat, lon){ //can use zip alone
			$.ajax({
				// url: 'http://api.openweathermap.org/data/2.5/find?lat='+ lat +'&lon='+ lon +'&cnt=1',
				url: 'http://api.openweathermap.org/data/2.5/weather?q='+ city +','+ state,
				type: 'GET',
				dataType: 'json'
			})
			.done(function(data) {
				var weather_data = {
					'clouds: ': data.clouds.all,
					'humidity: ': data.main.humidity,
					'pressure: ': data.main.pressure,
					'temp: ': data.main.temp,
					'sunrise: ': data.sys.sunrise,
					'sunset: ': data.sys.sunset,
					'wind-degrees: ': data.wind.deg,
					'wind-speed: ': data.wind.speed
				};
				console.log(weather_data);
			})
			.fail(function(e) {
				console.log("error: ", e.message);
			})
			.always(function() {
				//console.log("complete");
			});
			
		}


	} else {
		console.log('No geolocation for you!, using your IP instead...');
		$.get("http://ipinfo.io", function(response) {
		    console.log(response.city, response.country);
		}, "jsonp");
		/*
		response = {
    "ip": "xx.xx.xxx.xxx",
    "city": "x",
    "region": "x",
    "country": "x",
    "loc": "x, -x",
    "postal": "x"
}
		*/
	}

})();