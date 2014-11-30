(function(){
	var hasData = false, ww = null;
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	var audioCtx = new AudioContext();
	// console.log('sampleRate: ', audioCtx.sampleRate);
	// start
	init();

	function init(){
		location();
	}

	function climate(weather_id){
		// either move this inside composer() or make this a method of Composer
		// chooses/sets the appropriate composer depending on the weather code
		// choose modulator stack node
		// faster than switch 
		if(weather_id >= 300 && weather_id < 400){
			//set and create composer settings object here
			console.log('weather id (300s): ', weather_id);
		} else if(weather_id >= 400 && weather_id < 500){
			//set and create composer settings object here
			console.log('weather id (400s): ', weather_id);
		} else if(weather_id >= 500 && weather_id < 600){
			//set and create composer settings object here
			console.log('weather id (500s): ', weather_id);
		}
		// etc...
		// return weather_id;	
	}

// composer as obj? pros/cons
	var Composer = {
		// include method that accepts the weather data to be used throughout the object
		// this might be easier to create the different composer settings
		climate: function(weather_id){
			// weather_id conditionals here
		},
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
			'rain': weather.rain, //Precipitation volume for last 3 hours, mm (object)
			'snow': weather.snow //Snow volume for last 3 hours, mm

			/*
			city : Oakland
			clouds : 90
			humidity : 77
			pressure : 1008
			temp : 288.26
			sunrise : 1417359932
			sunset : 1417395030
			wind_degrees : 140
			wind_speed : 2.6
			weather_code : 701
			rain : undefined
			snow : undefined
			*/
		};
		
		// print data to page for reference
		print_data(wd);

		climate(wd.weather_code);
		
		// encapsulate this into Composer?
		// create a different stack depending on weather_id
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

		whiteNoise(audioCtx, 15);

		osc.start(0);
		osc.stop(10);
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
			cache: false,
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
	//create more of these audio functions to choose from
	function Modulator (type, freq, gain) {
	  this.modulator = audioCtx.createOscillator();
	  this.gain = audioCtx.createGain();
	  this.modulator.type = type;
	  this.modulator.frequency.value = freq;
	  this.gain.gain.value = gain;
	  this.modulator.connect(this.gain);
	  this.modulator.start(0);
	}
	//whiteNoise generator
	function whiteNoise (audioContext, duration) {
		// make this connectable and allow modulation
		var node = audioContext.createBufferSource(),
				buffer = audioContext.createBuffer(1, 4096, audioContext.sampleRate),
				data = buffer.getChannelData(0);

		for (var i = 0; i < 4096; i++) {
			data[i] = Math.random();
		}

		node.buffer = buffer;
		node.loop = true;
		node.connect(audioContext.destination);
		node.start(0);

		//stop for testing only
		if(duration) node.stop(duration);
		
	}

/* Utilities */
	function print_data(data){
		var info = document.createElement('div');
		for(p in data){
			info.innerHTML += p + ' : ' + data[p] + '<br>';
		}
		document.body.appendChild(info);
	}

	/* ios enable sound output */
	window.addEventListener('touchstart', function(){
		//create empty buffer
		var buffer = audioCtx.createBuffer(1, 1, 22050);
		var source = audioCtx.createBufferSource();
		source.buffer = buffer;
		source.connect(audioCtx.destination);
		source.start(0);
	}, false);
		
})();