export default async function () {

	let catReq = await fetch('https://swapi.dev/api/films');
	let cats = await catReq.json();
	//console.log(cats);
	return cats.results;
}