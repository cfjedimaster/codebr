const OPTION_LIST = ['rock', 'paper', 'scissors'];

document.addEventListener('alpine:init', () => {
  Alpine.data('app', () => ({
	introState:true,
	result:'',
	games:0, 
	won:0,
	startGame() {
		console.log('startGame clicked');
		this.introState = false;
	},
	playerPicked(chose) {
		console.log(`player chose, ${chose}`);
		let pcChoice = OPTION_LIST[getRandomInt(0, 2)];
		console.log(`pc chose ${pcChoice}`);

		let thisResult = 'Win';
		if(chose === 'rock' && pcChoice === 'paper') thisResult = 'Lost';
		if(chose === 'paper' && pcChoice === 'scissors') thisResult = 'Lost';
		if(chose === 'scissors' && pcChoice === 'rock') thisResult = 'Lost';
		if(chose === pcChoice ) thisResult = 'Tie';

		this.games++;
		if(thisResult === 'Win') this.won++;
		let percentageWon = Math.floor(this.won/this.games * 100);

		this.result = `<p>
You chose ${chose}. The computer chose ${pcChoice}. The result for you is: <strong>${thisResult}</strong>.
</p>

<p>
You have played ${this.games} game(s) and you have won ${this.won}. Your win/lose rate is ${percentageWon}%.
</p>

`;

	}
  }))
});

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}
