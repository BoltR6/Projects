var weapons = [
	GLOCK18C = {
		max: 15, //max ammo
		ammo: 15, //starting ammo
		rof: 2, //rate of fire
		reload: 10, //reload time
		name: "GLOCK-18C",
		semiauto: false,
		damage: 7,
		modelno: 1,
		modeloffset: [-275, 50, -65],
		modelrotate: [-1, 1.5, 2],
		modelscale: 1,
		fudge: 3,
		recoil: generateRecoil("GLOCK-18C", 3)
	},
	UMP45 = {
		max: 26, //max ammo
		ammo: 26, //starting ammo
		rof: 4.5, //rate of fire
		reload: 10, //reload time
		name: "UMP-45",
		semiauto: false,
		modelno: 0,
		modeloffset: [245, 242, 185],
		modelrotate: [0, 0.5, 1],
		modelscale: 1,
		damage: 15,
		fudge: 3,
		recoil: generateRecoil("UMP-45", 3)
	},
	M39 = {
		max: 30,
		ammo: 30,
		rof: 4,
		reload: 20,
		name: "M39",
		semiauto: true,
		modelno: 2,
		modeloffset: [550, 200, -400],
		modelrotate: [0.5, 0, 0],
		modelscale:0.2,
		fudge: 5,
		recoil: generateRecoil("M39", 5)
	},
	
	HEAVYRIFLE = {
		name: "Heavy Rifle",
		max: 6,
		ammo: 3,
		reload: 20,
		modelno: 2,
		modeloffset: [0, 0, 0],
		modelrotate: [0, 0.5, 1],
		modelscale: 1,
		fudge: 4,
		recoil: generateRecoil("HEAVYRIFLE", 4)
	}
];

function generateRecoil(weapon, fudge) {
	var recoilPatterns = {
		GLOCK18C: [ //each entry in the array will be moved through as bullets are fired
			[0, 0.5], //first value is x, second is y
			[-0.5, 1],
			[0.5, 1],
			[1, 1.5],
			[-0.5, 1.5],
			[-1, 1.5],
			[1, 1.5],
			[-1, 1.5],
			[1, 1.5],
			[-1.5, 1.5],
			[1.5, 1.5]
		],

		UMP45: [
			[0, 1.5],
			[3.0, 3.5],
			[1.0, 2.5],
			[-1.0, 2],
			[-2.0, 3],
			[-1.5, 2],
			[-1.0, 2],
			[-0.5, 2],
			[0, 2],
			[0.5, 2],
			[1, 2],
			[1, 3],
			[-1, 0.5],
			[0, 1.5],
			[3.0, 3.5],
			[1.0, 2.5],
			[-1.0, 2],
			[-2.0, 3],
			[-1.5, 2],
			[-1.0, 2],
			[-0.5, 2],
			[0, 2],
			[0.5, 2],
			[1, 2],
			[1, 3],
			[-1, 0.5],
		],

		M39: [
			[0, 5]
		],

		HEAVYRIFLE: [
			[1, 1],
			[0.75, 0.75],
			[1, 1]
		]
	}
	var defaultRecoil = [];
	var fudgedRecoil = [];
	switch (weapon) {
		case "GLOCK-18C":
			defaultRecoil = recoilPatterns.GLOCK18C;
		break;
		case "UMP-45":
			defaultRecoil = recoilPatterns.UMP45;
		break;
		case "M39":
			defaultRecoil = recoilPatterns.M39;
		break;
		default:
			// console.log(weapon + " doesn't have a recoil pattern.")
		break;
	}

	//expand the array to be the size of the weapon magazine if it isn't big enough
	//this is so that the fudging algorithm below it is able to make the recoil still a bit unpredictable

	if(defaultRecoil.length < weapon.max) { 
		var toGenerate = weapon.max - defaultRecoil.length

		for(var i = o; i > toGenerate; i++) {
			defaultRecoil.push(defaultRecoil[defaultRecoil.length - 1]) //i heard you like defaultRecoil
		}
	}

	for (var o = 0; o < defaultRecoil.length; o++) {
		var xFudge = (Math.floor(Math.random() * 10) / 10) * fudge
		var yFudge = (Math.floor(Math.random() * 10) / 10) * fudge

		//Determining the direction of the movement. true is up/right, false is down/left
		var xDir = 1;
		var yDir = 1;
		if (Math.random > 0.5) { xDir = -1 };
		if (Math.random > 0.5) { yDir = -1 };

		var newX = defaultRecoil[o][0] + (xFudge * xDir);
		var newY = defaultRecoil[o][1] + (yFudge * yDir);

		fudgedRecoil.push([newX, newY])

	}
	
	
	return fudgedRecoil;
}

/*How recoil patterns work:

-recoilPatterns is a dict storing arrays of arrays containing the recoil pattern specific to a weapon.
-when a weapon is selected, the generateRecoil() function is called. this takes the recoil pattern for the specific weapon, and "fudges" each value by a set amount to add some randomness.

*/

function getWeapon(name) {
	// console.log(weapons)
	for (var i = 0; i < weapons.length; i++) {
		if (weapons[i].name == name) {
			// console.log(weapons[i].name)
			return weapons[i]
		}
	}
	//if weapon does not exist, return the auto pistol
	return weapons[0]
}

