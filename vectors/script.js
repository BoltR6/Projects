var vectors = [
	[5,15,'?','?'],
	[-5,-21.5,'?','?'],
	[-17.5,17.5,'?','?'],
	[1.5,-7.5,'?','?']
];
var globalunit = 'm';
var finalcalc = false;

function ntan(num){
	return Math.atan(num)*57.2958;
}
function setup() {
	angleMode(DEGREES)
  createCanvas(windowWidth,windowHeight);
  background(255);
}
function draw() {
	var totalx = 0;
	var totaly = 0;
  background(255);
	stroke(0,0,0);
	strokeWeight(1);
	line(windowWidth/2,0,windowWidth/2,windowHeight);
	line(0,windowHeight/2,windowWidth,windowHeight/2);

	push();
	translate(windowWidth/2,windowHeight/2);
	scale(5,-5);
	for(var i = 0;i < vectors.length;i ++){
		if(vectors[i][2] !== undefined && vectors[i][3] !== undefined){
			var determineangle = ntan(vectors[i][1]/vectors[i][0]);
			if(vectors[i][0] < 0){
				determineangle += 180;
			}else if(vectors[i][1] < 0){
				determineangle += 360;
			}
			vectors[i][2] = determineangle;
			vectors[i][3] = Math.sqrt(Math.pow(vectors[i][0],2)+Math.pow(vectors[i][1],2));
		}

		totalx += vectors[i][0];
		totaly += vectors[i][1];
		push();
			stroke(0,0,0);
			strokeWeight(1);
			line(0,0,vectors[i][0],vectors[i][1]);

			if(i !== vectors.length-1){
				stroke(255,0,0);
			}else{
				stroke(0,255,0);
			}
			strokeWeight(2);
			point(vectors[i][0],vectors[i][1])

			push()
				var ra = round(vectors[i][2]*100)/100;
				var rl = round(vectors[i][3]*100)/100;
				var rm = vectors[i][4];

				translate(vectors[i][0]+2.5,vectors[i][1]+2.5);
				scale(0.2,-0.2)
					noStroke();
					fill(255)
					stroke(0)
					strokeWeight(1.5);
					textSize(15);
				text(ra+"º  "+rl+globalunit,0,0)
			pop()
		pop();
	}
	pop;

	if(!finalcalc){
		vectors.push([totalx,totaly,'?','?'])
		finalcalc = true;
	}
}
