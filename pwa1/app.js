document.addEventListener('DOMContentLoaded', init, false);

let $div;

async function init() {
	console.log('hello world');
	$div = document.querySelector('#joke');
	getJoke();

	document.querySelector('#jokeBtn').addEventListener('click', getJoke, false);
}

async function getJoke() {
	$div.innerHTML = '<i>Loading awesomeness...</i>';
	let req = await fetch('https://icanhazdadjoke.com/', {
		headers: {
			'Accept':'application/json'
		}
	});
	let result = await req.json();
	$div.innerHTML = result.joke;
}