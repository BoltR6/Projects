p5.disableFriendlyErrors = true;
var socket = io();
var servertick = 1;
var players = [];
var teamlist = ["Red", "Blue"];
var teamscores = [0, 0];
var playername = "a named player!";

//temporary_db.set("test","hello")
//socket.emit('log',{log:temporary_db.get("test")})

//Data that wil be fetched and updated via database and will stay session-to-session
var client_data = {
	xp: 0, //Current xp player has, resets after each level
	level: 0, //Level, required for purchasing certain items
	free_currency: 0, //Free currency?
	paid_currency: 0, //Paid/harder to obtain currency?
	account_name: 0, //Name selected at account creation
	account_index: 0, //I don't know how databases work but it's probably an index
	owned_weapons: { //What weapons the player actually owns, and can use for loadout
		GLOCK18C: true,
		UMP45: true,
		M39: false,
	}
};

var clientver = "1.84";
var debug = false;
/*

Stupid things we had to do since we had no render engine:

1. Player outline strokes need to be manually adjusted based on distance
2. Render based on the minimap

*/



var server_kills = [];
var player_notifications = [];
var esp = debug; //esp for all players
var lockspawns = debug; //all players spawn in the same spot
var death_info = true;
socket.on('STCkill', function(data) {
	server_kills.push([data.chat_msg, 255, data.team]);
	//logging.push(data.chat_msg+":"+socket.id+":"+server_kills.length)
});
socket.on('STCgivePlayers', function(data) {
	players = data.playerList;
	players.forEach((player, ind) => {
		if (player.id === socket.id) {
			hp = player.hp;
			death_info = player.recieved_death_message;
			if (!death_info && team !== undefined) {
				//socket.emit('log',{log:'client knows they dead as hell 1'});
				var respawn = getRespawn(team);
				x = respawn[0];
				y = respawn[1];
				socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords, hp, true] });
				death_info = true;
				//socket.emit('log',{log:'client knows they dead as hell 2'});
			}
		}
	});
	if (team === undefined) {
		players.forEach((player, ind) => {
			if (player.id === socket.id) {
				if (player.hp < hp) {
					lastDamage = healthComeback;
				}
				hp = player.hp;
				team = player.team;
				if (!lockspawns) {
					var firstspawn = getRespawn(team);
					x = firstspawn[0];
					y = firstspawn[1];
				} else {
					x = 150;
					y = 150;
				}
				playername = "Player-" + (ind + 1);
			}
		});
	}
});
socket.on('STCscore', function(data) {
	teamscores[0] = data.score[0];
	teamscores[1] = data.score[1];
});
socket.on('STCgivever', function(data) {
	if (data.ver !== clientver) {
		logging.push(("		Player With Ver " + clientver + " Updated"));
		location.reload();
	}
});


/**   ----OPTIMIZATIONS----
 * Using Math.cos is faster than cos
 * Caching Colors is faster than lookup
 * Friendly Errors tanks fps
 * 
 */
// ----SETTINGS----

//Global ScopeY
var capDelta = 30;        //Caps max fps speed adjustment. Default: 30
var targetFPS = 60;       //JS attempts to match this FPS. Default: 60
var globalTickSpeed = 20; //Universally scales any speeds. Default: 20

//Character
var charPubSet = {
	xsensitivity: 0.002,//X of mouse multiplier. Default: 0.005
	ysensitivity: 0.011,//Y of mouse multiplier. Default: 0.01
	toggleADS: false,//Toggle/Hold ADS
};
var walkSpeed = 1; 			   //Walk speed. Default: 0.5
var strafeSpeed = 1;
var sprintSpeed = 2; 			 //Run speed. Default: 2
var playertop = 5;				 //Character Height
var playerhitboxradius = 5;//Player Hitbox Size
var bspeedmulti = 6;     //Bullet Speed
var healthComeback = 400;

//Window and Hud
var winlength = window.innerWidth; //Length of canvas.
var winheight = window.innerHeight;//Height of canvas.
var cursorsize = 45; 		 //Crosshair scale. Default: 45
var cursorthickness = 2; //Thickness of crosshair. Default: 2
var minimapscale = 0.75; //Minimap scale. Default: 0.75
var mapOverride = 3;    //Manually select a map. Default: -1
var useTestMaps = false; //Use test maps. Default: false
var hudscale = 1.40;     //Scales hud. Default: 1.40
var chatCharLimit = 50 //Max number of chars in a chat message. Default: 35
var hitmarker_size = 7.5;//Size of hitmarker
var hitmarker_thickness = 0.25;//Thickness of hitmarker
var hitmarker_fade_time = 4;//Time it takes for hitmarker to fade
var killfeed_size = 1.0; //Size of killfeed
var msg_decay_time = 2;  //Decay time of killfeed
//nun
//Rendering
var raycastclose = 150;	    //Radius of proximity render. Default: 150
var coneFOV = 1.05;         //FOV of render cone //Default: 1.05
var coneDist = 500;         //Render distance of cone //Default: 500
var enableLighting = false; //Ingame lighting. Default: false
var enableTextures = true;  //Texture loading. Default: false
var renderdistance = 500;   //Engine Render Limit. Default: 600

//Collisions
var hitboxRadius = 10; //hitbox radius
var pushback = 3.5;    //How much the box pushes you back
var bullet_offset = 10; //How far away from your face bullets start

//Camera
var fov = 1.2; //Some value that fukin works. No clue what the hell it does. Default: 1.2
var zoom = 1;  //Overall zoom level
var zoomADS = 0.85; //How much does ADS make a diff. Lower = more zoom for some fucking reason. Default: 0.95
var zoomSpeed = 1.5; //How fast you are zoomed in with ADS
var reloadExaggeration = 600; //How far down the gun goes when reloaded
var recoilFudgeMultiplier = 1; //How much to add to the (per-weapon) recoil fudge. 0 can be used for completely unchanged recoil. Default: 1
var recoilModifier = 1; //Change the overall recoil. This is multiplied by 1 or 0.5 depending on whether or not you are crouching. Default: 1
var recoilCrouchImpact = 0.6; //What the recoil multiplier is set to when crouching.


//Fun
var noseDance;

// ----PLACEHOLDER VARIABLES----
var page = "menu";
var font_cache = [];
var swapTo = null;
var swapping = 0;
var boxes = [];
var gunModels = [];
var bulletremains = [];
var logging = [];
var gmap = getMap(mapOverride, useTestMaps)
var gmaplen = gmap.length;
var x = 60; //x position on minimap
var y = 60; //y position on minimap
var r = 0;     //rotation on minimap (radians)
var u = 0;     //up/down radians
var hp = 100;    //health
var team;
var w = {      //player equipped weapon
	//Temporary
	max: 30,
	rofon: 0,
	reloadon: 0,
	recoilon: 0,
	reloading: false,
	weaponon: 0,
	ammo: [30, 15],
	weapons: ["UMP-45", "GLOCK-18C"],
	damage: 15,

	//Weapon-assigned
	rof: null,
	reload: null,
	recoil: null,
	fudge: null,
	name: null,
	modelno: null,
};
var coloring;
var zoommulti = 1;
var cheight = 10;
var deathfade = 0;
var cameraP;//placeholder
var cameraZ;//placeholder
var textures = []; //placeholder
var boxwidth = winlength / gmaplen; //determines size of minimap
var conversionRadio = 40 / boxwidth; //determines size of boxes. Scales based on box width
var minimap; //vars used later for graphics
var display;
var weaponOverlay;
var gunOverlay;
var tmOverlay;
var scoreOverlay;
var portal1;
var portal1coords = [0, 0, "NONE"];
var portal2;
var portal2coords = [0, 0, "NONE"];
var p1view = false;
var p2view = false;
var hitmarker_fade = 255;

var keys = []; //stores keys CURRENTLY pressed
var clicks = [];
var clicked = [];
var bullets = [];
var visual_bullets = [];
var ball_trail = [];
var fpscounter = 0;
var fps;
var lastsecond;
var localdate = new Date();
var setupcount = 0;
var charunderhalf = false;
var rendermap = [];
var removerender = [];
var objcount = 0;
var loopcount = 0;
var rays = [];
var localtick = new Date();
var buttons = [0, 0, 0, 0];
var localDelta;
var mincrouch = 15;
var maxcrouch = 20;
var page_swap_fade = 0;
var truerenderdistance = 500;
var targetXIncrease = 0;
var targetYIncrease = 0;
var recoilto = [];
var isADS = false;
var last_fired = 0;
var gunback = 0;
var updaterecoil = false;
var menu_box = {
	x: 0,
	y: 0,
	s_x: 0,
	s_y: 0,
	direction: "LEFT"
}
var recoilCrouchAdjust = 1;
var lastDamage = 0;
var closed_attempted_reload = false;
var userid = 0 //This is assigned by the server, and is based on your account

//Begin Camera Settings

//Player Camera

var screenStretchX = 0.015; //Same with these. Don't touch them.
var screenStretchY = 0.015;
var camStretch = 12.5;
var cambox = [screenStretchX * (fov * -1), screenStretchX * fov, screenStretchY * (fov * -1), screenStretchY * fov]; //This clusterfuck

//Portal Camera(s)

var pdim = {
	resolution_x: winheight / 2,
	resolution_y: winlength / 2,
	physical_x: 15,
	physical_y: 40,
	tint: false,
	height: 20,
	vertadj: 0,
	distRend: 2,
	minimap: false,
	fov: 1.5,
	portal_recharge: 50,
	min_place_distance: 19.5,
	inner_hitbox: 5,
	outer_hitbox: 0,
	teleport_dist: 8,
}

var resMultiplier = 1

var pcambox = [screenStretchX * (pdim.fov * -1), screenStretchX * pdim.fov, screenStretchY * (pdim.fov * -1), screenStretchY * pdim.fov + 0.01]; //Custerfuck 2.0

//End Camera Settings

var isCrouching = false;
var isTyping = false;
var lockMovement = false;
var settingName = false; //temporary
var chatCache = "";
var liveChat = [];
var spawnable = [[], []];
var isShifting = false;
var messageDisplayLimit = winheight / 60;
var showCursor = false;
var nameCache = ""
var showFeedbackInput = false
var feedbackCache = ""


/* Variable, Key, and Rendering Update Functions */
function keyPressed() {
	keys[keyCode] = true;

	if (page == "primary") { 
	if (keys[16]) {
		isShifting = true
	}

	//Entering/Exiting chat mode

	if (keys[13] == true) { //Enter
		/*
		
		*/
		if (isTyping === true && settingName === false && showFeedbackInput === false) {
			if (chatCache != "") {
				isTyping = lockMovement = false
				socket.emit('CTSchat', { team: team, player: playername, msg: chatCache, id: socket.id })
				liveChat.push([playername, chatCache, socket.id]) //store message
				chatCache = ""
			}
			else {
				isTyping = lockMovement = false
			}
			if (liveChat.length > messageDisplayLimit) {
				liveChat.shift() //remove first element
			}
		} else if (isTyping == false && settingName === false && showFeedbackInput === false) {
			isTyping = lockMovement = true
		} else if (settingName === true) {
			if (nameCache != "") {
				settingName = lockMovement = false
				playername = nameCache.substring(1)
				nameCache = ""
			}
		} else if (showFeedbackInput) {
			if (feedbackCache == "") {
				showFeedbackInput = lockMovement = false
			}
		}
	}

	if (keys[221] == true) { //Right bracket
		if (!lockMovement) {
			lockMovement = settingName = true
		}
	}

	if (keys[80]) {
		if (!lockMovement) {
			lockMovement = showFeedbackInput = true
		}
	}

	if (keys[13] == false) { //if not pressing enter

		if (isTyping && keys[8]) { //Backspace
			chatCache = chatCache.substring(0, chatCache.length - 1)

		} else if (isTyping && (chatCache.length < chatCharLimit) && key != "Shift") { //Normal char entering
			chatCache += key
		} else if (settingName && (nameCache.length < 15) && key != "Shift") { //name char entering
			nameCache += key
		}
	}
	if (keys[18]) { //Left alt to exit anything without sending
		isTyping = lockMovement = false
		chatCache = nameCache = ""

	}
}
	//The following lines have been commented because they don't seem to do anything, but I remember them being important so I don't wnat to remove them

	// if (chatCache.substring(chatCache.length - 1, chatCache.length) == String.fromCharCode(16)) { //i dont honestly know what this does
	// 	chatCache = chatCache.substring(0, chatCache.length - 1)
	// }
};
function keyReleased() {
	keys[keyCode] = false;
	if (!keys[16]) {
		isShifting = false
	}
};
function mousePressed() {
	clicks[mouseButton] = true;
	clicked[mouseButton] = true;
	if (mouseButton === RIGHT && !charPubSet.toggleADS) {
		isADS = true;
	}
};
function mouseReleased() {
	clicks[mouseButton] = false;
	if (mouseButton === RIGHT && !charPubSet.toggleADS) {
		isADS = false
	} else if (mouseButton === RIGHT && charPubSet.toggleADS) {
		isADS = !isADS;
	}
};
function getRespawn(what_team) {
	var random_index = round(Math.random() * spawnable[what_team].length);//Gets a random index form the spawnable coordinate array
	var random_index_x = spawnable[what_team][random_index][0];//Gets the X of that spawnable
	var random_index_y = spawnable[what_team][random_index][1];//Gets the Y of that spawnable

	var converted_x = (random_index_x) * 40 + 20;//Takes the X and converts it to ingame units
	var converted_y = (random_index_y) * 40 + 20;//Takes the Y and coverts it to ingame units
	return [converted_x, converted_y];//Returns the coordinates in an array
}
function updateKeys() {

	if (isCrouching) {
		var speedMult = 0.5
	} else {
		var speedMult = 1
	}
	//Why is it 67.5 and not 90? i have no fucking clue.
	var didUpdate = false;
	if (lockMovement === false) { //if the player is NOT typing

		if (keys[49] === true) { // GUN SWAPPING
			swapTo = 0;
			swapping = 100;
		} else if (keys[50] === true) {
			swapTo = 1;
			swapping = 100;
		}
		if (keys[65] === true) { //walk left
			x -= (Math.cos(r - 67.5) * strafeSpeed) * (localDelta / globalTickSpeed) * speedMult;
			y -= (Math.sin(r - 67.5) * strafeSpeed) * (localDelta / globalTickSpeed) * speedMult;
			didUpdate = true;
		}
		if (keys[68] === true) { //walk right
			x += (Math.cos(r - 67.5) * strafeSpeed) * (localDelta / globalTickSpeed) * speedMult;
			y += (Math.sin(r - 67.5) * strafeSpeed) * (localDelta / globalTickSpeed) * speedMult;
			didUpdate = true;
		}
		if (keys[83] === true) { //Walk backwards i think
			x -= (Math.cos(r) * walkSpeed) * (localDelta / globalTickSpeed) * speedMult;
			y -= (Math.sin(r) * walkSpeed) * (localDelta / globalTickSpeed) * speedMult;
			didUpdate = true;
		}
		if (keys[87] === true && keys[16] === true && !w.reloading) { //sprinting
			x += (Math.cos(r) * sprintSpeed) * (localDelta / globalTickSpeed) * speedMult;
			y += (Math.sin(r) * sprintSpeed) * (localDelta / globalTickSpeed) * speedMult;
			didUpdate = true;
		} else if (keys[87] === true) { //normal walking
			x += (Math.cos(r) * walkSpeed) * (localDelta / globalTickSpeed) * speedMult;
			y += (Math.sin(r) * walkSpeed) * (localDelta / globalTickSpeed) * speedMult;
			didUpdate = true;
		}

	}
	r += movedX * charPubSet.xsensitivity;
	u += -movedY * charPubSet.ysensitivity / 5;
	if (movedX * charPubSet.xsensitivity !== 0 || -movedY * charPubSet.ysensitivity / 5 !== 0) {
		didUpdate = true;
	}
	if (!lockMovement) {
		if (keys[67]) { //crouching
			if (cheight > mincrouch) {
				cheight -= 2 * (localDelta / globalTickSpeed);
				recoilCrouchAdjust = recoilCrouchImpact;
				isCrouching = true
			}
			didUpdate = true;
		} else { //undo crouch
			if (cheight < maxcrouch) {
				cheight += 2 * (localDelta / globalTickSpeed);
				recoilCrouchAdjust = 1
				didUpdate = true;
				isCrouching = false
			}
		}
	}
	if (mouseIsPressed) {
		requestPointerLock();
	}
	if (keys[82] && w.ammo[w.weaponon] < w.max && !lockMovement) {
		w.reloading = true;
		w.recoilon = 0;
	}
	if (!clicks[LEFT] && !lockMovement) {
		w.recoilon = 0;
		w.recoil = generateRecoil(w.name, w.fudge);
	}
	u = constrain(u, -5, 5);


	if (didUpdate) { //this only sends updates on positional data to the server when the player moves. This prevents us from constantly spamming the server with the exact same data when stanting still.
		socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords, hp, death_info] })
	}
};
function updatePortalView() {
	//Calculate the slope of the lines making up the view cone
	var slope1 = ((y + Math.sin(r - coneFOV) * 250) - y) / ((x + Math.cos(r - coneFOV) * 250) - x);
	var slope2 = ((y + Math.sin(r + coneFOV) * 250) - y) / ((x + Math.cos(r + coneFOV) * 250) - x);

	//Calculate whether it's inbetween slope1 and slope2, then calculate the distance, does all this for both portals
	var check1 = {
		s1: incheck(slope1, x + Math.cos(r) * 15, y + Math.sin(r) * 15, portal1coords[0], portal1coords[1], false),
		s2: incheck(slope2, x + Math.cos(r) * 15, y + Math.sin(r) * 15, portal1coords[0], portal1coords[1], false),
		d: (dist(x, y, portal1coords[0], portal1coords[1]) < coneDist)
	}
	var check2 = {
		s1: incheck(slope1, x + Math.cos(r) * 15, y + Math.sin(r) * 15, portal2coords[0], portal2coords[1], false),
		s2: incheck(slope2, x + Math.cos(r) * 15, y + Math.sin(r) * 15, portal2coords[0], portal2coords[1], false),
		d: (dist(x, y, portal2coords[0], portal2coords[1]) < coneDist)
	}

	//Update the global variable of whether or not to render each respective portal
	p1view = (check1.s1 && check1.s2 && check1.d);
	p2view = (check2.s1 && check2.s2 && check2.d);
};
function updateFPS() {
	var localdate = new Date();
	fpscounter++;
	if (lastsecond !== round(localdate.getSeconds())) {
		fps = fpscounter;
		fpscounter = 0;
		lastsecond = round(localdate.getSeconds());
	}
};
function updateRender() {
	for (var j = 0; j < removerender.length; j++) {//Optimized
		rendermap[removerender[j][0]][removerender[j][1]] = false;
		removerender.splice(j, 1);
	}
};
function updateCone() {
	/**
	 * These slopes are essentially a mathematical equation of finding the slopes of the two exterior lines of the cone
	 * The if statement is running those slopes through a system of equations to check if it's between the two slopes
	 * 'rendermap' is an array that holds all objects that ARE to be rendered permanantly
	 * 'removerender' is an array that deletes any listed object at the end of the draw time
	 **/
	var slope1 = ((y + Math.sin(r - coneFOV) * 250) - y) / ((x + Math.cos(r - coneFOV) * 250) - x);
	var slope2 = ((y + Math.sin(r + coneFOV) * 250) - y) / ((x + Math.cos(r + coneFOV) * 250) - x);

	for (var i = 0; i < boxes.length; i++) {
		if (incheck(slope1, x + Math.cos(r) * 15, y + Math.sin(r) * 15, boxes[i][0], boxes[i][1], false) && incheck(slope2, x + Math.cos(r) * 15, y + Math.sin(r) * 15, boxes[i][0], boxes[i][1], false) && dist(x, y, boxes[i][0], boxes[i][1]) < coneDist) {
			rendermap[boxes[i][1] / 40][boxes[i][0] / 40] = true;
			removerender.push([[boxes[i][1] / 40], [boxes[i][0] / 40]]);
		}
	}
}
function finalizeKeys() {
	if (!charunderhalf) {
		keys[67] = keyIsDown(67); //update c key
	}
	clicked = [];
};
function changeWeapon(name, cammo) {
	if (!w.reloading) {
		swappingTo = getWeapon(name);
		if (cammo) {
			w.ammo[w.weaponon] = swappingTo.ammo;
		}

		w.max = swappingTo.max;
		w.recoil = swappingTo.recoil;
		w.name = swappingTo.name;
		w.reload = swappingTo.reload;
		w.rof = swappingTo.rof;
		w.modelno = swappingTo.modelno;
		w.fudge = swappingTo.fudge;
		w.semiauto = swappingTo.semiauto;
		w.modelscale = swappingTo.modelscale;
		w.damage = swappingTo.damage;
		w.x = swappingTo.modeloffset[0];
		w.y = swappingTo.modeloffset[1];
		w.z = swappingTo.modeloffset[2];

		w.rx = swappingTo.modelrotate[0];
		w.ry = swappingTo.modelrotate[1];
		w.rz = swappingTo.modelrotate[2];
	}
};




function updateShooting() {
	//If you have ammo and rate of fire's ready; and you aren't typing, reloading, or swapping
	if (!lockMovement && w.ammo[w.weaponon] > 0 && w.rofon >= 0 && !w.reloading && swapping <= 0) {
		if (clicks[LEFT] && !w.semiauto) {//If left click is held and not semi auto
			socket.emit('CTSfireBullet', { firingPlayer: socket.id });//Tell server you've shot
			bullets.push([x, cheight, y, bullet_offset, r, u, 5, team]);
			w.ammo[w.weaponon]--;//Create a bullet instance
			if (w.recoilon === w.recoil.length - 1) {
				w.recoilon = w.recoil.length - 1;//Cap recoil at final
			}
			recoilto.push([(w.recoil[w.recoilon][0] * (recoilModifier / 100)) * recoilCrouchAdjust, (w.recoil[w.recoilon][1] * (recoilModifier / 100)) * recoilCrouchAdjust, 3, 3]);//Tell player they have recoil to deal with
			if (w.recoilon < w.recoil.length - 1) {
				w.recoilon++;//Progress the recoil
			}
			w.rofon = -w.rof;//Set back the rate of fire
			gunback = 15;//Animate the weapon
			updaterecoil = true;//Remind the player they have to recoil
			socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords, hp, death_info] });//Update the player server-side
		}
		if (clicked[LEFT] && w.semiauto) {//If left click is clicked and is semi auto
			socket.emit('CTSfireBullet', { firingPlayer: socket.id });//Tell server you've shot
			bullets.push([x, cheight, y, bullet_offset, r, u, 5, team]);
			w.ammo[w.weaponon]--;//Create a bullet instance
			if (w.recoilon === w.recoil.length - 1) {
				w.recoilon = w.recoil.length - 1;//Cap recoil at final
			}
			recoilto.push([(w.recoil[w.recoilon][0] * (recoilModifier / 100)) * recoilCrouchAdjust, (w.recoil[w.recoilon][1] * (recoilModifier / 100)) * recoilCrouchAdjust, 3, 3]);//Tell player they have recoil to deal with
			if (w.recoilon < w.recoil.length - 1) {
				w.recoilon++;//Progress the recoil
			}
			w.rofon = -w.rof;//Set back the rate of fire
			gunback = 15;//Animate the weapon
			updaterecoil = true;//Remind the player they have to recoil
			socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords, hp, death_info] });//Update the player server-side
		}
	}
};





function updateHealth() {
	deathfade = constrain(deathfade - (1 * (deltaTime / globalTickSpeed)), 0, Infinity);
	/**
	if (hp < 1) {
		var respawn = getRespawn(team);
		var otherteam;
		if (team === 0) {
			otherteam = 1;
		} else {
			otherteam = 0;
		}
		x = respawn[0];
		y = respawn[1];
		hp = 100;
		deathfade = 100;
		socket.emit('CTSkill', { team: otherteam });
		socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords] })
		socket.emit('CTSgetPlayers');
	}
	**/
}




function updateWeaponStats() {
	w.rofon += deltaTime / globalTickSpeed;
	if (w.reloading) {
		w.reloadon += (deltaTime / globalTickSpeed) / 5;
	}
	if (w.reloadon >= w.reload) {
		w.reloadon = 0;
		w.reloading = false;
		w.ammo[w.weaponon] = w.max;
	}
	for (var i = 0; i < recoilto.length; i++) {//Optimized
		r += recoilto[i][0] / recoilto[i][2];
		u += recoilto[i][1] / recoilto[i][2];
		recoilto[i][3] -= 1;
		if (recoilto[i][3] < 1) {
			recoilto.splice(i, 1);
		}
	}
	if (isADS && zoommulti > zoomADS) {
		zoommulti -= (0.01 * zoomSpeed) * deltaTime / globalTickSpeed;
	} else if (!isADS && zoommulti < 1) {
		zoommulti += (0.02 * zoomSpeed) * deltaTime / globalTickSpeed;
	}
};




function incheck(slope, refx, refy, inx, iny, flip, custom, cusx, cusy) {
	var locax = x;
	var locay = y;
	if (custom) {
		locax = cusx;
		locay = cusy;
	}
	if (!flip) {
		if (refy > slope * (refx - locax) + locay) {
			if (iny > slope * (inx - locax) + locay) {
				return true;
			}
		} else {
			if (iny < slope * (inx - locax) + locay) {
				return true;
			}
		}
	} else {
		if (refy > slope * (refx - locax) + locay) {
			if (iny < slope * (inx - locax) + locay) {
				return true;
			}
		} else {
			if (iny > slope * (inx - locax) + locay) {
				return true;
			}
		}
	}
	return false;
}
function updateSwapPortalAndInfo() {
	portal1.background(100, 100, 255);
	portal2.background(100, 100, 255);
	last_fired -= deltaTime / globalTickSpeed;
	socket.emit('CTSgetPlayers');
	socket.emit('CTSaskscore');
	hitmarker_fade -= hitmarker_fade_time * (deltaTime / globalTickSpeed);
	if (frameCount % 100 || frameCount < 1) {
		socket.emit('CTSgetver');
	}

	textFont(font_cache[0])
	if (swapping > 0) {
		swapping = constrain(swapping - (deltaTime * globalTickSpeed) * 0.01, 0, Infinity)
	}
	if (swapping > 15 && swapping < 50) {
		changeWeapon(w.weapons[swapTo]);
		w.weaponon = swapTo;
	}
	localDelta = constrain(deltaTime, 0, capDelta);
	objcount = 0;
	loopcount = 0;
}


/* Graphical Functions */
function renderScore() {
	var scoreSize = 100;
	var scoreWidth = 30;
	scoreOverlay.noStroke();

	scoreOverlay.fill(255, 100, 100);
	scoreOverlay.quad(0, 0, 50 - scoreWidth, 25, 50, 25, 50, 0);
	scoreOverlay.fill(100, 100, 255);
	scoreOverlay.quad(50, 0, 50, 25, 50 + scoreWidth, 25, 100, 0);

	switch (team) {
		case 0:
			scoreOverlay.stroke(215, 0, 0);
			break;
		case 1:
			scoreOverlay.stroke(0, 0, 215);
			break;
		default:
			scoreOverlay.stroke(0, 0, 0);
	}
	scoreOverlay.strokeWeight(5);
	scoreOverlay.strokeJoin(ROUND);
	scoreOverlay.noFill();
	scoreOverlay.beginShape();
	scoreOverlay.vertex(-5, -5);
	scoreOverlay.vertex(50 - scoreWidth, 25)
	scoreOverlay.vertex(50 + scoreWidth, 25);
	scoreOverlay.vertex(105, -5);
	scoreOverlay.endShape();

	scoreOverlay.fill(0, 0, 0);
	scoreOverlay.textSize(17.5);
	scoreOverlay.textAlign(CENTER);
	scoreOverlay.strokeWeight(1);
	scoreOverlay.text(teamscores[0], 32.5, 16.5);
	scoreOverlay.text(teamscores[1], 100 - 32.5, 16.5);
}
function renderESP() {
	tmOverlay.cameraZ = (height / 2.0) / tan(fov / 2.0);
	tmOverlay.camera(x, cheight, y, x + Math.cos(r), cheight + u, y + Math.sin(r), 0, 1, 0);
	tmOverlay.perspective(fov, float(width) / float(height), cameraZ / 10.0, cameraZ * 10.0);
	tmOverlay.frustum(cambox[0], cambox[1], cambox[2], cambox[3], 0.02, renderdistance);
	for (var i = 0; i < players.length; i++) {//Optimized
		if (players[i].id !== socket.id && (players[i].team === team || esp)) {
			var overall_opacity = 255;
			switch (players[i].team) {
				case 0:
					tmOverlay.fill(255, 0, 0, overall_opacity);
					tmOverlay.stroke(255, 0, 0, overall_opacity);
					break;
				case 1:
					tmOverlay.fill(0, 0, 255, overall_opacity);
					tmOverlay.stroke(0, 0, 255, overall_opacity);
					break;
			}
			tmOverlay.push();
			tmOverlay.translate(players[i].x, players[i].h + 15, players[i].y);
			tmOverlay.rotateY(r * -1 + 90);
			tmOverlay.rotateZ(Math.PI);
			tmOverlay.strokeWeight(2);
			tmOverlay.textAlign(CENTER);
			tmOverlay.textFont(font_cache[0]);
			tmOverlay.textSize(7.5 * constrain((200 / dist(players[i].x, players[i].y, x, y)), 0, 1));
			tmOverlay.text(players[i].name, 0, 0);
			tmOverlay.pop();

			tmOverlay.push();
			var playerheight = players[i].h + playertop;
			tmOverlay.translate(players[i].x, playerheight / 2, players[i].y);
			tmOverlay.rotateY(players[i].r * -1);
			tmOverlay.strokeWeight(1.5 * (90 / dist(players[i].x, players[i].y, x, y) - 0.25));
			tmOverlay.noFill();
			tmOverlay.box(5, playerheight, 5)
			tmOverlay.pop();
		}
	}
}
function renderWeaponAndImpacts() {
	for (var i = 0; i < bulletremains.length; i++) {//Very optimized
		bulletremains[i][3] -= 5;
		display.push();
		display.translate(bulletremains[i][0], bulletremains[i][2], bulletremains[i][1])
		display.fill(100, bulletremains[i][3]);
		display.noStroke();
		display.box(6.5);
		display.pop();
		if (bulletremains[i][3] < 0) {
			bulletremains.splice(i, 1);
		}
	}

	var reloadY = (reloadExaggeration / 2) - Math.abs((reloadExaggeration / 2) - (w.reloadon / w.reload) * reloadExaggeration);
	var swapY = 750 - Math.abs(swapping - 50) * 15;
	gunback = constrain(gunback - 2 * (deltaTime / globalTickSpeed), 0, Infinity);
	gunOverlay.push();
	gunOverlay.translate(w.x + gunback / 2, w.y + reloadY + swapY, w.z + gunback);
	gunOverlay.rotateX(w.rx * Math.PI);
	gunOverlay.rotateY(w.ry * Math.PI);
	gunOverlay.rotateZ(w.rz * Math.PI);
	gunOverlay.pointLight(color(255), 50 + Math.cos(r) * 15, -50, 50 - Math.cos(r) * 15);
	gunOverlay.fill(255);
	gunOverlay.noStroke();
	gunOverlay.scale(-70 * w.modelscale, 70 * w.modelscale, 85 * w.modelscale);
	gunOverlay.specularMaterial(250);
	gunOverlay.shininess(50);
	gunOverlay.model(gunModels[w.modelno]);
	gunOverlay.pop();
}


function renderWorldAndPlayers() {
	for (var i = 0; i < players.length; i++) { //RENDERING OTHER PLAYERS
		if (players[i].id !== socket.id && players[i].name != "¤") {
			// var rotation = atan2(mouseY-players[i].y,mouseX-players[i].x); //useless calculation

			var calculate_stroke = constrain(5 - Math.floor(dist(players[i].x, players[i].y, x, y)) / 50, 0, 3);

			display.push();
			var playerheight = players[i].h + playertop;
			display.translate(players[i].x, playerheight / 2, players[i].y);
			display.rotateY(players[i].r * -1);
			display.strokeWeight(calculate_stroke);
			switch (players[i].team) {
				case 0:
					display.fill(255, 0, 0);
					break;
				case 1:
					display.fill(0, 0, 255);
					break;
			}
			display.box(5, playerheight, 5)

			display.pop();

			display.push();
			display.translate(players[i].x, players[i].h, players[i].y)
			display.rotateY(players[i].r * -1);
			display.rotateZ(players[i].u)
			display.strokeWeight(calculate_stroke); //HERE YOU FUCKER

			display.push();
			display.translate(2.5, 0, 0);
			display.box(5, 1, 1);
			display.pop();

			display.pop();

		}
		if (!(players[i].id === socket.id && dist(x, y, portal2coords[0], portal2coords[1]) < 12.5) && players[i].name !== "¤") {
			portal1.push();
			var playerheight = players[i].h + playertop;
			portal1.translate(players[i].x, playerheight / 2, players[i].y);
			portal1.rotateY(players[i].r * -1);
			portal1.strokeWeight(constrain(5 - Math.floor(dist(players[i].x, players[i].y, x, y)) / 50, 0, 3));
			switch (players[i].team) {
				case 0:
					portal1.fill(255, 0, 0);
					break;
				case 1:
					portal1.fill(0, 0, 255);
					break;
			}
			portal1.box(5, playerheight, 5)
			portal1.pop();

			portal1.push();
			portal1.translate(players[i].x, players[i].h, players[i].y)
			portal1.rotateY(players[i].r * -1);
			portal1.rotateZ(players[i].u)
			portal1.strokeWeight(constrain(5 - Math.floor(dist(players[i].x, players[i].y, x, y)) / 50, 0, 3));
			portal1.push();
			portal1.translate(2.5, 0, 0);
			portal1.box(5, 1, 1);
			portal1.pop();

			portal1.pop();
		}

		if (!(players[i].id === socket.id && dist(x, y, portal1coords[0], portal1coords[1]) < 12.5) && players[i].name !== "¤") {
			portal2.push();
			var playerheight = players[i].h + playertop;
			portal2.translate(players[i].x, playerheight / 2, players[i].y);
			portal2.rotateY(players[i].r * -1);
			portal2.strokeWeight(constrain(5 - Math.floor(dist(players[i].x, players[i].y, x, y)) / 50, 0, 3));
			switch (players[i].team) {
				case 0:
					portal2.fill(255, 0, 0);
					break;
				case 1:
					portal2.fill(0, 0, 255);
					break;
			}
			portal2.box(5, playerheight, 5)
			portal2.pop();

			portal2.push();
			portal2.translate(players[i].x, players[i].h, players[i].y)
			portal2.rotateY(players[i].r * -1);
			portal2.rotateZ(players[i].u)
			portal2.strokeWeight(constrain(5 - Math.floor(dist(players[i].x, players[i].y, x, y)) / 50, 0, 3));

			portal2.push();
			portal2.translate(2.5, 0, 0);
			portal2.box(5, 1, 1);
			portal2.pop();

			portal2.pop();
		}
	}
	display.push(); //rendering the floor
	display.translate(0, 0, 0);
	display.fill(200)
	display.box(10000, 1, 10000);
	display.pop();

	portal1.push(); //rendering the floor
	portal1.translate(0, -1, 0);
	portal1.fill(200)
	portal1.box(10000, 1, 10000);
	portal1.pop();

	portal2.push(); //rendering the floor
	portal2.translate(0, -1, 0);
	portal2.fill(200)
	portal2.box(10000, 1, 10000);
	portal2.pop();
}
function renderBoxes() {
	for (var l = 0; l < boxes.length; l++) {
		loopcount++;//
		var redrend = false;
		var bluerend = false;
		var bx = boxes[l][0];
		var by = boxes[l][1];
		var rend = 150;
		var boxX = boxes[l][0] / conversionRadio;
		var boxY = boxes[l][1] / conversionRadio;

		if (enableLighting) {
			display.pointLight(100, 100, 100, gmap[0].length / 2, 50, gmap[0].length / 2)
			display.ambientLight(25, 25, 25)
			objcount += 1;
		}

		if (rendermap[by / 40][bx / 40] || dist(x, y, bx, by) < raycastclose) {
			switch (boxes[l][2]) {
				case 1: //Basic box
					display.push(); //Creates a new scope
					display.translate(bx + 20, 25, by + 20); //Moves item 
					display.noStroke(); //No outside line
					if (enableTextures) { display.texture(textures[0]); } else {
						fill(255)
					}
					display.box(40, 50, 40); //Box
					display.pop(); //Ends scope
					break;
				case 2: //Crouch
					display.push();
					display.translate(bx + 20, 35, by + 20);
					display.noStroke();
					if (enableTextures) { display.texture(textures[0]); } else {
						fill(255)
					}
					display.box(40, 30, 40);
					display.pop();
					objcount++;
					break;
				case 3: //Lower
					display.push();
					display.translate(bx + 20, 9, by + 20);
					display.noStroke();
					if (enableTextures) { display.texture(textures[0]); } else {
						fill(255)
					}
					display.box(40, 18, 40);
					display.pop();
					objcount++;
					break;
				case 4: //Portal
					display.push();
					display.translate(bx + 20, 25, by + 20);
					display.noStroke(); //No outside line
					if (enableTextures) { display.texture(textures[3]); } else {
						fill(255, 255, 0)
					}
					display.box(40, 50, 40); //Box
					display.pop(); //Ends scope
					objcount++;
					break;
			}
		}

		var cardinalAngles = ['E', 'S', 'W', 'N'];
		var p1rot = (cardinalAngles.indexOf(portal1coords[2]) * HALF_PI);
		var slope11 = (Math.sin(p1rot - coneFOV) * 250) / (Math.cos(p1rot - coneFOV) * 250);
		var slope12 = (Math.sin(p1rot + coneFOV) * 250) / (Math.cos(p1rot + coneFOV) * 250);
		var p11X = portal1coords[0];
		var p11Y = portal1coords[1];

		var p2rot = (cardinalAngles.indexOf(portal2coords[2]) * HALF_PI);
		var slope21 = (Math.sin(p2rot - coneFOV) * 250) / (Math.cos(p2rot - coneFOV) * 250);
		var slope22 = (Math.sin(p2rot + coneFOV) * 250) / (Math.cos(p2rot + coneFOV) * 250);
		var p22X = portal2coords[0];
		var p22Y = portal2coords[1];

		var p1L1 = incheck(slope11, p11X + Math.cos(p1rot) * 15, p11Y + Math.sin(p1rot) * 15, boxes[l][0], boxes[l][1], false, true, p11X, p11Y);
		var p1L2 = incheck(slope12, p11X + Math.cos(p1rot) * 15, p11Y + Math.sin(p1rot) * 15, boxes[l][0], boxes[l][1], false, true, p11X, p11Y);
		var p1D = dist(p11X, p11Y, boxes[l][0], boxes[l][1]) < coneDist * (2 / 3)
		if (((p1L1 && p1L2 && p1D) || dist(p11X, p11Y, boxes[l][0], boxes[l][1]) < 150) && p2view) {
			switch (boxes[l][2]) {
				case 1: //Basic box
					portal1.push(); //Creates a new scope
					portal1.translate(bx + 20, 25, by + 20); //Moves item 
					portal1.noStroke(); //No outside line
					if (enableTextures) { portal1.texture(textures[0]); } //Loads texture
					portal1.box(40, 50, 40); //Box
					portal1.pop(); //Ends scope
					objcount++;
					break;
				case 2: //Crouch
					portal1.push();
					portal1.translate(bx + 20, 35, by + 20);
					portal1.noStroke();
					if (enableTextures) { portal1.texture(textures[0]); }
					portal1.box(40, 30, 40);
					portal1.pop();
					objcount++;
					break;
				case 3: //Lower
					portal1.push();
					portal1.translate(bx + 20, 9, by + 20);
					portal1.noStroke();
					if (enableTextures) { portal1.texture(textures[0]); }
					portal1.box(40, 18, 40);
					portal1.pop();
					objcount++;
					break;
				case 4: //Portal
					portal1.push();
					portal1.translate(bx + 20, 25, by + 20);
					portal1.noStroke(); //No outside line
					if (enableTextures) { portal1.texture(textures[3]); }
					portal1.box(40, 50, 40); //Box
					portal1.pop(); //Ends scope
					objcount++;
					break;
			}
			redrend = true;
		}
		var p2L1 = incheck(slope21, p22X + Math.cos(p2rot) * 15, p22Y + Math.sin(p2rot) * 15, boxes[l][0], boxes[l][1], false, true, p22X, p22Y);
		var p2L2 = incheck(slope22, p22X + Math.cos(p2rot) * 15, p22Y + Math.sin(p2rot) * 15, boxes[l][0], boxes[l][1], false, true, p22X, p22Y);
		var p2D = dist(p22X, p22Y, boxes[l][0], boxes[l][1]) < coneDist * (2 / 3);
		if (((p2L1 && p2L2 && p2D) || dist(p22X, p22Y, boxes[l][0], boxes[l][1]) < 150) && p1view) {
			switch (boxes[l][2]) {
				case 1: //Basic box
					portal2.push(); //Creates a new scope
					portal2.translate(bx + 20, 25, by + 20); //Moves item 
					portal2.noStroke(); //No outside line
					if (enableTextures) { portal2.texture(textures[0]); } //Loads texture
					portal2.box(40, 50, 40); //Box
					portal2.pop(); //Ends scope
					objcount++;
					break;
				case 2: //Crouch
					portal2.push();
					portal2.translate(bx + 20, 35, by + 20);
					portal2.noStroke();
					if (enableTextures) { portal2.texture(textures[0]); }
					portal2.box(40, 30, 40);
					portal2.pop();
					objcount++;
					break;
				case 3: //Lower
					portal2.push();
					portal2.translate(bx + 20, 9, by + 20);
					portal2.noStroke();
					if (enableTextures) { portal2.texture(textures[0]); }
					portal2.box(40, 18, 40);
					portal2.pop();
					objcount++;
					break;
				case 4: //Portal
					portal2.push();
					portal2.translate(bx + 20, 25, by + 20);
					portal2.noStroke(); //No outside line
					if (enableTextures) { portal2.texture(textures[3]); }
					portal2.box(40, 50, 40); //Box
					portal2.pop(); //Ends scope
					objcount++;
					break;
			}
			bluerend = true;
		}
		minimap.noStroke();
		minimap.strokeWeight(1);
		var constrainhitbox = function() {
			if (x < bx && y > by && y < by + 40) {
				x = constrain(x, -Infinity, bx - pushback);
			}
			if (x > bx + 40 && y > by && y < by + 40) {
				x = constrain(x, bx + 40 + pushback, Infinity);
			} //right x collision
			if (y < by && x > bx && x < bx + 40) {
				y = constrain(y, -Infinity, by - pushback);
			} //top? or bottom? collision
			if (y > by + 40 && x > bx && x < bx + 40) {
				y = constrain(y, by + 40 + pushback, Infinity);
			}
		}
		if (x > bx - hitboxRadius && x < bx + 40 + hitboxRadius && y > by - hitboxRadius && y < by + 40 + hitboxRadius) {
			if (boxes[l][2] !== 2 && keys[67] == true) {
				constrainhitbox();
			} else if (keys[67] == false) { //crouching collision detection
				constrainhitbox();
				if (boxes[l][2] === 2 && x / conversionRadio > boxX && x / conversionRadio < boxX + boxwidth && y / conversionRadio > boxY && y / conversionRadio < boxY + boxwidth) {
					keys[67] = true;
					charunderhalf = true;
				}
			}
		}
		if (boxes[l][2] === 2 && debug) {
			minimap.fill(255, 255, 0);
			minimap.stroke(255, 255, 0);
		} else if (boxes[l][2] === 3 && debug) {
			minimap.fill(255, 255, 0);
			minimap.stroke(255, 255, 0);
		} else if (redrend && pdim.minimap || (boxes[l][2] === 5 && debug)) {
			minimap.fill(0, 255, 0);
			minimap.stroke(0, 255, 0);
		} else if (bluerend && pdim.minimap || (boxes[l][2] === 4 && debug)) {
			minimap.fill(0, 0, 255);
			minimap.stroke(0, 0, 255);
		} else if ((rendermap[by / 40][bx / 40] || dist(x, y, bx, by) < raycastclose) && !debug) {
			minimap.fill(coloring.boxlooking);
			minimap.stroke(coloring.boxlooking);
		} else {
			minimap.fill(coloring.boxcolor);
			minimap.stroke(coloring.boxcolor);
		}
		minimap.strokeWeight(0.5);
		minimap.rect(boxX / (4 / minimapscale), boxY / (4 / minimapscale), boxwidth / (4 / minimapscale), boxwidth / (4 / minimapscale));
		boxes[l][3] = false;
	}
};



function renderMinimapBack() {
	minimap.noStroke();
	minimap.fill(coloring.minimapback);
	minimap.rect(0, 0, winlength / (4 / minimapscale), winlength / (4 / minimapscale));
	minimap.strokeWeight(5);
};


function renderHitMarker() {
	minimap.strokeWeight(5 * hitmarker_thickness);
	minimap.stroke(0, 0, 0, constrain(hitmarker_fade, 0, 255));
	minimap.line(winlength / 2 - hitmarker_size, winheight / 2 + hitmarker_size, winlength / 2 + hitmarker_size, winheight / 2 - hitmarker_size);
	minimap.line(winlength / 2 - hitmarker_size, winheight / 2 - hitmarker_size, winlength / 2 + hitmarker_size, winheight / 2 + hitmarker_size);
}



function renderMinimap() {
	minimap.push();
	minimap.translate((x / conversionRadio / (4 / minimapscale)), (y / conversionRadio / (4 / minimapscale)));
	minimap.rotate(r);
	minimap.strokeWeight(3 * (winlength / 400) * minimapscale);
	minimap.stroke(0, 0, 0);
	minimap.point(0, 0);
	minimap.strokeWeight(2.5);
	minimap.line(4 * (winlength / 400) * minimapscale, 0, 0, 0);
	minimap.pop();

	for (var i = 0; i < players.length; i++) {
		if ((players[i].team === team || esp) && players[i].id !== socket.id) {
			minimap.push();
			minimap.translate((players[i].x / conversionRadio / (4 / minimapscale)), (players[i].y / conversionRadio / (4 / minimapscale)));
			minimap.rotate(players[i].r);
			minimap.strokeWeight(3 * (winlength / 400) * minimapscale);
			minimap.stroke(0, 255, 0);
			minimap.point(0, 0);
			minimap.strokeWeight(2.5);
			minimap.line(4 * (winlength / 400) * minimapscale, 0, 0, 0);
			minimap.pop();
		}
	}


	minimap.stroke(0);
	minimap.strokeWeight(cursorthickness);
	minimap.line(winlength / 2, winheight / 2 - winheight / cursorsize, winlength / 2, winheight / 2 + winheight / cursorsize);
	minimap.line(winlength / 2 - winheight / cursorsize, winheight / 2, winlength / 2 + winheight / cursorsize, winheight / 2);
	if (w.reloading) {
		var sizersrs = 25 - (w.reloadon / w.reload) * 25;
		minimap.noStroke();
		minimap.fill(0, 0, 0);
		minimap.ellipse(winlength / 2, winheight / 2, sizersrs, sizersrs);
	}
};




function renderWeaponHud() {
	weaponOverlay.fill(coloring.wbackground);
	weaponOverlay.strokeWeight(3.5);
	weaponOverlay.stroke(0);
	weaponOverlay.rect(-10, 10, 255, 100, 10);

	weaponOverlay.fill(255 - (w.ammo[w.weaponon] / w.max) * 255, 0, 0);
	weaponOverlay.strokeWeight(0);
	weaponOverlay.textSize(25);
	weaponOverlay.textAlign(CENTER);
	weaponOverlay.text(w.ammo[w.weaponon], 208.5, 45);
	weaponOverlay.fill(0, 0, 0);
	weaponOverlay.text("\n" + w.max, 208.5, 45);

	weaponOverlay.fill(0, 0, 0);
	weaponOverlay.strokeWeight(2.5);
	weaponOverlay.rect(192.5, 50, 35, 2.5);

	weaponOverlay.fill(0, 0, 0);
	weaponOverlay.strokeWeight(0);
	weaponOverlay.textSize(21.5);
	weaponOverlay.textAlign(CENTER);
	weaponOverlay.text(w.name, 96.5, 44.0);

	var swapOpacity = Math.abs(50 - swapping) * 5.25;
	weaponOverlay.fill(255, 255, 255, 255 - swapOpacity);
	weaponOverlay.strokeWeight(3.5);
	weaponOverlay.stroke(0);
	weaponOverlay.rect(-10, 10, 255, 100, 10);

	weaponOverlay.fill(coloring.whealthback);
	weaponOverlay.stroke(0);
	weaponOverlay.strokeWeight(2);
	weaponOverlay.rect(15, 52.5, 163.5, 25, 3);

	weaponOverlay.fill(255 - (hp / 100) * 255, (hp / 100) * 255, 0);
	weaponOverlay.stroke(255 - (hp / 100) * 255 - 25, (hp / 100) * 255 - 25, 0);
	weaponOverlay.strokeWeight(2);
	weaponOverlay.rect(15, 52.5, constrain((hp / 100) * 163.5, 0, Infinity), 25, 3);
};




function renderProjectiles() {
	for (var k = 0; k < bullets.length; k++) {
		var bullet = {
			x: bullets[k][0],
			y: bullets[k][1],
			z: bullets[k][2],
			c: bullets[k][3],
			r: bullets[k][4],
			u: bullets[k][5],
			sp: bullets[k][6],
			fb: bullets[k][7],
			cx: null,
			cy: null,
			cz: null,
		};

		bullets[k][3] += bullet.sp * bspeedmulti;
		bullet.cx = bullet.x + Math.cos(bullet.r) * bullet.c;
		bullet.cy = bullet.y + bullet.u * bullet.c;
		bullet.cz = bullet.z + Math.sin(bullet.r) * bullet.c;

		var rrx = floor(bullet.cx / 40);
		var rry = floor(bullet.cz / 40);
		var ccx = constrain(rrx, 0, gmap.length - 1);
		var ccy = constrain(rry, 0, gmap[0].length - 1);
		if (ccy !== undefined && ccx !== undefined) {
			var bx = Math.cos(bullet.r) * 5;
			var bz = Math.sin(bullet.r) * 5;
			switch (gmap[ccy][ccx]) {
				case 1:
					bullets.splice(k, 1);
					bulletremains.push([bullet.cx - bx, bullet.cz - bz, bullet.cy, 255]);
					break;
				case 2:
					if (bullet.cy > 20) {
						bullets.splice(k, 1);
						bulletremains.push([bullet.cx - bx, bullet.cz - bz, bullet.cy, 255]);
					}
					break;
				case 3:
					if (bullet.cy < 18) {
						bullets.splice(k, 1);
						bulletremains.push([bullet.cx - bx, bullet.cz - bz, bullet.cy, 255]);
					}
					break;
			}

			for (var i = 0; i < players.length; i++) {
				if (frameCount % 50 === 1) {
					//socket.emit('log',{log:players[i].team+":"+bullet.fb})
				}
				if (players.id !== socket.id && players[i].team !== bullet.fb) {
					for (var q = 1; q < bspeedmulti; q += 0.1) {
						var backtrack_x = bullet.x + Math.cos(bullet.r) * (bullet.c - bspeedmulti / q);
						var backtrack_z = bullet.z + Math.sin(bullet.r) * (bullet.c - bspeedmulti / q);
						var backtrack_y = bullet.y + bullet.u * (bullet.c - bspeedmulti / q);


						if (dist(backtrack_x, backtrack_z, players[i].x, players[i].y) < playerhitboxradius && backtrack_y < (players[i].h + playertop + 2.5) && backtrack_y > 0 && players[i].name !== "¤") {
							bullets.splice(k, 1);
							socket.emit('CTSdamage', { id: players[i].id, damage: w.damage, who_shot: socket.id });
							hitmarker_fade = 255;
							break;
						}
					}
				}
			}
			display.push();
			display.translate(bullet.cx, bullet.cy, bullet.cz);
			display.rotateY(-bullet.r);
			display.rotateZ(bullet.u);
			display.fill((500 / bullet.c) * 255, 0, 0);
			display.noStroke();
			display.box(15.00, 0.15 * (winlength / winheight), 0.15);
			display.pop();
			objcount++;

			if (bullet.cy > 50 || bullet.cy < -10) {
				bullets.splice(k, 1);
				objcount--;
			}
		}
	}
	for (var k = 0; k < visual_bullets.length; k++) {
		var bullet = {
			x: visual_bullets[k][0],
			y: visual_bullets[k][1],
			z: visual_bullets[k][2],
			c: visual_bullets[k][3],
			r: visual_bullets[k][4],
			u: visual_bullets[k][5],
			sp: visual_bullets[k][6],
			fb: visual_bullets[k][7],
			cx: null,
			cy: null,
			cz: null,
		};

		visual_bullets[k][3] += bullet.sp * bspeedmulti;
		bullet.cx = bullet.x + Math.cos(bullet.r) * bullet.c;
		bullet.cy = bullet.y + bullet.u * bullet.c;
		bullet.cz = bullet.z + Math.sin(bullet.r) * bullet.c;

		var rrx = floor(bullet.cx / 40);
		var rry = floor(bullet.cz / 40);
		var ccx = constrain(rrx, 0, gmap.length - 1);
		var ccy = constrain(rry, 0, gmap[0].length - 1);
		var bx = Math.cos(bullet.r) * 5;
		var bz = Math.sin(bullet.r) * 5;
		switch (gmap[ccy][ccx]) {
			case 1:
				visual_bullets.splice(k, 1);
				bulletremains.push([bullet.cx - bx, bullet.cz - bz, bullet.cy, 255]);
				break;
			case 2:
				if (bullet.cy > 20) {
					visual_bullets.splice(k, 1);
					bulletremains.push([bullet.cx - bx, bullet.cz - bz, bullet.cy, 255]);
				}
				break;
			case 3:
				if (bullet.cy < 18) {
					visual_bullets.splice(k, 1);
					bulletremains.push([bullet.cx - bx, bullet.cz - bz, bullet.cy, 255]);
				}
				break;
		}
		display.push();
		display.translate(bullet.cx, bullet.cy, bullet.cz);
		display.rotateY(-bullet.r);
		display.rotateZ(bullet.u);
		display.fill((500 / bullet.c) * 255, 0, 0);
		display.noStroke();
		display.box(15.00, 0.5 * (winlength / winheight), 0.5);
		display.pop();
		objcount++;
		if (bullet.cy > 50 || bullet.cy < -10) {
			visual_bullets.splice(k, 1);
			objcount--;
		}
	}
};




function renderChat() {
	//CHAT HANDLING

	//KILLFEED
	for (var m = 0; m < server_kills.length; m++) {
		var offset_m = (server_kills.length - 1) - m;
		server_kills[m][1] -= msg_decay_time * (deltaTime / globalTickSpeed) / 2;
		var font_size = 18;
		switch (server_kills[m][2]) {
			case "Red":
				minimap.fill(255, 0, 0, server_kills[m][1]);
				break;
			case "Blue":
				minimap.fill(0, 0, 255, server_kills[m][1]);
				break;
			default:
				minimap.noFill();
				break;
		}

		minimap.push();
		minimap.translate(winlength * (4.5 / 6),
			(offset_m) * (24 * (winlength / 850)) + (24 * (winlength / 850)));
		minimap.scale(killfeed_size * (winlength / 1000));

		minimap.noStroke();
		minimap.rect(-150, -18, 325, 24);

		minimap.textAlign(CENTER);
		minimap.strokeWeight(0.75);
		minimap.textSize(font_size);
		minimap.stroke(0, 0, 0, server_kills[m][1]);
		minimap.fill(255, 255, 255, server_kills[m][1]);
		minimap.text(server_kills[m][0] + "|" + offset_m + "|" + m, 0, 0);
		minimap.pop();
	}
	//END KILLFEED

	minimap.textAlign(LEFT);
	var displayText = "";
	var textInputBoxWidth = 150
	var liveChatOffset = 0

	//if(all messages rendered OR (10 messages are rendered AND there are 10 or more messages AND there are any messages))

	for (var i = 0; i < liveChat.length; i++) { // all messages are rendered
		var message = liveChat[i][1]
		var teamofsender;
		if (liveChat[i][0] !== -1) {
			players.forEach((player, ind) => { //For each player
				if (player.id === liveChat[i][2]) { //Find the sender
					// socket.emit('log', {log: player.team})
					teamofsender = teamlist[player.team].toUpperCase();
					// ^^^ Get the team name ^^^
				}
			});
		} else {
			teamofsender = "SERVER";
		}

		displayText += "\n[" + teamofsender + "] " + liveChat[i][0] + ": " + message;
	}

	// if (frameCount % 50 === 1) {
	// 	socket.emit('log', {log: liveChat.length})
	// }


	//Rendering the live chat
	minimap.fill(0);
	minimap.stroke(255)
	minimap.strokeWeight(1.5);
	// minimap.noStroke()
	// minimap.textSize(winheight / 30)
	minimap.text(displayText, 20, winheight - 100 - ((liveChat.length) * 15));

	//rect(x, y, width, height)


	//Rendering the "text box"
	if (isTyping) {
		minimap.fill(250);
		minimap.noStroke();
		minimap.rect(15, winheight - 100 + (winheight / 30 + 5) / 2, textInputBoxWidth, 15);
		//old height: winheight / 30 + 5
	}

	//Formatting message preview text
	var typingDisplay = chatCache

	if (frameCount % 25 == 0) {
		showCursor = !showCursor
	}

	if (showCursor) {
		var chatSuffix = "|"
	} else {
		var chatSuffix = ""
	}

	if (isTyping) {
		if (chatCache.length < 25) {
			typingDisplay = chatCache + chatSuffix
		} else {
			typingDisplay = chatCache.substring(chatCache.length - 25, chatCache.length) + chatSuffix
		}
	}

	//Rendering the message preview text
	minimap.fill(0, 0, 0);
	minimap.stroke(0);
	minimap.strokeWeight(0.5);
	minimap.text(typingDisplay, 20, winheight - 90 + (winheight / 30 + 5) / 2);
}



function debugtext(addto) {
	minimap.fill(255);
	minimap.noStroke();
	minimap.rect(winlength - winlength / 9, 5, winlength / 20 + 5, winheight / 22 + 150); //wat u want
	minimap.fill(0);
	minimap.stroke(0);
	minimap.strokeWeight(1);
	minimap.text(fps + "\n" + objcount + "\n" + addto, winlength - winlength / 10, 10 + winheight / 50);
};

// REGISTERING EVENT HANDLERS

socket.on('STCplayerFire', function(data) {
	var firingPlayerID = data.firingPlayer
	socket.emit('CTSgetPlayers')

	function getPlayer(id) {
		for (var i = 0; i < players.length; i++) {
			if (players[i].id === id) {
				return players[i]
			}
		}
	}

	var firingPlayer = getPlayer(firingPlayerID)
	if (firingPlayer !== undefined) {
		visual_bullets.push([firingPlayer.x, firingPlayer.h, firingPlayer.y, 5, firingPlayer.r, firingPlayer.u, 5, firingPlayer.team]);
	}
});

socket.on('STCchat', function(data) {
	liveChat.push([data.player, data.msg, data.id]) //store message
	if (liveChat.length > messageDisplayLimit) {
		liveChat.shift() //remove first element
	}
})

function setup() {
	font_cache[0] = loadFont('./public/assets/fonts/Raleway-Regular.ttf');
	font_cache[1] = loadFont('./public/assets/fonts/Raleway-Bold.ttf');

	try {
		gunModels[0] = loadModel('./public/models/ump.obj');
		gunModels[1] = loadModel('./public/models/glock.obj');
		gunModels[2] = loadModel('./public/models/ebr.obj');
		if (enableTextures) {
			textures[0] = loadImage('./public/assets/tr1.jpg');
			textures[3] = loadImage('./public/assets/pportal.jpg');
		}
	} catch (err) {
		socket.emit('log', { log: "Error loading assets. Error will be displayed. \n" + err });
	}

	try {
		try {
			createCanvas(winlength, winheight, WEBGL);
			weaponOverlay = createGraphics(250, 100);
			minimap = createGraphics(winlength, winheight);
			gunOverlay = createGraphics(1336, 587, WEBGL);
			display = createGraphics(winlength, winheight, WEBGL);
			portal1 = createGraphics(pdim.resolution_x, pdim.resolution_y, WEBGL);
			portal2 = createGraphics(pdim.resolution_x, pdim.resolution_y, WEBGL);
			tmOverlay = createGraphics(winlength, winheight, WEBGL);
			scoreOverlay = createGraphics(100, 100, P2D);
			display.setAttributes('antialias', true);
			frameRate(targetFPS);
		} catch (err) {
			socket.emit('log', { log: "Error framing window. Error will be displayed.\n" + err })
		}

		try {
			for (var i = 0; i < gmap.length; i++) {
				for (var g = 0; g < gmap.length; g++) { //for every entry in the map array
					if (gmap[i][g] !== 0) { //if box isn't air
						boxes.push([g * 40, i * 40, gmap[i][g], false]); //push it into the new array
						//create map
						//each box size is defined by the g* and i*
					} else {
						if (g >= gmap.length / 2) {
							spawnable[0].push([g, i]);
						} else {
							spawnable[1].push([g, i]);
						}
					}
				}
			}
			for (var yyy = 0; yyy < gmap.length; yyy++) {
				var pushin = [];
				for (var xxx = 0; xxx < gmap.length; xxx++) {
					pushin.push(false);
				}
				rendermap.push(pushin);
			}
		} catch (err) {
			socket.emit('log', { log: "Error creating map. Error will be displayed.\n" + err });
		}

		try {
			coloring = {
				boxcolor: color(0, 0, 0),
				boxlooking: color(255, 0, 0),
				minimapback: color(255, 255, 255),

				wbackground: color(255, 255, 255),
				wtext: color(0, 0, 0),
				wtextbar: color(0, 0, 0),
				whealthback: color(0, 0, 0),
				whealthlow: color(255, 0, 0),
				whealthfull: color(0, 255, 0),

				debugback: color(255, 255, 255),
				debugtext: color(0, 0, 0),

				crosshair: color(0, 0, 0),
				reloadbubble: color(0, 0, 0),
			}
		} catch (err) {
			socket.emit('log', { log: "Error loading colors. Error will be displayed.\n" + err });
		}

		changeWeapon(w.weapons[0], true);
	} catch (err) {
		background(255, 0, 255)
		fill(0, 0, 0);
		textSize(15);
		textFont(font_cache[0])
		text(err, 0, 0);
		rect(-50, 100, 100, 100)
	}
};
function draw() { //DRAW FUNCTION
	switch (page) {
		case "menu":
			page_swap_fade -= 1.5 * deltaTime;
			var ratio = 1 + ((winlength / 776 - 1) * 0.65);//Adjusted so it's not stupid big
			var ratio_true = 1 + ((winlength / 776 - 1) * 0.80);
			background(255);
			textFont(font_cache[1])

			fill(255, 0, 0);
			rect(-winlength / 2, winheight / 2 - 5, 100, 5);
			fill(0, 0, 255);
			rect(cos(frameCount / 50) * (winlength / 2 - 100) - 50, -winheight / 2, 100, 5);
			fill(125);
			rect(-winlength / 2 + 100, winheight / 2 - 5, winlength - 100, 5);

			var trail_length = 5;
			for (var i = 0; i < ball_trail.length; i++) {
				fill(abs(cos(frameCount / 50) * 255), abs(sin(frameCount / 50) * 255), abs(sin(-frameCount / 25) * 255), i * (255 / trail_length));
				ellipse(ball_trail[i][0], ball_trail[i][1], 40, 40);
			}
			if (ball_trail.length > trail_length) {
				ball_trail.splice(0, 1);
			}

			fill(abs(cos(frameCount / 50) * 255), abs(sin(frameCount / 50) * 255), abs(sin(-frameCount / 25) * 255));
			menu_box.x += menu_box.s_x;
			menu_box.y += menu_box.s_y;
			menu_box.s_y += 0.098;
			menu_box.s_x -= 0.049;
			ball_trail.push([menu_box.x, menu_box.y]);
			if (menu_box.x < -winlength / 2 + 100 && menu_box.y > winheight / 2 - 25) {
				menu_box.y = -winheight / 2 + 20;
				menu_box.x = cos(frameCount / 50) * (winlength / 2 - 100) + 0;
			}
			if (menu_box.y > winheight / 2 - 25) {
				if (menu_box.s_y > 0) {
					menu_box.s_y = -menu_box.s_y / 3;
				}
			}
			if (menu_box.x < -winlength / 2 + 20) {
				if (menu_box.s_x < 0) {
					menu_box.s_x = -menu_box.s_x / 3;
				}
			}
			ellipse(menu_box.x, menu_box.y, 40, 40);

			fill(0, 0, 0, page_swap_fade);
			noStroke();
			rect(-winlength / 2, -winheight / 2, winlength, winheight);

			function button(x, y, box_text, box_size, text_size, box_height, button_index, box_page) {
				textAlign(CENTER);
				textFont(font_cache[1]);
				textSize(text_size);
				fill(0, 0, 50, 100)
				rect(x - box_size, -winheight / 2 + winheight / 5.5, box_size * 2, -buttons[button_index]);
				if (mouseX > (x - box_size) + winlength / 2 && mouseX < (x + box_size) + winlength / 2 && mouseY < winheight / 5.5) {
					fill(255);
					buttons[button_index] = constrain(buttons[button_index] + (deltaTime / globalTickSpeed) * 6, 0, box_height);
					if (clicks[LEFT]) {
						if (page !== box_page) {
							page_swap_fade = 255;
						}
						page = box_page;
						//if (box_page == "primary") {
						//	socket.emit('CTSready');
						//}
					}
				} else {
					fill(200);
					buttons[button_index] = constrain(buttons[button_index] - (deltaTime / globalTickSpeed) * 6, 0, box_height)
				}
				text(box_text, x, y);
			}
			fill(0, 0, 100, 150);
			noStroke();
			rect(-winlength / 2, -winheight / 2, winlength, winheight / 5.5);
			button(-winlength / 2.5, -winheight / 2.85, "PLAY", ratio * 27.5, ratio * 15, ratio_true * 35, 0, "primary")
			fill(200);
			button(-winlength / 3.7, -winheight / 2.85, "LOADOUT", ratio * 42.5, ratio * 15, ratio_true * 35, 1, "menu")
			button(-winlength / 7.7, -winheight / 2.85, "STORE", ratio * 31.5, ratio * 15, ratio_true * 35, 2, "menu");
			button(winlength / 100.7, -winheight / 2.85, "SETTINGS", ratio * 42.5, ratio * 15, ratio_true * 35, 3, "settings")

			textSize(35 * ratio_true);
			textAlign(CENTER);
			fill(25);
			noStroke();
			textFont(font_cache[1]);
			text("threadgate", winlength / 2 - winlength / 6, -winheight/2 + winheight / 8);

			var main_p = {
				x: winlength/2 - winlength/5,
				y: winheight/4.5,
				w: winlength/2 - (winlength/2 - winlength/5),
				h: winheight/5
			}
			fill(0, 0, 100, 150);
			noStroke();
			rect(main_p.x, main_p.y, main_p.w,main_p.h);

			fill(200);
			text("Play", main_p.x + main_p.w / 2, main_p.y + (main_p.h) * (3/4));

			textAlign(LEFT);
			break;
		case "settings":
			page_swap_fade -= 1.5 * deltaTime;
			var ratio = 1 + ((winlength / 776 - 1) * 0.65);//Adjusted so it's not stupid big
			var ratio_true = 1 + ((winlength / 776 - 1) * 0.80);
			background(255);
			textFont(font_cache[1])

			fill(0, 0, 0, page_swap_fade);
			noStroke();
			rect(-winlength / 2, -winheight / 2, winlength, winheight);

			function button(x, y, box_text, box_size, text_size, box_height, button_index, box_page) {
				textAlign(CENTER);
				textFont(font_cache[1]);
				textSize(text_size);
				fill(0, 0, 50, 100)
				rect(x - box_size, -winheight / 2 + winheight / 5.5, box_size * 2, -buttons[button_index]);
				if (mouseX > (x - box_size) + winlength / 2 && mouseX < (x + box_size) + winlength / 2 && mouseY < winheight / 5.5) {
					fill(255);
					buttons[button_index] = constrain(buttons[button_index] + (deltaTime / globalTickSpeed) * 6, 0, box_height);
					if (clicks[LEFT]) {
						if (page !== box_page) {
							page_swap_fade = 255;
						}
						page = box_page;
						//if (box_page == "primary") {
						//	socket.emit('CTSready');
						//}
					}
				} else {
					fill(200);
					buttons[button_index] = constrain(buttons[button_index] - (deltaTime / globalTickSpeed) * 6, 0, box_height)
				}
				text(box_text, x, y);
			}
			fill(0, 0, 100, 150);
			noStroke();
			rect(-winlength / 2, -winheight / 2, winlength, winheight / 5.5);
			button(-winlength / 2.5, -winheight / 2.85, "PLAY", ratio * 27.5, ratio * 15, ratio_true * 35, 0, "menu")
			fill(200);
			button(-winlength / 3.7, -winheight / 2.85, "LOADOUT", ratio * 42.5, ratio * 15, ratio_true * 35, 1, "menu")
			button(-winlength / 7.7, -winheight / 2.85, "STORE", ratio * 31.5, ratio * 15, ratio_true * 35, 2, "menu");
			button(winlength / 100.7, -winheight / 2.85, "SETTINGS", ratio * 42.5, ratio * 15, ratio_true * 35, 3, "settings")


			//function settings_tick(x,y,text,box_size,text_size)
			break;
		case "admin":
			break;
		case "primary":
			try {
				updateHealth();
				updateSwapPortalAndInfo();
				updateKeys();
				updatePortalView();
				updateFPS();
				updateRender();
				updateCone();
				updateWeaponStats();

				renderMinimapBack();
				renderChat();
				renderHitMarker();

				display.background(100, 100, 255);
				cameraZ = (height / 2.0) / tan(fov / 2.0);
				display.camera(x, cheight, y, x + Math.cos(r), cheight + u, y + Math.sin(r), 0, 1, 0);
				display.perspective(fov, float(width) / float(height), cameraZ / 10.0, cameraZ * 10.0);
				display.frustum(cambox[0], cambox[1], cambox[2], cambox[3], 0.02, renderdistance);


				updateShooting();
				renderProjectiles();
				renderBoxes();
				renderWorldAndPlayers();
				renderWeaponAndImpacts();
				renderESP();
				renderScore();

				if (showFeedbackInput) { //FUCK
					minimap.push()
					var boxHeight = 50
					var boxWidth = 80
					minimap.fill(255)
					minimap.rect(boxWidth, boxHeight, (boxWidth / 2) + (winlength / 2), (boxHeight / 2) + (winheight / 2))
				}

				players.forEach((player, ind) => {
					// try {
					if (player.id !== socket.id) {
						var po1X = player.p1[0];//Actual X
						var po1Y = player.p1[1];//Actual Y
						var po1DIR = player.p1[2];
						var po1FX = po1X;//Facing X
						var po1FY = po1Y;//Facing y
						var po1flip = 1;
						var po1Angle = atan2(y - po1Y, x - po1X);
						if (po1DIR === 'N' || po1DIR === 'S') {
							po1flip = -1;
						}
						var po2X = player.p2[0];//Actual X
						var po2Y = player.p2[1];//Actual Y
						var po2DIR = player.p2[2];
						var po2FX = po2X;//Facing X
						var po2FY = po2Y;//Facing y
						var po2flip = 1;
						if (po2DIR === 'N' || po2DIR === 'S') {
							po2flip = -1;
						}
						var relativeP1X = 0;
						var relativeP1Y = 0;
						switch (po1DIR) {
							case 'N'://North
								po1FY -= 20;
								break;
							case 'E'://East
								po1FX += 20;
								break;
							case 'S'://South
								po1FY += 20;
								break;
							case 'W'://West
								po1FX -= 20;
								break;
						}
						switch (po2DIR) {
							case 'N'://North
								po2FY -= 20;
								break;
							case 'E'://East
								po2FY -= 20;
								break;
							case 'S'://South
								po2FY += 20;
								break;
							case 'W'://West
								po2FX -= 20;
								break;
						}
						var dirs = ['S', 'W', 'N', 'E'];
						var rotind2 = dirs.indexOf(po2DIR);
						var boundoffx = 0;
						var boundoffy = 0;
						switch (po2DIR) {
							case 'N':
								boundoffy = 0.5;
								break;
							case 'E':
								boundoffx = -0.5;
								break
							case 'S':
								boundoffy = -0.5;
								break;
							case 'W':
								boundoffx = 0.5;
								break;
						}

						display.push();
						display.translate(po2X + boundoffx, 50, po2Y + boundoffy);
						display.rotateY(rotind2 * (PI / 2));
						if (pdim.tint) {
							display.tint(255, 150, 150);
						}
						pdim.boundary = 2.5;
						if (player.team === team) {
							display.fill(0, 0, 255);
						} else {
							display.fill(0, 0, 155);
						}
						display.noStroke();
						display.rect(-1 * (po1flip) * (pdim.physical_x / 2) + (-1 * pdim.boundary * po1flip), -50 + pdim.physical_y + pdim.boundary * (5 / 3), (po1flip) * (pdim.physical_x + pdim.boundary * 2), -1 * (pdim.physical_y + pdim.boundary * 2));
						display.pop();

						var dirs = ['S', 'W', 'N', 'E'];
						var rotind = dirs.indexOf(po1DIR);
						var boundoffx = 0;
						var boundoffy = 0;
						switch (po1DIR) {
							case 'N':
								boundoffy = 0.5;
								break;
							case 'E':
								boundoffx = -0.5;
								break
							case 'S':
								boundoffy = -0.5;
								break;
							case 'W':
								boundoffx = 0.5;
								break;
						}

						display.push();
						display.translate(po1X + boundoffx, 50, po1Y + boundoffy);
						display.rotateY(rotind * (PI / 2));
						if (pdim.tint) {
							display.tint(255, 150, 150);
						}
						pdim.boundary = 2.5;
						if (player.team === team) {
							display.fill(255, 0, 0);
						} else {
							display.fill(155, 0, 0);
						}
						display.noStroke();
						display.rect(-1 * (po2flip) * (pdim.physical_x / 2) + (-1 * po2flip * pdim.boundary), -50 + pdim.physical_y + pdim.boundary * (5 / 3), (po2flip) * (pdim.physical_x + pdim.boundary * 2), -1 * (pdim.physical_y + pdim.boundary * 2));
						display.pop();
					}
					// } catch (err) {
					// 	logging.push(ind + ":    " + player.p1+"|"+player.p2);
					// }
				});

				if (keys[81] && last_fired < 0 && !lockMovement) {
					var break_i = false;
					for (var i = 1; i < 400; i += 0.5) {
						if (!break_i) {
							var ray_x = x + cos(r) * i;//Per-Pellet X
							var ray_y = y + sin(r) * i;//Per-Pellet Y
							var ray_u = cheight - 10 + u * i;//Vertical Height
							display.push();
							display.translate(ray_x, ray_u, ray_y);
							display.noStroke();
							display.fill(255, 0, 0);
							display.rotateX(frameCount * i);//Cool Spin
							display.box(3.5);
							display.pop();
							for (var j = 0; j < boxes.length - 1; j++) {
								var bx = boxes[j][0];//Shorter X Ref
								var by = boxes[j][1];//Shorter Y Ref
								var hitboxRadius = pdim.outer_hitbox;//Size of Hitbox
								var cray_x = constrain(ray_x, bx + 10, bx + 30);//Constrained X so it doesn't go off block
								var cray_y = constrain(ray_y, by + 10, by + 30);//Constrained Y so it doesn't go off block
								if (ray_x > bx - hitboxRadius && ray_x < bx + 40 + hitboxRadius && ray_y > by - hitboxRadius && ray_y < by + 40 + hitboxRadius && ray_u > 0 && ray_u < 40) {//If it's in the hitbox radius
									//West Face Handling
									if (ray_x < bx + pdim.inner_hitbox && ray_y > by && ray_y < by + 40) {
										if (boxes[j][2] === 4) {//If it's a portal block
											if (dist(bx - 1, cray_y, portal2coords[0], portal2coords[1]) > pdim.min_place_distance || portal2coords[2] !== 'W') {//If it's not on top of other portal
												portal1coords[0] = bx - 1;//Hard set the X
												portal1coords[1] = cray_y;//Set Y to player aim
												portal1coords[2] = 'W';//Face west
												socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords, hp, death_info] })
											}
										}
										if (!(boxes[j][2] === 3 && cheight > 19.9) && !(boxes[j][2] === 2 && cheight < 15.1)) {//If not top/bottom half
											break_i = true;//Quit the for loop
										}
									}
									//East Face Handling
									else if (ray_x > bx + 40 - pdim.inner_hitbox && ray_y > by && ray_y < by + 40) {
										if (boxes[j][2] === 4) {
											if (dist(bx + 41, cray_y, portal2coords[0], portal2coords[1]) > pdim.min_place_distance || portal2coords[2] !== 'E') {
												portal1coords[0] = bx + 41;
												portal1coords[1] = cray_y;
												portal1coords[2] = 'E';
												socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords, hp, death_info] })
											}
										}
										if (!(boxes[j][2] === 3 && cheight > 19.9) && !(boxes[j][2] === 2 && cheight < 15.1)) {
											break_i = true;
										}
									}
									//North Face Handling
									else if (ray_y < by + pdim.inner_hitbox && ray_x > bx && ray_x < bx + 40) {
										if (boxes[j][2] === 4) {
											if (dist(cray_x, by - 1, portal2coords[0], portal2coords[1]) > pdim.min_place_distance || portal2coords[2] !== 'N') {
												portal1coords[0] = cray_x;
												portal1coords[1] = by - 1;
												portal1coords[2] = 'N';
												socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords, hp, death_info] })
											}
										}
										if (!(boxes[j][2] === 3 && cheight > 19.9) && !(boxes[j][2] === 2 && cheight < 15.1)) {
											break_i = true;
										}
									}
									//South Face Handling
									else if (ray_y > by + 40 - pdim.inner_hitbox && ray_x > bx && ray_x < bx + 40) {
										if (boxes[j][2] === 4) {
											if (dist(cray_x, by + 41, portal2coords[0], portal2coords[1]) > pdim.min_place_distance || portal2coords[2] !== 'S') {
												portal1coords[0] = cray_x;
												portal1coords[1] = by + 41;
												portal1coords[2] = 'S';
												socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords, hp, death_info] })
											}
										}
										if (!(boxes[j][2] === 3 && cheight > 19.9) && !(boxes[j][2] === 2 && cheight < 15.1)) {
											break_i = true;
										}
									}
									didUpdate = true;
								}
							}
							last_fired = pdim.portal_recharge;//Cooldown
						}
					}
				}
				if (keys[69] && last_fired < 0 && !lockMovement) {
					var break_i = false;
					for (var i = 1; i < 400; i += 0.5) {
						if (!break_i) {
							var ray_x = x + cos(r) * i;//Per-Pellet X
							var ray_y = y + sin(r) * i;//Per-Pellet Y
							var ray_u = cheight - 10 + u * i;//Vertical Height
							display.push();
							display.translate(ray_x, ray_u, ray_y);
							display.noStroke();
							display.fill(0, 0, 255);
							display.rotateX(frameCount * i);//Cool Spin
							display.box(3.5);
							display.pop();
							for (var j = 0; j < boxes.length - 1; j++) {
								var bx = boxes[j][0];//Shorter X Ref
								var by = boxes[j][1];//Shorter Y Ref
								var hitboxRadius = pdim.outer_hitbox;//Size of Hitbox
								var cray_x = constrain(ray_x, bx + 10, bx + 30);//Constrained X so it doesn't go off block
								var cray_y = constrain(ray_y, by + 10, by + 30);//Constrained Y so it doesn't go off block
								if (ray_x > bx - hitboxRadius && ray_x < bx + 40 + hitboxRadius && ray_y > by - hitboxRadius && ray_y < by + 40 + hitboxRadius && ray_u > 0 && ray_u < 40) {//If it's in the hitbox radius
									//West Face Handling
									if (ray_x < bx + pdim.inner_hitbox && ray_y > by && ray_y < by + 40) {
										if (boxes[j][2] === 4) {//If it's a portal block
											if (dist(bx - 1, cray_y, portal1coords[0], portal1coords[1]) > pdim.min_place_distance || 'W' !== portal1coords[2]) {//If it's not on top of other portal
												portal2coords[0] = bx - 1;//Hard set the X
												portal2coords[1] = cray_y;//Set Y to player aim
												portal2coords[2] = 'W';//Face west
												socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords, hp, death_info] })
											}
										}
										if (!(boxes[j][2] === 3 && cheight > 19.9) && !(boxes[j][2] === 2 && cheight < 15.1)) {//If not top/bottom half
											break_i = true;//Quit the for loop
										}
									}
									//East Face Handling
									else if (ray_x > bx + 40 - pdim.inner_hitbox && ray_y > by && ray_y < by + 40) {
										if (boxes[j][2] === 4) {
											if (dist(bx + 41, cray_y, portal1coords[0], portal1coords[1]) > pdim.min_place_distance || 'E' !== portal1coords[2]) {
												portal2coords[0] = bx + 41;
												portal2coords[1] = cray_y;
												portal2coords[2] = 'E';
												socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords, hp, death_info] })
											}
										}
										if (!(boxes[j][2] === 3 && cheight > 19.9) && !(boxes[j][2] === 2 && cheight < 15.1)) {
											break_i = true;
										}
									}
									//North Face Handling
									else if (ray_y < by + pdim.inner_hitbox && ray_x > bx && ray_x < bx + 40) {
										if (boxes[j][2] === 4) {
											if (dist(cray_x, by - 1, portal1coords[0], portal1coords[1]) > pdim.min_place_distance || 'N' !== portal1coords[2]) {
												portal2coords[0] = cray_x;
												portal2coords[1] = by - 1;
												portal2coords[2] = 'N';
												socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords, hp, death_info] })
											}
										}
										if (!(boxes[j][2] === 3 && cheight > 19.9) && !(boxes[j][2] === 2 && cheight < 15.1)) {
											break_i = true;
										}
									}
									//South Face Handling
									else if (ray_y > by + 40 - pdim.inner_hitbox && ray_x > bx && ray_x < bx + 40) {
										if (boxes[j][2] === 4) {
											if (dist(cray_x, by + 41, portal1coords[0], portal1coords[1]) > pdim.min_place_distance || 'S' !== portal1coords[2]) {
												portal2coords[0] = cray_x;
												portal2coords[1] = by + 41;
												portal2coords[2] = 'S';
												socket.emit('CTSadd', { description: [x, y, r, u, cheight, playername, portal1coords, portal2coords, hp, death_info] })
											}
										}
										if (!(boxes[j][2] === 3 && cheight > 19.9) && !(boxes[j][2] === 2 && cheight < 15.1)) {
											break_i = true;
										}
									}
									didUpdate = true;
								}
							}
							last_fired = pdim.portal_recharge;//Cooldown
						}
					}
				}
				//Begin Portal Handling

				var po1X = portal1coords[0];//Actual X
				var po1Y = portal1coords[1];//Actual Y
				var po1DIR = portal1coords[2];
				var po1FX = po1X;//Facing X
				var po1FY = po1Y;//Facing y
				var po1flip = 1;
				var po1Angle = atan2(y - po1Y, x - po1X);
				if (po1DIR === 'N' || po1DIR === 'S') {
					po1flip = -1;
				}
				var po2X = portal2coords[0];//Actual X
				var po2Y = portal2coords[1];//Actual Y
				var po2DIR = portal2coords[2];
				var po2FX = po2X;//Facing X
				var po2FY = po2Y;//Facing y
				var po2flip = 1;
				if (po2DIR === 'N' || po2DIR === 'S') {
					po2flip = -1;
				}

				var relativeP1X = 0;
				var relativeP1Y = 0;
				switch (po1DIR) {
					case 'N'://North
						po1FY -= 20;
						break;
					case 'E'://East
						po1FX += 20;
						break;
					case 'S'://South
						po1FY += 20;
						break;
					case 'W'://West
						po1FX -= 20;
						break;
				}

				var dirs = ['S', 'W', 'N', 'E'];
				var rotind = dirs.indexOf(po1DIR) * (PI / 2);
				portal1.camera(po1X, pdim.height, po1Y, po1FX, pdim.height + pdim.vertadj, po1FY, 0, 1, 0);
				portal1.perspective(pdim.fov, float(pdim.resolution_x) / float(pdim.resolution_y), cameraZ / 10.0, cameraZ * 10.0);
				portal1.frustum(pcambox[0], pcambox[1], pcambox[2], pcambox[3], 0.02, renderdistance);

				switch (po2DIR) {
					case 'N'://North
						po2FY -= 20;
						break;
					case 'E'://East
						po2FY -= 20;
						break;
					case 'S'://South
						po2FY += 20;
						break;
					case 'W'://West
						po2FX -= 20;
						break;
				}
				portal2.camera(po2X, pdim.height, po2Y, po2FX, pdim.height + pdim.vertadj, po2FY, 0, 1, 0);
				portal2.perspective(fov, float(pdim.resolution_x) / float(pdim.resolution_y), cameraZ / 10.0, cameraZ * 10.0);
				portal2.frustum(pcambox[0], pcambox[1], pcambox[2], pcambox[3], 0.02, renderdistance);
				if (p2view) {
					var dirs = ['S', 'W', 'N', 'E'];
					var rotind2 = dirs.indexOf(po2DIR);
					var boundoffx = 0;
					var boundoffy = 0;
					switch (po2DIR) {
						case 'N':
							boundoffy = 0.5;
							break;
						case 'E':
							boundoffx = -0.5;
							break
						case 'S':
							boundoffy = -0.5;
							break;
						case 'W':
							boundoffx = 0.5;
							break;
					}

					display.push();
					display.translate(po2X + boundoffx, 50, po2Y + boundoffy);
					display.rotateY(rotind2 * (PI / 2));
					if (pdim.tint) {
						display.tint(255, 150, 150);
					}
					pdim.boundary = 2.5;
					display.fill(0, 0, 255);
					display.noStroke();
					display.rect(-1 * (po1flip) * (pdim.physical_x / 2) + (-1 * pdim.boundary * po1flip), -50 + pdim.physical_y + pdim.boundary * (5 / 3), (po1flip) * (pdim.physical_x + pdim.boundary * 2), -1 * (pdim.physical_y + pdim.boundary * 2));
					display.pop();


					display.push();
					display.translate(po2X, 50, po2Y);
					display.rotateY(rotind2 * (PI / 2));
					if (pdim.tint) {
						display.tint(150, 150, 255);
					} //sure
					if (portal1coords[2] === 'NONE') {
						portal1.reset();
						portal1.clear();
						portal1.background(0, 0, 0);
					}
					display.image(portal1, -1 * (po1flip) * (pdim.physical_x / 2), -50 + pdim.physical_y, (po1flip) * pdim.physical_x, -pdim.physical_y);

					display.pop();
				}
				if (p1view) {
					var dirs = ['S', 'W', 'N', 'E'];
					var rotind = dirs.indexOf(po1DIR);
					var boundoffx = 0;
					var boundoffy = 0;
					switch (po1DIR) {
						case 'N':
							boundoffy = 0.5;
							break;
						case 'E':
							boundoffx = -0.5;
							break
						case 'S':
							boundoffy = -0.5;
							break;
						case 'W':
							boundoffx = 0.5;
							break;
					}

					display.push();
					display.translate(po1X + boundoffx, 50, po1Y + boundoffy);
					display.rotateY(rotind * (PI / 2));
					if (pdim.tint) {
						display.tint(255, 150, 150);
					}
					pdim.boundary = 2.5;
					display.fill(255, 0, 0);
					display.noStroke();
					display.rect(-1 * (po2flip) * (pdim.physical_x / 2) + (-1 * po2flip * pdim.boundary), -50 + pdim.physical_y + pdim.boundary * (5 / 3), (po2flip) * (pdim.physical_x + pdim.boundary * 2), -1 * (pdim.physical_y + pdim.boundary * 2));
					display.pop();

					display.push();
					display.translate(po1X, 50, po1Y);
					display.rotateY(rotind * (PI / 2));
					if (portal2coords[2] === 'NONE') {
						portal2.reset();
						portal2.clear();
						portal2.background(0, 0, 0);
					}
					display.image(portal2, -1 * (po2flip) * (pdim.physical_x / 2), -50 + pdim.physical_y, (po2flip) * pdim.physical_x, -1 * pdim.physical_y);
					display.pop();
				}
				//End Portal Handling <--not here you monkey

				//Begin Portal Teleport Handling
				var tpoffsetx = 0;
				var tpoffsety = 0;
				var tpampli = pdim.teleport_dist;
				var tpr = 0;
				var tpthisframe = false;
				if (dist(po1X, po1Y, x, y) < tpampli - 1 && !tpthisframe) {
					switch (portal2coords[2]) {
						case 'N':
							tpoffsety = -tpampli;
							break;
						case 'E':
							tpoffsetx = tpampli;
							break; //never eat soggy wheaties
						case 'S':// thank you drew so awesome and inspirting
							tpoffsety = tpampli; //ty i love being inspiritd
							break;
						case 'W':
							tpoffsetx = -tpampli;
							break;
					}
					//Find the angle of the player relative, add it to the angle of portal
					//Move player to the portal
					var cardinalAngles = ['E', 'S', "W", 'N']; //Angles shifted left bc East is 0 deg
					var angleRelative = (r - round(r / HALF_PI) * HALF_PI);//Sub by Modulo R by HALF_PI (90) and boom, relative angle
					var portalAngle = (cardinalAngles.indexOf(portal2coords[2]) * HALF_PI);//Get the cardinal portal angle to radians
					if (keys[83]) {
						r = portalAngle - angleRelative + PI;
					} else {
						r = portalAngle - angleRelative;
					}
					x = po2X + tpoffsetx;
					y = po2Y + tpoffsety;
					tpthisframe = true;
				}
				if (dist(po2X, po2Y, x, y) < tpampli - 1 && !tpthisframe) {
					switch (portal1coords[2]) {
						case 'N':
							tpoffsety = -tpampli;
							break;
						case 'E':
							tpoffsetx = tpampli;
							break; //never eat soggy wheaties
						case 'S':// thank you drew so awesome and inspirting
							tpoffsety = tpampli; //ty i love being inspiritd
							break;
						case 'W':
							tpoffsetx = -tpampli;
							break;
					}
					//Find the angle of the player relative, add it to the angle of portal
					//Move player to the portal
					var cardinalAngles = ['E', 'S', "W", 'N']; //Angles shifted left bc East is 0 deg
					var angleRelative = (r - round(r / HALF_PI) * HALF_PI);//Sub by Modulo R by HALF_PI (90) and boom, relative angle
					var portalAngle = (cardinalAngles.indexOf(portal1coords[2]) * HALF_PI);//Get the cardinal portal angle to radians
					if (keys[83]) {
						r = portalAngle - angleRelative + PI;
					} else {
						r = portalAngle - angleRelative;
					}
					x = po1X + tpoffsetx;
					y = po1Y + tpoffsety;
					tpthisframe = true;
				}
				//End Portal Teleport Handling

				var cardinalAngles = ['E', 'S', "W", 'N'];
				var convvv = 1 / conversionRadio / (4 / minimapscale);
				var p1rot = (cardinalAngles.indexOf(portal1coords[2]) * HALF_PI);
				var slope11 = (Math.sin(p1rot - coneFOV) * 250) / (Math.cos(p1rot - coneFOV) * 250);
				var slope12 = (Math.sin(p1rot + coneFOV) * 250) / (Math.cos(p1rot + coneFOV) * 250);
				minimap.strokeWeight(2.5);
				minimap.stroke(155, 0, 0);
				if (pdim.minimap) {
					minimap.line(po1X * convvv, po1Y * convvv, (po1X + Math.cos(p1rot - coneFOV) * 250) * convvv, (po1Y + Math.sin(p1rot - coneFOV) * 250) * convvv);
					minimap.line(po1X * convvv, po1Y * convvv, (po1X + Math.cos(p1rot + coneFOV) * 250) * convvv, (po1Y + Math.sin(p1rot + coneFOV) * 250) * convvv);
				}

				var p2rot = (cardinalAngles.indexOf(portal2coords[2]) * HALF_PI);
				var slope21 = (Math.sin(p2rot - coneFOV) * 250) / (Math.cos(p2rot - coneFOV) * 250);
				var slope22 = (Math.sin(p2rot + coneFOV) * 250) / (Math.cos(p2rot + coneFOV) * 250);
				minimap.strokeWeight(2.5);
				minimap.stroke(0, 0, 155);
				if (pdim.minimap) {
					minimap.line(po2X * convvv, po2Y * convvv, (po2X + Math.cos(p2rot - coneFOV) * 250) * convvv, (po2Y + Math.sin(p2rot - coneFOV) * 250) * convvv);
					minimap.line(po2X * convvv, po2Y * convvv, (po2X + Math.cos(p2rot + coneFOV) * 250) * convvv, (po2Y + Math.sin(p2rot + coneFOV) * 250) * convvv);
				}

				image(display, -(winlength / 2) * (zoom / constrain(zoommulti, zoomADS, 1)), -(winheight / 2) * (zoom / constrain(zoommulti, zoomADS, 1)), winlength * (zoom / constrain(zoommulti, zoomADS, 1)), winheight * (zoom / constrain(zoommulti, zoomADS, 1)));
				image(tmOverlay, -(winlength / 2) * (zoom / constrain(zoommulti, zoomADS, 1)), -(winheight / 2) * (zoom / constrain(zoommulti, zoomADS, 1)), winlength * (zoom / constrain(zoommulti, zoomADS, 1)), winheight * (zoom / constrain(zoommulti, zoomADS, 1)));
				image(gunOverlay, -(winlength / 2) * (zoom / constrain(zoommulti, zoomADS, 1)), -(winheight / 2) * (zoom / constrain(zoommulti, zoomADS, 1)), winlength * (zoom / constrain(zoommulti, zoomADS, 1)), winheight * (zoom / constrain(zoommulti, zoomADS, 1)));
				image(scoreOverlay, -50, -winheight / 2)
				display.reset();
				tmOverlay.reset();
				tmOverlay.clear();
				gunOverlay.clear();
				gunOverlay.reset();
				portal1.reset();
				portal1.clear();
				portal2.reset();
				portal2.clear();

				/**
				 * john you're a dipshit get this through your head
				 * 
				 * TWO_PI / TAU = 360deg
				 * PI = 180deg
				 * HALF_PI = 90deg
				 * QUARTER_PI = 45deg
				 */

				//BEGIN PORTAL KEY INDICATORS

				minimap.push()
				var idmsg = "Your ID is: " + socket.id
				var name = "Your name is: " + playername
				minimap.fill(255)
				minimap.stroke(0)
				minimap.textAlign(CENTER)
				//- (textWidth(idmsg) / 4)
				minimap.text(idmsg + "\n" + name, (winlength * (3 / 4)), winheight - 25)
				minimap.pop()

				//END PORTAL KEY INDICATORS

				renderWeaponHud();
				image(weaponOverlay, -winlength / 2, winheight / 2 - (100 / hudscale), 250 / hudscale, 100 / hudscale);
				weaponOverlay.reset();
				renderMinimap();
				if (debug) {
					debugtext(round(deltaTime) + ":" + round(localDelta) + "\n" + po1X + ":" + po1Y + "\n" + po1Angle + "\n" + r + "\n" + round(r / HALF_PI) * HALF_PI + "\n" + (r - round(r / HALF_PI) * HALF_PI) + "\n" + u);
				}
				image(minimap, -winlength / 2, -winheight / 2);
				minimap.clear();
				minimap.reset();
				fill(0, 0, 0, 255 * (deathfade / 100))
				rect(-winlength / 2, -winheight / 2, winlength, winheight);
				finalizeKeys();

				if (logging.length > 0 && frameCount % 10 === 1) {
					var log_message = "";
					for (var i = 0; i < logging.length; i++) {
						log_message += "\n" + logging[i];
					}
					logging = [];
					socket.emit('log', { log: log_message });
				}
				if (frameCount > 50 && socket.id === undefined) {
					page = "server_closed"
				}
			} catch (err) {
				background(255, 0, 255)
				fill(0, 0, 0);
				textSize(15);
				textFont(font_cache[0])
				text(err + "\nIn draw loop", -winlength / 2, 0);
				rect(-50, 100, 100, 100)
				socket.emit('log', { log: socket.id + " threw " + err })
			}
			break;
		case "server_closed":
			background(255, 255, 255);
			textSize(25);
			textAlign(CENTER);
			fill(0, 0, 0);
			noStroke();
			text("Connection Lost", 0, -winheight / 3);
			textSize(18.5);

			var refresh_anim_speed = 150;
			var tack_on_dots;
			if (frameCount % refresh_anim_speed < refresh_anim_speed / 4) {
				tack_on_dots = "";
			} else if (frameCount % refresh_anim_speed < (refresh_anim_speed / 4) * 2 && frameCount % refresh_anim_speed > refresh_anim_speed / 4) {
				tack_on_dots = ".";
			} else if (frameCount % refresh_anim_speed < (refresh_anim_speed / 4) * 3 && frameCount % refresh_anim_speed > (refresh_anim_speed / 4) * 2) {
				tack_on_dots = "..";
			} else {
				tack_on_dots = "...";
			}
			text("We are trying to reconnect you and will be back shortly!\nPlease Wait" + tack_on_dots + "\n\nThe page will auto-refresh once they are back up :)", 0, -winheight / 4);
			if (socket.id !== undefined && !closed_attempted_reload) {
				location.reload();
				closed_attempted_reload = true;
			}
			break;
		default:
			background(255, 255, 255);
			textSize(25);
			textAlign(CENTER);
			fill(0, 0, 0);
			noStroke();
			text("Page " + page + " doesn't exist. Are you lost?", 0, -winheight / 3);
			break;
	}
}//2.4k lines we get no bitches