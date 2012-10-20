//requestAnimationFrame polyfill for smart rendering --------------------------
(function() {
	var lastTime = 0;
	var vendors = [ 'ms', 'moz', 'webkit', 'o' ];
	for ( var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
		window.requestAnimationFrame = window[vendors[x]
				+ 'RequestAnimationFrame'];
		window.cancelAnimationFrame = window[vendors[x]
				+ 'CancelAnimationFrame']
				|| window[vendors[x] + 'CancelRequestAnimationFrame'];
	}

	if (!window.requestAnimationFrame)
		window.requestAnimationFrame = function(callback, element) {
			var currTime = new Date().getTime();
			var timeToCall = Math.max(0, 16 - (currTime - lastTime));
			var id = window.setTimeout(function() {
				callback(currTime + timeToCall);
			}, timeToCall);
			lastTime = currTime + timeToCall;
			return id;
		};

	if (!window.cancelAnimationFrame)
		window.cancelAnimationFrame = function(id) {
			clearTimeout(id);
		};
}());
// end requestAnimationFrame ---------------------------------------------------

function RenderingEngine(numTilesX, numTilesY) {
	this.tileWidth = numTilesX;
	this.tileHeight = numTilesY;
	this.lastRender = new Date();
	this.fpsUpdateDelta = 0;
}

function startRenderingEngine() { // initializes draw loop
	draw();
}

function draw() { // main draw loop
	// update state
	var now = new Date();
	var timeDelta = now - rE.lastRender;
	rE.lastRender = now;
	rE.fpsUpdateDelta += timeDelta;
	// draw
	clear();
	drawPlayers();
	// print fps
	if (rE.fpsUpdateDelta >= 500) { // print fps every 500ms
		$("#fps").text("fps: " + Math.floor(1000 / timeDelta));
		rE.fpsUpdateDelta = 0;
	}
	requestAnimationFrame(draw);
}

var drawPlayers = function() {
	for ( var i = 0; i < gameState.players.length; i++)
		drawPlayer(gameState.players[i]);
}

var drawPlayer = function(player) {
	player.canvas.setAttribute('style', 'top: ' + player.x + 'px; left: '
			+ player.y + 'px;');
}

// returns the parameter that scales the game window to fullscreen
var scale = function() {
	var windowWidth = window.innerWidth - 2; // TODO: replace fixed property
	// (2px)
	var windowHeight = window.innerHeight - 2;
	if (windowWidth < windowHeight) {
		return (windowWidth / width > 1) ? windowWidth / width : 1;
	} else {
		return (windowHeight / height > 1) ? windowHeight / height : 1;
	}
}

// returns a scaled value to a corresponding input argument
var _ = function(argument) {
	return argument * scale();
}

var clear = function() {
	c.width = _(width);
	c.height = _(height);
	ctx.fillStyle = '#d0e7f9';
	ctx.beginPath();
	ctx.rect(0, 0, _(width), _(height));
	ctx.closePath();
	ctx.fill();
}

var rE = new RenderingEngine(10, 10);