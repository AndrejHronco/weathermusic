(function(){
	var hasData = false, ww = null;
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioCtx = new AudioContext();

	// start
	init();

	function init(){
		location();
	}

	function climate(weather_id){
		// chooses/sets the appropriate composer depending on the weather code
		// faster than switch 
		if(weather_id >= 300 && weather_id < 400){
			//set and create composer settings object here
		} else if(weather_id >= 400 && weather_id < 500){
			//set and create composer settings object here
		} else if(weather_id >= 500 && weather_id < 600){
			//set and create composer settings object here
		}
		
		
	}

// composer as obj? pros/cons
	var Composer = {
		// include method that accepts the weather data to be used throughout the object
	};


	function composer(weather){

		var wd = {
			'city': weather.name,
			'clouds': weather.clouds.all, // %
			'humidity': weather.main.humidity, // %
			'pressure': weather.main.pressure, // hPa
			'temp': weather.main.temp, //Kelvin (subtract 273.15 to convert to Celsius)
			'sunrise': weather.sys.sunrise, //unix, UTC
			'sunset': weather.sys.sunset, //unix, UTC
			'wind_degrees': weather.wind.deg, // degrees (meteorological)
			'wind_speed': weather.wind.speed, //mph
			'weather_code': weather.weather[0].id,
			'rain': weather.rain, //Precipitation volume for last 3 hours, mm
			'snow': weather.snow //Snow volume for last 3 hours, mm

			/*
			city : San Francisco
			clouds : 1
			humidity : 77
			pressure : 1027
			temp : 289.95
			sunrise : 1417014120
			sunset : 1417049537
			wind_degrees : 58.0004
			wind_speed : 1.86
			weather_code : 721
			rain : undefined
			snow : undefined
			*/
		};
		
		// print data to page for reference
		print_data(wd);

		
		//encapsulate this into Composer
		// Make a stack of modulator
		var modulatorStackNode = [
		    new Modulator("sawtooth", 1 * wd.clouds, 100*Math.random()),
		    new Modulator("square", 0.1 * wd.humidity, 200*Math.random()),
		    new Modulator("sine", wd.pressure, 100*Math.random()),
		    new Modulator("square", 0.1 * wd.temp, 200*Math.random()),
		    new Modulator("sine", 0.1 * wd.wind_degrees, 100*Math.random())
		].reduce(function (input, output) {
		    input.gain.connect(output.modulator.frequency);
		    return output;
		});

		// Make an oscillator, connect the modulator stack, play it!
		var osc = audioCtx.createOscillator();
		osc.type = "sine";
		osc.frequency.value = wd.temp;
		modulatorStackNode.gain.connect(osc.frequency);

		var filter = audioCtx.createBiquadFilter();
		filter.frequency.value = wd.pressure;
		filter.Q.value = 10;
		osc.connect(filter);
		filter.connect(audioCtx.destination);

		// osc.start(0);
	}

	//get user location
	function location(){
		var lat, lng;
		if ("geolocation" in navigator) {
			
			function geoSuccess(position){
				lat = position.coords.latitude;
				lng = position.coords.longitude;
				weather(lat, lng);
			}
			function geoError(error){
				console.log('Geolocation error:', error.code, error.message);
			}
			// get geolcation
			navigator.geolocation.getCurrentPosition(geoSuccess, geoError);

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
				weather(lat, lng);
			})
			.fail(function(e) {
				console.log("error: ", e.message);
			});
			
		}
	}
	// get weather
	function weather(latitude, longitude) {
		$.ajax({
			url: 'http://api.openweathermap.org/data/2.5/weather?lat='+ latitude +'&lon='+ longitude +'&cnt=1',
			type: 'GET',
			// async: false,
			dataType: 'jsonp'
		})
		.done(function(data) {
			// send data to Composer
			composer(data);
		})
		.fail(function(e) {
			console.log("error: ", e.message);
		});
	}

/*
	function weathers(latitude, longitude) {
	    var wd;
	    $.get('http://api.openweathermap.org/data/2.5/weather?lat='+ latitude +'&lon='+ longitude +'&cnt=1', function(data){
	        wd = data;
	    });
	    return wd;
	}
*/

/* Audio Functions */
	function Modulator (type, freq, gain) {
	  this.modulator = audioCtx.createOscillator();
	  this.gain = audioCtx.createGain();
	  this.modulator.type = type;
	  this.modulator.frequency.value = freq;
	  this.gain.gain.value = gain;
	  this.modulator.connect(this.gain);
	  this.modulator.start(0);
	}

/* Utilities */
	function print_data(data){
		var info = document.createElement('div');
		for(p in data){
			info.innerHTML += p + ' : ' + data[p] + '<br>';
		}
		document.body.appendChild(info);
	}
		
})();