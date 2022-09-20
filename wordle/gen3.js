console.log('Reading Memory...')
console.time('Init')
const fs = require('fs');
const FULL = fs.readFileSync('possible.txt', 'utf8').split('\n');
const FULLLENGTH = FULL.length;
const YES_AT = JSON.parse(fs.readFileSync('data/yesat.txt'));
const NO_AT = JSON.parse(fs.readFileSync('data/noat.txt'));
const YES = JSON.parse(fs.readFileSync('data/yes.txt'));
const NO = JSON.parse(fs.readFileSync('data/no.txt'));
const ALL = JSON.parse(fs.readFileSync('data/all.txt'));
console.timeEnd('Init')

var improvement = {
	YES_AT: 0,
	NO_AT: 0,
	NEW: 0,
}
/**
let options = {};
for(var i = 0;i < 26;i++){
	for(var g = 0;g < 5;g++){
		let key = "abcdefghijklmnopqrstuvwxyz"[i]+g;
		options[key] = FULL.filter(i => i[g] != key[0]);
	}
}
console.log(options)
fs.writeFileSync('noat.txt',JSON.stringify(options));
**/

function wordsLeft(wordList, params){
	let wordReturn = wordList; 
	let key = params.yes+"|"+params.no+"|"+params.yes_at+"|"+params.no_at; 
	if(!ALL[key]){
	if(params.yes_at.length > 0){
		if(params.yes_at.length > 1){
			if(!YES_AT[params.yes_at]){
				YES_AT[params.yes_at] = FULL.filter(i => {
					try{
						params.yes_at.forEach(letter => {
							if(i[letter[1]*1] != letter[0]){
								throw '';
							}
						})
						return true;
					}catch (e){
						return false;
					}
				});
				improvement.YES_AT++;
			}else{
				wordReturn = YES_AT[params.yes_at];
			}
		}else{
			wordReturn = YES_AT[params.yes_at[0]];
			params.yes_at.splice(0,1);
		}
	}else if(params.no_at.length > 0){
		if(params.no_at.length > 1){
			if(!NO_AT[params.no_at]){
				NO_AT[params.no_at] = FULL.filter(i => {
					try{
						params.no_at.forEach(letter => {
							if(i[letter[1]*1] == letter[0]){
								throw '';
							}
						})
						return true;
					}catch (e){
						return false;
					}
				});
				improvement.NO_AT++;
			}else{
				wordReturn = NO_AT[params.no_at];
			}
		}else{
			wordReturn = NO_AT[params.no_at[0]];
			params.no_at.splice(0,1);
		}
	}else if(params.yes.length > 0){
			wordReturn = YES[params.yes[0]];
			params.yes.splice(0,1);
	}else if(params.no.length > 0){
		wordReturn = NO[params.no[0]];
		params.no.splice(0,1);
	}
	wordReturn = wordReturn.filter(word => {
		try{
			//Check that each 'Yes At:' works
			params.yes_at.forEach(letter => {
				if(word[letter[1]*1] != letter[0]){
					throw '';
				}
			})
			//Check that each 'No At:' works
			params.no_at.forEach(letter => {
				if(word[letter[1]*1] == letter[0]){
					throw '';
				}
			})
		}catch (e){
			return false;
		}
		//Asserts that it has none of 'No' and has all 'Yes'
		let checkYes = new RegExp(params.yes.join('|'),'g');
		let checkNo = new RegExp(params.no.join('|'),'g');
		if(
			!(params.no.length > 0 && checkNo.test(word)) && 				!(params.yes.length > 0 && !checkYes.test(word))
		){
			return true;
		}else{
			return false;
		}
	});
		ALL[key] = wordReturn;
		improvement.NEW++;
		return wordReturn;
	}else{
		return ALL[key];
	}
}
function wordleTest(word, answer){
	let data = {
		yes: [],
		no: [],
		yes_at: [],
		no_at: [],
	}
	word.forEach((letter, index) => {
		if(letter == answer[index]){
			data.yes_at.push(letter+index);
		}else if(answer.includes(letter)){
			if(!data.yes.includes(letter)){
				data.yes.push(letter);
			}
			data.no_at.push(letter+index);
		}else{
			if(!data.no.includes(letter)){
				data.no.push(letter);
			}
		}
	});
	data.yes = data.yes.sort();
	data.no = data.no.sort();
	data.yes_at = data.yes_at.sort();
	data.no_at = data.no_at.sort();
	return data;
}
function scoreWord(word, list, len){
	let score = 0;
	console.log('')
	process.stdout.write('[')
	list.forEach((l,i) => {
		let chars = wordleTest(word.split(''),list[i].split(''));
		score += wordsLeft(FULL, chars).length / len;
		if(i % Math.ceil(len/10) == 0){
			process.stdout.write('|')
		}
	});
	process.stdout.write(']')
	console.log(improvement)
	return 100-((score / len)*100)+"%";
}
let testList = [...FULL.slice(0,172)];
testList.forEach((i,ind)=>{
	console.time('Entry')
	console.log(i + " (" + ind + "/170 ): " + scoreWord(i,FULL, FULLLENGTH));
	console.timeEnd('Entry')
})

//Finalize data
if(improvement != {YES_AT:0,NO_AT:0,NEW:0}){
	console.time('Done')
	console.log('\nWriting New Data...')
	if(improvement.NEW > 0){
		fs.writeFileSync('all.txt',JSON.stringify(ALL));
	}
	if(improvement.YES_AT > 0){
		fs.writeFileSync('yesat.txt',JSON.stringify(YES_AT));
	}
	if(improvement.NO_AT > 0){
		fs.writeFileSync('noat.txt',JSON.stringify(NO_AT));
	}
	console.timeEnd('Done')
}