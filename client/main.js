
Meteor.startup(function() {
	shimRequestAnimationFrame();
	loadSlideShow();
	loadAudio();

	// Set up the current user once the Players collection is ready.
	Meteor.subscribe("allplayers", function() {
		var player = retrieveOrCreatePlayer();

		// Watch for changes to me
		Players.find(Session.get("playerId")).observeChanges({
			changed: function(id, fields){
				if(window.localStorage.presenter) {
					return;
				}

				if(id === player._id) {
					if(fields.gotoSlide !== undefined && fields.gotoSlide !== null) {
						console.info("Changing to slide", fields.gotoSlide);
						slideshow.goto(fields.gotoSlide);
					} else if(fields.gotoItem !== undefined && fields.gotoItem !== null) {
						console.info("Changing to item", fields.gotoItem);
						slideshow.gotoItem(fields.gotoItem);
					}
				}
			}
		});
	});	

	// Watch for changes to others
	Players.find({ lastActive: { $gt: now() - deadAfter } }).observeChanges({
		added:function(id, fields){
			console.log("New Challenger Appears:", id);
			audio.coin.play();
		},
		removed: function(id){
			console.log("Head Shot! Player " + id + " is dead.");
		}
	});

	playerHeartbeat();

	// robbed from http://cssdeck.com/labs/the-matrix
	var canvas = document.createElement("canvas");
	var context = canvas.getContext("2d");
	canvas.width = document.width;
	canvas.height = document.height;
	document.body.appendChild(canvas);

	var s = window.screen;
	var width = canvas.width = s.width;
	var height = canvas.height = s.height;
	var letters = Array(256).join(1).split('');

	var draw = function () {
		canvas.getContext("2d").fillStyle = "rgba(0,0,0,.05)";
		canvas.getContext("2d").fillRect(0,0, width, height);
		canvas.getContext("2d").fillStyle = "#006eff";
		letters.map(function(y_pos, index){
			text = String.fromCharCode(3e4+Math.random()*33);
			x_pos = index * 10;
			canvas.getContext("2d").fillText(text, x_pos, y_pos);
			letters[index] = (y_pos > 758 + Math.random() * 1e4) ? 0 : y_pos + 10;
		});

		// Hahahahahahaha.
		setTimeout(function() {
			requestAnimFrame(draw);
		}, 100);
	};

	requestAnimFrame(draw);
});

function shimRequestAnimationFrame() {
	requestAnimFrame = (function(){
		return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ){
			window.setTimeout(callback, 1000 / 60);
		};
	})();
}

// Meteor scopes all globals to files.
// Some files require globals so load them here.
function loadSlideShow() {
	var loadScript = function(src) {
		var element = document.createElement("script");
		element.src = src;
		document.body.appendChild(element);
	};

	loadScript("slideshow.js");
	loadScript("plugins/css-edit.js");
	loadScript("plugins/css-snippets.js");
	loadScript("plugins/css-controls.js");
	loadScript("plugins/code-highlight.js");
	loadScript("talk.js");
}

function loadAudio(){
	audio = {};
	audio.coin = new buzz.sound( "/audio/coin", { formats: [ "ogg", "mp3" ] }).setVolume(20);
	audio.beat = new buzz.sound( "/audio/beat", { formats: [ "ogg", "mp3" ] });
	buzz.all().load();
}

function retrieveOrCreatePlayer(){
	function createPlayer() {
		var justNow = now();
		var playerId = Players.insert({ created: justNow, lastActive: justNow });
		window.localStorage["playerId"] = playerId;

		return playerId;
	}

	if (Session.get("playerId")){
		// return early as we already know who you are
		return Players.findOne(Session.get("playerId"));
	}

	var playerId = window.localStorage["playerId"];

	// Never seen you before
	if (!playerId){
		playerId = createPlayer();
	} else {
		var player = Players.findOne({_id: playerId});
		// Are you still in the db?
		if (!player){
			console.log("Player not found, db probably got wiped, recreating now.");
			playerId = createPlayer();
		}
	}

	Session.set("playerId", playerId);

	console.log("Your playerId is:", playerId);

	return Players.findOne(playerId);
}

function updateLastActive(){
	var timestamp = now(); // see shared.js
	Players.update(Session.get("playerId"), { $set: { lastActive: timestamp } });
	return timestamp;
}

function playerHeartbeat(){
	if(heartbeatInterval > 0){
		var timestamp = updateLastActive();
		
		audio.beat.setVolume(100).play().fadeOut(3000, function(){
			audio.beat.stop();
		});

		Meteor.setTimeout(function(){ playerHeartbeat(); }, heartbeatInterval); // 

		// console.log("YOU ARE ALIVE!", timestamp);
	} else {
		console.log("YOU ARE DEAD!", now());
	}
}

function stopHeart(){
	oldHeartbeatInterval = heartbeatInterval;
	heartbeatInterval = 0;
}

function startHeart(){
	heartbeatInterval = oldHeartbeatInterval;
	playerHeartbeat();
}

function activePlayers(){
	return Players.find({ lastActive: { $gt: now() - deadAfter } });
}

function allYourSlideAreBelongToUs() {
	var player = retrieveOrCreatePlayer();
	console.log("Requesting all players switch to slide", player.slideNumber);
	Meteor.call("updateAllSlideNumbers", player.slideNumber);
}

function fin(){
	stack().position(30);
}

function finAll(){
	Meteor.call("fin");
	console.log("Launched Fin");
}