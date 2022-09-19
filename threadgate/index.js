/**   Server Commands
 * kick (user index)      | Kicks player
 * read (lobby index)     | Prints the log of a lobby
 * write (msg)            | Prints a message to log
 * clear                  | Clears additional logs
 * say (msg)              | Say something to everyone
 * sayto (lobby) (msg)    | Say something to a lobby
 */

/**   Printing Nomenclature 
 * log_to_events(lobby_index,msg) prints message
 * log_to_events(null,false) will refresh console
 * addendum_events.push(msg) will write to server log
 */

var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var readline = require("readline");
var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});
var version = "1.84";

var events = [];
var addendum_events = [];
var user_ids = [];
var display_log_limit = 5;

var lobbies = [];
var maxlobby = 12;
var teams = ["Red", "Blue"];

function log_to_events(index, event_msg) {
	if (event_msg !== false) { //False means to auto-refresh
		try {
			events[index].push(event_msg);//Try to add message
		} catch (err) {
			events.push([event_msg]);//Otherwise create an index, then add message
		}
	} else {
		events[index] = [];//If false, auto-refresh
	}
	process.stdout.write('\u001B[2J\u001B[0;0f');//Clear console using escape chars

	for (var i = 0; i < events.length; i++) {//For each LOBBY event hierachy
		if (i !== 0) {
			console.log("")//Add a space inbetween each lobby
		}

		console.log("	Lobby " + lobbies[i][0] + " | " + lobbies[i][1] + "/" + maxlobby + " players | " + lobbies[i][4][0] + " to " + lobbies[i][4][1]);//Create the banner with name, playercount, and score
		for (var g = 0; g < events[i].length; g++) {//For each message IN lobby event hiearch
			if (g > events[i].length - (display_log_limit + 1)) {//If it's one of the five newest messages
				console.log("		" + events[i][g]);//Write the message
			}
		}
	}

	for (var q = 0; q < addendum_events.length; q++) {
		if (q === 0) {
			console.log("\nAdditional Logs: ")
		}
		console.log("	" + addendum_events[q])
	}
}

var { Pool } = require('pg');
var store = new Pool({
	user: 'thread',
	host: 'sql.oberweis.dev',
	database: 'threadgate',
	password: 'threadgate',
	port: 5432,

})

function postQuery(text, data = "") { //This is to POST data to the database. It returns nothing.

	store.connect()
		.then(() => console.log("Connected to database"))
		.then(() => store.query(text, data))
		.catch(e => console.log(e))
		.finally(() => store.release())

}

function getQuery(text, data = "") { //This is to READ data from the database. !!DO NOT USE IT TO POST DATA!!
	var output;//OK!!! I WONT!!!!

	console.log(text)

	if (data != "") {
		console.log("Data was given")
		store.connect()
			.then(() => store.query(text, data))
			.then(res => output)
			.catch(e => console.log(e))
			.finally(() => store.release())
	} else {
		console.log("Data was not given")
		store.connect()
			.then(() => store.query(text))
			.then(res => output)
			.catch(e => console.log(e))
			.finally(() => store.release())
	}

	console.log(output)

	return output
}

function log(level, user, message) {
	var text = 'INSERT INTO log (level, time, "user", message) VALUES ($1, $2, $3, $4)'
	var date = new Date()
	var timestamp = date.getTime()
	var data = [level.toUpperCase(), timestamp, user, message]

	postQuery(text, data)
}

function storeFeedback(user, message) {
	var text = 'INSERT INTO reports ("user", time, message) VALUES ($1, $2, $3)'
	var date = new Date()
	var timestamp = date.getTime()
	var data = [user, timestamp, message]

	postQuery(text, data)
}

function fetchLogs(time = 600) { //Time = number of seconds in the past to go. Defaults to 10 minutes
	var text = 'SELECT * FROM log WHERE time > $1'
	var data = [time]
	var output = []

	if (time == -1) { //to get logs from all time
		text = 'SELECT * FROM log'
		output = getQuery(text)
	} else {
		output = getQuery(text, data)
	}
}

// log('debug', 'Server', 'The server is starting!')

// console.log("-----")
// console.log(fetchLogs(-1))
// console.log("-----")

// log('debug', 'Server', 'Hmm im stupid')

//STC = Server To Client
//CTS = Client to Server
//lobbies[lobbyindex][dataindex] = Overarching Rooms
//	lobbies[lobbyindex][0] = Room name
//	lobbies[lobbyindex][1] = Player Count
//	lobbies[lobbyindex][2] = Player Data
//	lobbies[lobbyindex][3] = Team Player Count
//	lobbies[lobbyindex][4] = Team Score
//	lobbies[lobbyindex][5] = Map Number
//maxlobby = Maximum Player Count

rl.on('line', (input) => {
	readline.moveCursor(process.stdout, 0, -1)
	readline.clearLine(process.stdout, 1)
	//console.log("Received: "+input);
	if (input.substring(0, 5) === 'read ') {
		try {
			var recieved_index = (input.substring(5, input.length) * 1);
			for (var u = 0; u < events[recieved_index].length; u++) {
				addendum_events.push(events[recieved_index][u]);
			}
			log_to_events(null, false);
		} catch (err) {
			console.log("Lobby does not exist." + err);
		}
	}else if (input.substring(0, 4) === 'say ') {
		io.emit('STCchat', { team: -1, player: -1, msg: input.substring(4, input.length), id: -1 });
		log_to_events(null, false);
	}else if (input.substring(0, 6) === 'sayto ') {
		var space_at_index;
		for (var i = 0; i < input.substring(6, input.length).length; i++) {
			if (input.substring(6, input.length)[i] === ' ') {
				space_at_index = i;
			}
		}
		try {
			io.to(input.substring(6, 6 + space_at_index)).emit('STCchat', { team: -1, player: -1, msg: input.substring(6 + space_at_index, input.length), id: -1 });
		} catch (err) {
			console.log("Lobby doesn't exist")
		}
		log_to_events(null, false);
	}else if (input.substring(0, 5) === 'clear') {
		addendum_events = [];
		log_to_events(null, false);
	}else if (input.substring(0, 6) === 'write ') {
		addendum_events.push(input.substring(6, input.length));
		log_to_events(null, false);
	}else if (input.substring(0, 5) === 'kick ') {
		try {
			var recieved_index = parseInt((input.substring(5, input.length)));
			user_ids[recieved_index][1] = true;
			console.log("Kicked player " + recieved_index)
		} catch (err) {
			console.log("User does not exist.");
		}
	}else{
		var space_index = input.length;
		for(var i = 0;i < input.length;i++){
			if(input[i] == ' '){
				space_index = i;
				break;
			}
		}
		addendum_events.push("Command " + input.substring(0,space_index) + " does not exist");
		log_to_events(null, false);
	}
});

app.use('/public', express.static(__dirname + '/public'));
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});
io.on('connection', function(socket) {
	var ready = false;
	//db.get("test").then(value => {
	//	db.set("test",value+"1").then(() => {});
	//});
	//db.get("test").then(value => {console.log(value)});

	//Begin Lobby Handling
	var joinind = -1;
	socket.on('CTSready', function() {
		if (lobbies.length === 0) {

			lobbies.push(["L-1", 0, [], [0, 0], [0, 0]]);
			joinind = 0;
			log_to_events(joinind, "Lobby L-1 created.")
		} else {
			for (var i = 0; i < lobbies.length; i++) {
				if (lobbies[i][1] < maxlobby) {
					joinind = i;
				}
			}
			if (joinind === -1) {
				lobbies.push(["L-" + (lobbies.length + 1), 0, [], [0, 0], [0, 0]]);
				joinind = lobbies.length - 1;
				log_to_events(joinind, "Lobby L-" + (lobbies.length) + " created.")
			}
		}
		if (lobbies[joinind][1] < maxlobby) {
			lobbies[joinind][1]++;
		} else {
			joinind++;
			console.log("Redirecting")
		}
		//End Lobby Handling



		//Begin Team Selection
		var smallerteam;
		if (lobbies[joinind][3][0] > lobbies[joinind][3][1]) {
			smallerteam = 1;
			lobbies[joinind][3][1]++;
		} else {
			smallerteam = 0;
			lobbies[joinind][3][0]++;
		}
		user_ids.push([socket.id, false]);
		//End Team Selection



		//Begin Join Handling
		//log_to_events("	Joined " + lobbies[joinind][0] + " on " + smallerteam + ". | " + lobbies[joinind][1] + "/" + maxlobby + " players. | " + socket.id + " "+(user_ids.length-1))
		socket.join(lobbies[joinind][0]);
		lobbies[joinind][2].push({
			id: socket.id,
			x: 150.5,
			y: 150.5,
			r: 0, //left,right rotation
			u: 0, //up,down rotation
			hp: 100, //player health
			w: 'UMP45', //player weapon
			h: 10, //height
			team: smallerteam,
			name: "¤",
			p1: [0, 0, "NONE"],
			p2: [0, 0, "NONE"],
			recieved_death_message: true,
			truly_connected: false,
			last_damage_tick: 0,
		});
		//End Join Handling

		ready = true;
	});

	//Begin CTS Handling
	socket.on('CTSgetver', function(data) {
		socket.emit('STCgivever', { ver: version });
	});
	socket.on('CTSaskscore', function(data) {
		if (ready) {
			socket.emit('STCscore', { score: lobbies[joinind][4] });
		}
	});
	socket.on('CTSdamage', function(data) {
		lobbies[joinind][2].forEach((player, ind) => {
			if (player.id === data.id) { // x,y,r,u,cheight
				lobbies[joinind][2][ind].hp -= data.damage;
				lobbies[joinind][2][ind].last_damage_tick = 60;
				lobbies[joinind][2][ind].who_shot = data.who_shot;
				//console.log(data.id + " took " + data.damage + " damage, they are " + lobbies[joinind][2][ind].hp + " hp." + lobbies[joinind][2][ind].who_shot +"\n"+data.who_shot);
			}
		});
		if (ready) {
			socket.emit('STCgivePlayers', { playerList: lobbies[joinind][2] });
		}
	});
	socket.on('CTSgetPlayers', function(data) {
		if (ready) {
			socket.emit('STCgivePlayers', { playerList: lobbies[joinind][2] });
		}
	});


	socket.on('CTSchat', function(data) {
		log_to_events(joinind, "[" + teams[data.team].toUpperCase() + "] " + data.player + ": " + data.msg)
		socket.broadcast.emit('STCchat', { team: data.team, player: data.player, msg: data.msg, id: data.id })
	})


	socket.on('CTSadd', function(data) {
		user_ids.forEach((itemin) => {
			if (itemin[0] === socket.id && itemin[1] === true) {
				log_to_events(joinind, socket.id + " was kicked")
				socket.disconnect();
			}
		});

		if (ready) {
			lobbies[joinind][2].forEach((player, ind) => {
				player.last_damage_tick -= 1;
				//addendum_events.push(player.last_damage_tick)
				//log_to_events(null,false);
				if (player.last_damage_tick < 0) {
					player.hp += 5;
					if (player.hp > 100) {
						player.hp = 100;
					}
				}
				if (player.id === socket.id) { // x,y,r,u,cheight
					lobbies[joinind][2][ind].x = data.description[0];
					lobbies[joinind][2][ind].y = data.description[1];
					lobbies[joinind][2][ind].r = data.description[2];
					lobbies[joinind][2][ind].u = data.description[3];
					lobbies[joinind][2][ind].h = data.description[4];
					lobbies[joinind][2][ind].name = data.description[5];
					lobbies[joinind][2][ind].p1 = data.description[6];
					lobbies[joinind][2][ind].p2 = data.description[7];
					lobbies[joinind][2][ind].recieved_death_message = data.description[9];
				}
				if (!player.truly_connected && player.name !== ("¤") && player.name !== undefined) {
					player.truly_connected = true;
					user_ids.forEach((player2, p2ind) => {
						if (player2[0] === player.id) {
							log_to_events(joinind, player.id + " [" + p2ind + "] fully connected")
						}
					});
				}
				if (lobbies[joinind][2][ind].recieved_death_message === 100) {
					lobbies[joinind][2][ind].x = 0;
					lobbies[joinind][2][ind].y = 0;
				}
				if (lobbies[joinind][2][ind].hp < 0) {
					lobbies[joinind][2][ind].recieved_death_message = false;
					lobbies[joinind][2][ind].hp = 100;
					var otherteam;
					if (lobbies[joinind][2][ind].team === 0) {
						otherteam = 1;
					} else {
						otherteam = 0;
					}
					lobbies[joinind][2][ind].x = -500;
					lobbies[joinind][2][ind].y = -500;
					lobbies[joinind][4][otherteam]++;
					var killed_by_name;
					var killed_by_id;
					lobbies[joinind][2].forEach((player2) => {
						if (player2.id === lobbies[joinind][2][ind].who_shot) {
							killed_by_name = player2.name;
							killed_by_id = player2.id;
						}
					});
					if (killed_by_name === undefined) {
						log_to_events(joinind, lobbies[joinind][2]);
					}
					var kill_message = (lobbies[joinind][2][ind].name + " killed by " + killed_by_name);
					socket.emit('STCkill', { chat_msg: ("		" + kill_message), id: killed_by_id, team: teams[otherteam] })
					socket.broadcast.emit('STCkill', { chat_msg: ("		" + kill_message), id: killed_by_id, team: teams[otherteam] })
					log_to_events(joinind, kill_message);
					//console.log("		Team " + teams[otherteam] + " scored");
				}

			});
		}
	});
	socket.on('CTSfireBullet', function(data) {
		socket.broadcast.emit('STCplayerFire', { firingPlayer: data.firingPlayer })
	});
	socket.on('CTSdbLog', function(data) {
		//data.event
		//data.level
		//data.user
		//data.message
		store.connect()

		store.query("INSERT ")
	})
	//End CTS Handling



	//Begin Server Logging
	socket.on('log', function(data) {
		log_to_events(joinind, data.log);
	});
	//End Server Logging



	//Begin Disconnect Handling
	socket.on('disconnect', function() {
		if (ready) {
			lobbies[joinind][1]--;
			lobbies[joinind][2].forEach((player, ind) => {
				if (player.id === socket.id) {
					lobbies[joinind][3][player.team]--;
					lobbies[joinind][2].splice(ind, 1);
					log_to_events(joinind, socket.id + " left");
				}
			});
			if (lobbies[joinind][1] <= 0) {
				log_to_events(joinind, "Lobby " + lobbies[joinind][0] + " closed.\n");
				log_to_events(joinind, false);
				//lobbies.splice(joinind, 1);
			}
		}
	});
	//End Disconnect Handling
});

http.listen(3000, function() {
	console.log('listening on *:3000 ' + __dirname);
});