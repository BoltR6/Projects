const fs = require('fs');
const full = fs.readFileSync('possible.txt', 'utf8').split('\n');
let first = full;
let no = ['c','a','n','p','o','s','u','t'];
let yes = [];
let yes_at = ['r1','e4','i2'];
let no_at = [];
function most_common_letters(arr) {
	let letters = 'abcdefghijklmnopqrstuvwxyz'.split('').map(i => i.split(''));
	letters.forEach((i, ind) => {
		letters[ind][1] = 0;
	})
	for (var i = 0; i < arr.length; i++) {
		for (var g = 0; g < arr[i].length; g++) {
			if ('abcdefghijklmnopqrstuvwxyz'.includes(arr[i][g])) {
				let ind = 'abcdefghijklmnopqrstuvwxyz'.indexOf(arr[i][g]);
				letters[ind][1]++;
			}
		}
	}
	return letters;
}
console.time('Most Common Runtime');
console.log(most_common_letters(full));
console.timeEnd('Most Common Runtime');

function sort_for_middle(arr){
	let best = [];
	best.push(arr[0]);
	for(var i = 1;i < arr.length;i++){
		for(var g = 0;g < best.length;g++){
			if(arr[i][1] < best[g][1]){
				best = [...best.slice(0,g),arr[i],...best.slice(g)]
				break;
			}
			if(g == best.length-1){
				best.push(arr[i]);
				break;
			}
		}
	}
	return best.map(i => i[0]);
}
console.time('Best Letters');
let scale = sort_for_middle(most_common_letters(full))
console.log(scale);
console.timeEnd('Best Letters');
let word = "hello";
let score = 0;

console.log(score)
function first_word(arr,rating){
	let ret = [];
	arr.forEach(j=>{
		if(new Set(j).size == j.length){
		let score = 0;
		for(var i = 0;i < j.length;i++){
			/**
				Most Consistent
			score += Math.floor(scale.length/2)-Math.abs(scale.indexOf(j[i])-Math.floor(scale.length/2));
			**/
			score += scale.indexOf(j[i]);
		};
		if(ret.length == 0 || score == ret[0][1]){
			ret.push([j,score]);
		}else if(score > ret[0][1]){
			ret = [[j,score]];
		}
		}
	});
	return ret;
}


console.time('Most Efficient Word');
console.log(first_word(first, scale));
console.timeEnd('Most Efficient Word');

console.time('Find Word')
for (var i = 0; i < first.length; i++) {
	if (first[i].replace(new RegExp(no.join('|'), 'g'), '-').includes('-')) {
		first.splice(i, 1);
		i--;
	} else {
		let stop = false;
		if (!stop) {
			yes_at.forEach(j => {
				if (!stop) {
					if (first[i][j[1] * 1] !== j[0]) {
						first.splice(i, 1);
						i--;
						stop = true;
					}
				}
			});
		}
		if (!stop) {
			no_at.forEach(j => {
				if (!stop) {
					if (first[i][j[1] * 1] == j[0]) {
						first.splice(i, 1);
						i--;
						stop = true;
					}
				}
			});
		}
		yes.forEach(k => {
			if (!stop) {
				if (!first[i].includes(k)) {
					first.splice(i, 1);
					i--;
					stop = true;
				}
			}
		});
	}
}
console.log(first)
console.timeEnd('Find Word')

let scale2 = sort_for_middle(most_common_letters(first))
console.log(first_word(first,scale));