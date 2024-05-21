/*
offline joke credit: https://github.com/yesinteractive/dadjokes/blob/master/controllers/jokes.txt
*/
let offLineJokes = `What did one pirate say to the other when he beat him at chess?<>Checkmatey.
I burned 2000 calories today<>I left my food in the oven for too long.
I startled my next-door neighbor with my new electric power tool. <>I had to calm him down by saying "Don't worry, this is just a drill!"
I broke my arm in two places. <>My doctor told me to stop going to those places.
I quit my job at the coffee shop the other day. <>It was just the same old grind over and over.
I never buy anything that has Velcro with it...<>it's a total rip-off.
I used to work at a soft drink can crushing company...<>it was soda pressing.
I wondered why the frisbee kept on getting bigger. <>Then it hit me.
I was going to tell you a fighting joke...<>but I forgot the punch line.
What is the most groundbreaking invention of all time? <>The shovel. 
I'm starting my new job at a restaurant next week. <>I can't wait.
I visited a weight loss website...<>they told me I have to have cookies disabled.
Did you hear about the famous Italian chef that recently died? <>He pasta way.
Broken guitar for sale<>no strings attached.
I could never be a plumber<>it's too hard watching your life's work go down the drain.
I cut my finger slicing cheese the other day...<>but I think I may have grater problems than that.
What time did you go to the dentist yesterday?<>Tooth-hurty.`;


document.addEventListener('DOMContentLoaded', init, false);

let $div;

async function init() {
	console.log('hello world');
	$div = document.querySelector('#joke');

  offLineJokes = offLineJokes.replaceAll('<>',' ').split('\n');

	getJoke();

	document.querySelector('#jokeBtn').addEventListener('click', getJoke, false);

	registerServiceWorker();
}

async function getJoke() {
	$div.innerHTML = '<i>Loading awesomeness...</i>';
  if(navigator.onLine) {
    let req = await fetch('https://icanhazdadjoke.com/', {
      headers: {
        'Accept':'application/json'
      }
    });
    let result = await req.json();
    $div.innerHTML = result.joke;
  } else {
    let joke = offLineJokes[getRandomInt(0, offLineJokes.length)];
    $div.innerHTML = joke;
  }
}

function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); 
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


