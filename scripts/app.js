(function(){
	local_weather();
	// weather condition codes: http://openweathermap.org/weather-conditions
	function local_weather(){
		var geo = false, lat, lon, weather_data = null;
		if ("geolcation" in navigator) {
			geo = true;
			navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
			
			function geoSuccess(position){
				lat = position.coords.latitude;
				lon = position.coords.longitude;
			}
			function geoError(error){
				console.log('Geolocation error:', error.code, error.message);
			}
		} else { // get lat/lon from IP
			$.ajax({
				url: 'http://ipinfo.io',
				type: 'GET',
				dataType: 'jsonp'
			})
			.done(function(data) {
				var coords = data.loc.split(',');
				lat = coords[0],
				lon = coords[1];
			})
			.fail(function(e) {
				console.log("error: ", e.message);
			});
			
		}
		// get the weather data
		$.ajax({
			url: 'http://api.openweathermap.org/data/2.5/weather?lat='+ lat +'&lon='+ lon +'&cnt=1',
			type: 'GET',
			dataType: 'json'
		})
		.done(function(data) {
			weather_data = {
				'clouds: ': data.clouds.all, // %
				'humidity: ': data.main.humidity, // %
				'pressure: ': data.main.pressure, // hPa
				'temp: ': data.main.temp, //Kelvin (subtract 273.15 to convert to Celsius)
				'sunrise: ': data.sys.sunrise, //unix, UTC
				'sunset: ': data.sys.sunset, //unix, UTC
				'wind-degrees: ': data.wind.deg, // degrees (meteorological)
				'wind-speed: ': data.wind.speed, //mph
				'weather-condition-code: ': data.weather[0].id,
				'rain': data.rain, //Precipitation volume for last 3 hours, mm
				'snow': data.snow //Snow volume for last 3 hours, mm
			};
			//console.log("all data: ", data);
			console.log("filtered data: ", weather_data);
			// return weather_data;
		})
		.fail(function(e) {
			console.log("error: ", e.message);
		});
		//return weather_data;
	}
})();