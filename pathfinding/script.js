var gmap = [
	[0, 0, 0, 0, 3, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 0, 1, 1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
];
var clicks = [];
var diag = false;
function keyPressed() {
	diag = !diag;
	path = pathFind(gmap, { diagonal: diag });
}
function mousePressed() {
	clicks[mouseButton] = true;
}
function onlyUnique(value, index, self) {
	return self.indexOf(value) === index;
}
function pathFind(_map, _options) {
	var queue = [];
	var tried = [];
	let found = 'nope';
	let paths = [];
	let steps = "";
	while (_map.length < _map[0].length) {
		let newrows = [];
		for (var i = 0; i < _map[0].length; i++) {
			newrows.push(0);
		}
		_map.push(newrows);
	}
	if (queue.length == 0) {
		for (var i = 0; i < _map.length; i++) {
			for (var g = 0; g < _map[0].length; g++) {
				if (_map[g][i] == 2) {
					queue.push({ x: i, y: g, counter: 0, last: null, start: 0 })
					paths.push([[i, g]]);
				}
			}
		}
	}
	var cycles = 0;
	if (_options.debug) {
		console.log('\nStarting Pathfind')
	}
	while (cycles < 1000000 && found == 'nope') {
		cycles++;
		let addto = [];
		for (var l = 0; l < queue.length; l++) {
			let item = queue[l];
			if (_map[item.y][item.x] == 3) {
				if (_options.debug) {
					if (_options.advanceddebug) {
						console.log(steps.substring(1, steps.length))
					}
					console.log('Found it in ' + item.counter + ' steps, ' + cycles + ' cycles, diagonals are ' + (_options.diagonal ? 'on' : 'off') + '.');
					if (_options.advanceddebug) {
						console.log(item);
					}
				}
				found = paths[item.start];
				break;
			} else {
				if (item.x > 0 && (_map[item.y][item.x - 1] == 0 || _map[item.y][item.x - 1] == 3) && item.last !== 1 && !tried.includes(item.x - 1 + '' + item.y)) {
					steps += ',<';
					addto.push({
						x: item.x - 1,
						y: item.y,
						counter: item.counter + 1,
						last: 0,
						start: paths.length,
					});
					paths.push([...paths[item.start], [item.x - 1, item.y]]);
					tried.push(item.x - 1 + '' + item.y);
				}
				if (item.x < _map[0].length && (_map[item.y][item.x + 1] == 0 || _map[item.y][item.x + 1] == 3) && item.last !== 0 && !tried.includes(item.x + 1 + '' + item.y)) {
					steps += ',>';
					addto.push({
						x: item.x + 1,
						y: item.y,
						counter: item.counter + 1,
						last: 1,
						start: paths.length,
					});
					paths.push([...paths[item.start], [item.x + 1, item.y]]);
					tried.push(item.x + 1 + '' + item.y);
				}
				if (item.y > 0 && (_map[item.y - 1][item.x] == 0 || _map[item.y - 1][item.x] == 3) && item.last !== 3 && !tried.includes(item.x + '' + item.y - 1)) {
					steps = ',^';
					addto.push({
						x: item.x,
						y: item.y - 1,
						counter: item.counter + 1,
						last: 2,
						start: paths.length,
					});
					paths.push([...paths[item.start], [item.x, item.y - 1]]);
					tried.push(item.x + '' + item.y - 1);
				}
				if (item.y < _map.length - 1 && (_map[item.y + 1][item.x] == 0 || _map[item.y + 1][item.x] == 3) && item.last !== 2 && !tried.includes(item.x + '' + item.y + 1)) {
					steps += ',v';
					addto.push({
						x: item.x,
						y: item.y + 1,
						counter: item.counter + 1,
						last: 3,
						start: paths.length,
					});
					paths.push([...paths[item.start], [item.x, item.y + 1]]);
					tried.push(item.x + '' + item.y + 1);
				}
				if (_options.diagonal) {
					if (item.x > 0 && item.y > 0 && (_map[item.y - 1][item.x - 1] == 0 || _map[item.y][item.x - 1] == 3) && item.last !== 6 && !tried.includes(item.x - 1 + '' + item.y)) {
						steps += ',<+^';
						addto.push({
							x: item.x - 1,
							y: item.y - 1,
							counter: item.counter + 1,
							last: 7,
							start: paths.length,
						});
						paths.push([...paths[item.start], [item.x - 1, item.y - 1]]);
						tried.push(item.x - 1 + '' + item.y - 1);
					}
					if (item.x < _map[0].length && item.y > 0 && (_map[item.y - 1][item.x + 1] == 0 || _map[item.y - 1][item.x + 1] == 3) && item.last !== 5 && !tried.includes(item.x + 1 + '' + item.y - 1)) {
						steps += ',>+^';
						addto.push({
							x: item.x + 1,
							y: item.y - 1,
							counter: item.counter + 1,
							last: 4,
							start: paths.length,
						});
						paths.push([...paths[item.start], [item.x + 1, item.y - 1]]);
						tried.push(item.x + 1 + '' + item.y - 1);
					}
					if (item.y < _map.length - 1 && item.x > 0 && (_map[item.y + 1][item.x - 1] == 0 || _map[item.y + 1][item.x - 1] == 3) && item.last !== 4 && !tried.includes(item.x - 1 + '' + item.y + 1)) {
						steps = ',<+v';
						addto.push({
							x: item.x - 1,
							y: item.y + 1,
							counter: item.counter + 1,
							last: 5,
							start: paths.length,
						});
						paths.push([...paths[item.start], [item.x - 1, item.y + 1]]);
						tried.push(item.x - 1 + '' + item.y + 1);
					}
					if (item.y < _map.length - 1 && item.x < _map[0].length && (_map[item.y + 1][item.x + 1] == 0 || _map[item.y + 1][item.x + 1] == 3) && item.last !== 7 && !tried.includes(item.x + 1 + '' + item.y + 1)) {
						steps += ',v+>';
						addto.push({
							x: item.x + 1,
							y: item.y + 1,
							counter: item.counter + 1,
							last: 6,
							start: paths.length,
						});
						paths.push([...paths[item.start], [item.x + 1, item.y + 1]]);
						tried.push(item.x + 1 + '' + item.y + 1);
					}
				}
			}
		}
		queue = addto.filter(onlyUnique);
		if (queue.length == 0 && found == 'nope') {
			if (_options.debug) {
				console.log("No Solution.\nTook " + (_options.time ? (performance.now() - _options.time) : performance.now()) + " ms.");
			}
			return -1;
		}
	}
	if (_options.debug) {
		console.log('Took ' + (_options.time ? (performance.now() - _options.time) : performance.now()) + ' ms.')
	}
	return found;
}
var path = pathFind(gmap, { diagonal: diag });
function setup() {
	createCanvas(windowWidth, windowHeight);
	background(255, 255, 255);
}
function draw() {
	background(255);
	let mult = {
		x: windowWidth / gmap[0].length,
		y: (windowHeight - 50) / gmap.length,
	}
	noStroke();
	for (var i = 0; i < gmap.length; i++) {
		for (var g = 0; g < gmap[i].length; g++) {
			switch (gmap[g][i]) {
				case 0:
					noFill();
					break;
				case 1:
					fill(125, 125, 125);
					break;
				case 2:
					fill(255, 0, 0);
					break;
				case 3:
					fill(0, 255, 0);
					break;
			}
			rect(i * mult.x, g * mult.y, mult.x + 1, mult.y + 1);
			if (mouseX > i * mult.x && mouseX < i * mult.x + mult.x && mouseY > g * mult.y && mouseY < g * mult.y + mult.y && clicks[LEFT]) {
				gmap[g][i] = (gmap[g][i] == 0) ? 1 : 0;
				path = pathFind(gmap, { diagonal: diag, debug: true, time: performance.now() });
			}
		}
	}
	for (let h = 0; h < path.length; h++) {
		fill(0, 0, 0);
		if (h !== path.length - 1) {
			stroke(0);
			strokeWeight(15);
			line(path[h][0] * mult.x + (mult.x * 0.5), path[h][1] * mult.y + (mult.y * 0.5), path[h + 1][0] * mult.x + (mult.x * 0.5), path[h + 1][1] * mult.y + (mult.y * 0.5));
			strokeWeight(0);
			noStroke();
		}
		//rect(path[h][0] * mult.x + (mult.x * 0.25), path[h][1] * mult.y + (mult.y * 0.25), mult.x / 2, mult.y / 2);
	}
	fill(200);
	rect(0, windowHeight - 50, windowWidth, 50);

	fill(50);
	noStroke();
	textSize(20);
	textAlign(CENTER);
	text("Press any Key for Diagonals", windowWidth / 2, windowHeight - 17);
	text(Math.round(deltaTime) + 'ms', 30.5, 21.5);
	clicks = [];
}
