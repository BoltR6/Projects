const fs = require('fs');
const FULL = fs.readFileSync('possible.txt', 'utf8').split('\n');
const FULLLENGTH = FULL.length;
const YES_AT = JSON.parse(fs.readFileSync('yesat.txt'));
const NO_AT = JSON.parse(fs.readFileSync('noat.txt'));
const YES = JSON.parse(fs.readFileSync('yes.txt'));
const NO = JSON.parse(fs.readFileSync('no.txt'));

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
	return wordList.filter(word => {
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
	return data;
}
function scoreWord(word, list, len){
	let score = 0;
	list.forEach((l,i) => {
		let chars = wordleTest(word.split(''),list[i].split(''));
		score += len / wordsLeft(FULL, chars).length;
		console.time("Per Thousand")
		if(i % Math.floor(len/1000) == 0){
			console.log((i/len*100)+'%')
			console.timeEnd("Per Thousand");
		}
	});
	return score;
}
console.log(scoreWord('hello',FULL, FULLLENGTH))