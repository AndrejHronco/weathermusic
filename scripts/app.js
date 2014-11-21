(function(){
	var lat, lng, hasData = false, wd = null;
	var context = new AudioContext();
	var vco1 = context.createOscillator(),
			vco2 = context.createOscillator(),
			vco3 = context.createOscillator(),
			gain2 = context.createGain(),
			gain3 = context.createGain();

	vco1.type = 'sine';
	vco2.type = 'sine';
	vco3.type = 'square';


	init();

	function init(){
		location();	
	}

	function weather_data(data){
		hasData = true;
		wd = {
			'city': data.name,
			'clouds': data.clouds.all, // %
			'humidity': data.main.humidity, // %
			'pressure': data.main.pressure, // hPa
			'temp': data.main.temp, //Kelvin (subtract 273.15 to convert to Celsius)
			'sunrise': data.sys.sunrise, //unix, UTC
			'sunset': data.sys.sunset, //unix, UTC
			'wind_degrees': data.wind.deg, // degrees (meteorological)
			'wind_speed': data.wind.speed, //mph
			'weather_code': data.weather[0].id,
			'rain': data.rain, //Precipitation volume for last 3 hours, mm
			'snow': data.snow //Snow volume for last 3 hours, mm
		};
		console.log('wd: ', wd);

		vco1.connect(context.destination);
		//vco1.start(1);
		vco2.connect(gain2);
		gain2.connect(context.destination);
		gain2.gain.value = 0;
		//vco2.start(2);
		vco3.connect(gain3);
		gain3.connect(context.destination);
		gain3.gain.value = 0;
		//vco3.start(3);

		vco1.frequency.value = wd.temp * 0.5;
		vco2.frequency.value = wd.clouds;
		vco2.detune.value = wd.clouds * .10;
		vco3.frequency.value = wd.humidity * .25;
		gain2.gain.value = wd.wind_degrees * .0005;
		gain3.gain.value = wd.wind_speed * .025;
		
		
		


	}

	//get user location
	function location(){
		if ("geolocation" in navigator) {
			navigator.geolocation.getCurrentPosition(geoSuccess, geoError);
			
			function geoSuccess(position){
				lat = position.coords.latitude;
				lng = position.coords.longitude;
				weather();
			}
			function geoError(error){
				console.log('Geolocation error:', error.code, error.message);
			}
		} else { // get lat/lng from IP
			$.ajax({
				url: 'http://ipinfo.io',
				type: 'GET',
				dataType: 'jsonp'
			})
			.done(function(data) {
				var coords = data.loc.split(',');
				lat = coords[0],
				lng = coords[1];
				weather();
			})
			.fail(function(e) {
				console.log("error: ", e.message);
			});
			
		}		
	}
	// get weather
	function weather() {
		$.ajax({
			url: 'http://api.openweathermap.org/data/2.5/weather?lat='+ lat +'&lon='+ lng +'&cnt=1',
			type: 'GET',
			// async: false,
			dataType: 'jsonp'
		})
		.done(function(data) {
			weather_data(data);
			// console.log('data: ', data)	;
			// return data;
			
		})
		.fail(function(e) {
			console.log("error: ", e.message);
		});
	}
		
})();