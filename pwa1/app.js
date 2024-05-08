document.addEventListener('DOMContentLoaded', init, false);

let $div;

async function init() {
	console.log('hello world');
	$div = document.querySelector('#joke');
	getJoke();

	document.querySelector('#jokeBtn').addEventListener('click', getJoke, false);

	registerServiceWorker();
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

async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        scope: "/",
      });
      if (registration.installing) {
        console.log("Service worker installing");
      } else if (registration.waiting) {
        console.log("Service worker installed");
      } else if (registration.active) {
        console.log("Service worker active");
      }
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
};


