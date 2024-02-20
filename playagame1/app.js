
const OPTION_LIST = ['rock', 'paper', 'scissors'];
let $result;
let games = 0;
let won = 0;

document.addEventListener('DOMContentLoaded', init, false);

async function init() {
	console.log('init');
	document.querySelector('#startGame').addEventListener('click', startGame, false);
	$result = document.querySelector('p#outcome');
}

function startGame() {
	console.log('clicked start');
	// hide the initial intro state
	document.querySelector('#introState').style['display'] = 'none';
	document.querySelector('#playState').style['display'] = 'block';

	let buttons = document.querySelectorAll('p.buttonRow button');
	buttons.forEach(b => {
		b.addEventListener('click', playerChose, false);
	});

}

function playerChose(e) {
	// Todo: Disable other buttons
	let chose = e.target.innerText.toLowerCase();
	console.log(chose);
	let pcChoice = OPTION_LIST[getRandomInt(0, 2)];
	console.log(pcChoice);
	
	let result = 'Win';
	if(chose === 'rock' && pcChoice === 'paper') result = 'Lost';
	if(chose === 'paper' && pcChoice === 'scissors') result = 'Lost';
	if(chose === 'scissors' && pcChoice === 'rock') result = 'Lost';
	if(chose === pcChoice ) result = 'Tie';

	games++;
	if(result === 'Win') won++;
	percentageWon = Math.floor(won/games * 100);

	$result.innerHTML = `
<p>
You chose ${chose}. The computer chose ${pcChoice}. The result for you is: <strong>${result}</strong>.
</p>
<p>
You have played ${games} game(s) and you have won ${won}. Your win/lose rate is ${percentageWon}%.
</p>
	`;

}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}