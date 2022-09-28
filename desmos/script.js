var graph;
var current_function = "";
var points = {};
var lastX;
var lastY;
function f(xIn){
	var xIn = xIn < 0 ? "("+xIn+")" : xIn;
	var equation = current_function;
	equation = equation.replace(/cos/g,'c');// cos = c
	equation = equation.replace(/sin/g,'s');// sin = s
	equation = equation.replace(/(\d+)(x)/g,"$1*$2");// ~x = ~ * x
	equation = equation.replace(/\)\(/g,")*(");// ~)(~ = ~) * (~
	equation = equation.replace(/(\))(\d+|x)/g,"$1*$2");// )~ = ) * ~
	equation = equation.replace(/(\d+|x)(\()/g,"$1*$2");// ~( = ~ * (
	var ret = calc(equation.replace(/x/g,xIn));
	//noStroke();
	//text(current_function+"     "+ret,200,200);
	return ret;
}
function calc(e,pp) {
  let repeat = false;
  let chars = {'+':',"p",',
							 '-':',"m",',
							 '/':',"d",',
							 '*':',"t",',
							 '^':',"e",',
							 'c':',"c",',
							 's':',"s",',
							};
  let rchars = {
		',"p",':'+',
		',"m",':'-',
		',"d",':'/',
		',"t",':'*',
		',"e",':'^',
		',"c",':'c',
		',"s",':'s',
	};
  let par = {'(':'[',')':']'};
  function pr(t){
    console.log(('  '.repeat(pp))+t)
  }
  pr('INITIAL: '+e);
  e = e.replace(/\s/g,'');//Remove Whitespace
  e = e.replace(/\(|\)/g, m=>par[m]);//Make parenthesis brackets
  e = e.replace(/\+|\-|\/|\*|\^|c|s/g,m => chars[m]);//Make signs readable by code
  e = e[0] == ',' ? e.substring(1,e.length) : e;//Remove bad front comma
  e = e[e.length-1] == ',' ? e.substring(0,e.length-1) : e;//Remove bad back comma
  e = e.replace(/,,/g,',');//Remove bad double commas
  e = e.replace(/\[,/g,'[');//Remove bad post-bracket commas
  e = e.replace(/\,]/g,']');//Remove bad pre-bracket commas
  e = e.replace(/"m","m"/g,'"p"');//Remove double minus signs
  e[0] == e[0] == '"p"' ? '' : e[0];//Remove leading addition signs
  
  //let js turn the parenthesis into nested arrays
  pr("Pre-Parse: " + e);
  try{
    if(e[0] == '[' && e[e.length-1] == ']'){
      e = JSON.parse(e);
    }else{
      e = JSON.parse("["+e+"]")
    }
  }catch(err){
    console.log('hi');
    try{
    	e = JSON.parse("["+e+"]");
		}catch(err){
			return "ERR";
		}
  }
  pr("Pre-Work: " + e);
  
  //recursive, tackle the first parenthesis first
  e.forEach((i,ind) => {e[ind] = Array.isArray(i) ? calc(JSON.stringify(i).replace(/,"t",|,"d",|,"p",|,"m",/g,m=>rchars[m]),pp > 0 ? pp + 1 : 1) : i;});
	//deal with trig functions
	do{
    repeat = false;
    for(var i = 0;i < e.length;i++){
      if(e[i] == 'c'){
				console.log('*')
        let res = Math.cos(e[i+1]);
        e.splice(i,2,res);
        pr(" Cosine taken: "+e);
        repeat = true;
      }else if(e[i] == 's'){
				console.log('*')
        let res = Math.sin(e[i+1]);
        e.splice(i,2,res);
        pr(" Sin taken: "+e);
        repeat = true;
			}
    }
  }while(repeat == true);
	//deal with exponents
	do{
    repeat = false;
    for(var i = 0;i < e.length;i++){
      if(e[i] == 'e'){
				console.log('*')
        let res = Math.pow(e[i-1],e[i+1]);
        e.splice(i-1,3,res);
        pr(" Raised to Power: "+e);
        repeat = true;
      }
    }
  }while(repeat == true);
  //deal with multiplication and division
  do{
    repeat = false;
    for(var i = 0;i < e.length;i++){
      if(e[i] == 'd'){
        if(e[i+1] != 'm'){
            let res = e[i-1] / e[i+1];
            e.splice(i-1,3,res);
            pr(" Divided: "+e);
            repeat = true;
          }else{
          let res = e[i-1] / (-1 * e[i+2]);
          e.splice(i-1,4,res);
          pr(" Divided *: "+e);
          repeat = true;
        }
      }
      else if(e[i] == 't'){
        if(e[i+1] != 'm'){
          let res = e[i-1] * e[i+1];
          e.splice(i-1,3,res);
          pr(" Multiplied: "+e)
          repeat = true;
        }else{
          let res = e[i-1] * (-1*e[i+2]);
          e.splice(i-1,4,res);
          pr(" Multiplied *: "+e)
          repeat = true;
        }
      }
    }
  }while(repeat == true);
  //deal with addition and subtraction
  do{
    repeat = false;
    for(var i = 0;i < e.length;i++){
      if(e[i] == 'p'){
          if(e[i+1] !== 'm'){
            let res = e[i-1] + e[i+1];
            e.splice(i-1,3,res);
            pr(" Added: "+e);
            repeat = true;
          }else{
            let res = e[i-1] - e[i+2];
            e.splice(i-1,4,res);
            pr(" Added *: "+e);
            repeat = true;
          }
        }
      else if(e[i] == 'm'){
          if(i-1 < 0){
            let res = -e[i+1];
            e.splice(i,2,res);
            pr(" Subtracted: "+e);
            repeat = true;
          }else{
            let res = e[i-1] - e[i+1];
            e.splice(i-1,3,res);
            pr(" Subtracted *: "+e);
            repeat = true;
          }
        }
    }
  }while(repeat);
  pr('PRE-RETURN: '+e+'\n----------------')
  pr('FINAL: '+e[0])
  return e[0];
};
function plotPoint(x,y){
	push();
	strokeWeight(2);
	stroke(0);
	translate(graph.width/2 - graph.box.x, graph.height/2 - graph.box.y);
	point(x * graph.box.xScale, -y * graph.box.yScale);
	line(x * graph.box.xScale, -y * graph.box.yScale, lastX * graph.box.xScale, -lastY * graph.box.yScale);
	pop();
}
function graphLines(){
	stroke(0);
	strokeWeight(3);
	line(0-graph.box.x+graph.width/2,0,0-graph.box.x+graph.width/2,graph.height);
	line(0,0-graph.box.y+graph.height/2,graph.width,0-graph.box.y+graph.height/2);
	//X line
	for(var i = floor(graph.box.x / graph.box.xScale -graph.width/2);i < floor(graph.box.x / graph.box.xScale + graph.width/2);i+=1){
		if(i != 0){
			push();
			stroke(0);
			strokeWeight(2);
			translate(graph.width/2 - graph.box.x,graph.height/2 - graph.box.y);
			line(i * graph.box.xScale, -3,i * graph.box.xScale, 3);

			if(graph.box.xScale > 10 || graph.box.xScale < -10){
				fill(0);
				noStroke();
				textAlign(CENTER);
				text(i,i * graph.box.xScale,15);
			}
			pop();
		}
	}
	//Y line
	for(var i = floor(-graph.box.y / graph.box.yScale - graph.height/2);i < floor(-graph.box.y / graph.box.yScale + graph.height/2);i+=1){
		if(i != 0){
			push();
			stroke(0);
			strokeWeight(2);
			translate(graph.width/2 - graph.box.x,graph.height/2 - graph.box.y);
			line(-3, -i * graph.box.yScale, 3, -i * graph.box.yScale);

			if(graph.box.yScale > 10 || graph.box.yScale < -10){
				fill(0);
				noStroke();
				textAlign(CENTER);
				text(i,-12.5,-i * graph.box.yScale);
			}
			pop();
		}
	}
}

function mouseWheel(event){
	graph.box.xScale -= event.delta / 100;
	graph.box.yScale -= event.delta / 100;
}
function setup(){
	createCanvas(windowWidth,windowHeight);
	graph = {
		width: windowWidth,
		height: windowHeight,
		box: {
			x: 0,
			y: 0,
			xScale: 15,
			yScale: 15,
		}
	}
}
function draw(){
	if(mouseIsPressed){
		graph.box.x -= movedX;
		graph.box.y -= movedY;
	}
	background(255,255,255);
	noStroke();
	fill(0);
	textAlign(LEFT);
	text("Your Function: "+document.getElementById("func").value,20,30);
	text("Viewport: (" + graph.box.x + "," + graph.box.y + ")",20,55);
	text("Scale: " + graph.box.xScale + "x" + graph.box.yScale,20,70);
	
	graphLines();
	//point plotting
	if(document.getElementById("func").value != current_function){
		current_function = document.getElementById("func").value;
		points = {};
		for(var i = floor(graph.box.x / graph.box.xScale -graph.width/2)*3;i < floor(graph.box.x / graph.box.xScale + graph.width/2)*3;i+=0.5){
			var search = points[i];
			var calcdVal = "no";
			if(search == undefined || search == null){
				calcdVal = f(i);
				points[i] = calcdVal;
				plotPoint(i,calcdVal);
				fill(255,0,0);
				rect(0,200,50,50);
				lastX = i;
				lastY = calcdVal;
			}else{
				plotPoint(i,search);
				lastX = i;
				lastY = search;
			}
		}
	}
	if(document.getElementById("func").value != "" ){
		lastX = "no";
		lastY = "no";
		for(var i = floor(graph.box.x / graph.box.xScale -graph.width/2);i < floor(graph.box.x / graph.box.xScale + graph.width/2);i+=0.5){
			var search = points[i];
			var calcdVal = "no";
			if(search == undefined || search == null){
				calcdVal = f(i);
				points[i] = calcdVal;
				plotPoint(i,calcdVal);
				fill(255,0,0);
				rect(0,200,50,50);
				lastX = i;
				lastY = calcdVal;
			}else{
				plotPoint(i,search);
				lastX = i;
				lastY = search;
			}
		}
	}
}
//   John W
