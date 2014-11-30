//https://medium.com/web-audio/you-dont-need-that-scriptprocessor-61a836e28b42

var node = context.createBufferSource()
  , buffer = context.createBuffer(1, 4096, context.sampleRate)
  , data = buffer.getChannelData(0);

for (var i = 0; i < 4096; i++) {
 data[i] = Math.random();
}
node.buffer = buffer;
node.loop = true;
node.connect(context.destination);
node.start(0);

function whiteNoise (audioContext) {
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
}