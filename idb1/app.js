document.addEventListener('DOMContentLoaded', init, false);

let db;
let $titleField, $ingredientsField, $directionsField, $saveRecipeBtn, $recipeListDiv;

async function init() {

	$titleField = document.querySelector('#title');
	$ingredientsField = document.querySelector('#ingredients');
	$directionsField = document.querySelector('#directions');
	$saveRecipeBtn = document.querySelector('#saveRecipe');
	$recipeListDiv = document.querySelector('#recipeList');

	db = await getDatabase();
	console.log('got my db', db);

	$saveRecipeBtn.addEventListener('click', saveRecipe);

	renderRecipes();
}

async function getDatabase() {
	console.log('getDb');

	return new Promise((resolve, reject) => {
		let request = indexedDB.open('recipes', 1);

		request.onerror = e => {
			console.error('Error opening DB', e);
			reject(e);
		};

		request.onupgradeneeded = e => {
			console.log('onupgradeneeded');

			let db = e.target.result;
			db.createObjectStore('recipes', {keyPath:'id', autoIncrement:true});
		};

		request.onsuccess = e => {
			console.log('onsuccess');
			resolve(e.target.result);
		};
	});
}

async function saveRecipe(e) {
	return new Promise((resolve, reject) => {
		e.preventDefault();
		let title = $titleField.value;
		let ingredients = $ingredientsField.value;
		let directions = $directionsField.value;
		console.log(title, ingredients, directions);

		let transaction = db.transaction(['recipes'],'readwrite');
		
		transaction.onerror = e => {
			reject(e);
		};

		transaction.oncomplete = e => {
			console.log('oncomplete', e);
			$titleField.value = '';
			$ingredientsField.value = '';
			$directionsField.value = '';
			renderRecipes();
			resolve();
		};

		let recipeStore = transaction.objectStore('recipes');
		
		let recipe = {
			title, 
			ingredients, 
			directions
		}
		
		recipeStore.put(recipe);
	});
}

async function renderRecipes() {
	let recipes = await getRecipes();
	console.log('recipes',recipes);
	let s = '<h2>Recipes</h2><ul>';

	recipes.forEach(r => {
		s += `<li>${r.title}</li>`;
	});

	s += '</ul>';
	$recipeListDiv.innerHTML = s;
}

async function getRecipes() {
	return new Promise((resolve, reject) => {
		let transaction = db.transaction(['recipes'],'readonly');
		transaction.onerror = e => {
			reject(e);
		};

		let store = transaction.objectStore('recipes');
		let request = store.getAll();
		request.onsuccess = e => {
			resolve(e.target.result);
		};
	});
}