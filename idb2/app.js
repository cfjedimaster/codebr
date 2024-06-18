document.addEventListener('DOMContentLoaded', init, false);

let db;
let $titleField, $ingredientsField, $directionsField, $saveRecipeBtn, $recipeListDiv, $recipeIdField, $titleFilterField;

async function init() {

	$titleField = document.querySelector('#title');
	$ingredientsField = document.querySelector('#ingredients');
	$directionsField = document.querySelector('#directions');
	$saveRecipeBtn = document.querySelector('#saveRecipe');
	$recipeListDiv = document.querySelector('#recipeList');
	$recipeIdField = document.querySelector('#recipeId');
	$titleFilterField = document.querySelector('#titleFilter');

	db = await getDatabase();
	console.log('got my db', db);

	$saveRecipeBtn.addEventListener('click', saveRecipe);

	$titleFilterField.addEventListener('input', filterRecipes);

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
			let store = db.createObjectStore('recipes', {keyPath:'id', autoIncrement:true});
			store.createIndex('recipetitles','title');
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
		let recipeId = $recipeIdField.value;
		console.log(title, ingredients, directions, recipeId);

		let transaction = db.transaction(['recipes'],'readwrite');
		
		transaction.onerror = e => {
			reject(e);
		};

		transaction.oncomplete = e => {
			console.log('oncomplete', e);
			$titleField.value = '';
			$ingredientsField.value = '';
			$directionsField.value = '';
			$recipeIdField.value = '';
			renderRecipes();
			resolve();
		};

		let recipeStore = transaction.objectStore('recipes');
		
		let recipe = {
			title, 
			ingredients, 
			directions
		}
		
		if(recipeId !== '') recipe.id = parseInt(recipeId,10);

		recipeStore.put(recipe);
	});
}

async function renderRecipes(filter='') {
	console.log('will filter with', filter);
	let recipes = await getRecipes(filter);
	console.log('recipes',recipes);
	let s = '<h2>Recipes</h2><ul>';

	recipes.forEach(r => {
		s += `<li>${r.title} <button onclick="editRecipe(${r.id})">[Edit]</button> <button onclick="deleteRecipe(${r.id})">[Delete!]</button></li>`;
	});

	s += '</ul>';
	$recipeListDiv.innerHTML = s;
}

async function editRecipe(id) {
	console.log('edit', id);
	let recipe = await getRecipe(id);
	console.log(recipe);

	$titleField.value = recipe.title;
	$ingredientsField.value = recipe.ingredients;
	$directionsField.value = recipe.directions;
	$recipeIdField.value = recipe.id;


}

async function getRecipe(id) {
	return new Promise((resolve, reject) => {
		let transaction = db.transaction(['recipes'],'readonly');
		transaction.onerror = e => {
			reject(e);
		};

		let store = transaction.objectStore('recipes');
		let request = store.get(id);
		request.onsuccess = e => {
			resolve(e.target.result);
		};
	});
}

async function deleteRecipe(id) {
	console.log('delete', id);
	return new Promise((resolve, reject) => {

		let transaction = db.transaction(['recipes'],'readwrite');

		transaction.oncomplete = e => {
			renderRecipes();
			resolve();
		};

		transaction.onerror = e => {
			reject(e);
		};

		let store = transaction.objectStore('recipes');
		store.delete(id);

	});
}

async function getRecipes(filter='') {
	return new Promise((resolve, reject) => {
		let transaction = db.transaction(['recipes'],'readonly');
		transaction.onerror = e => {
			reject(e);
		};

		let store = transaction.objectStore('recipes');
		let request;

		if(filter=='') {
			request = store.getAll();

			request.onsuccess = e => {
				resolve(e.target.result);
			};

		} else {
			/*
			filter = coo
			cooa cooZ
			*/
			let index = store.index('recipetitles');
			let range = IDBKeyRange.bound(filter + 'a', filter + 'z');
			console.log('doing a range', range);
			let result = [];

			index.openCursor(range).onsuccess = (event) => {
				const cursor = event.target.result;
				if (cursor) {
					console.log('got a cursor', cursor);
					result.push(cursor.value);
					cursor.continue();
				} else {
					resolve(result);
				}
			}
		}

	});
}

async function filterRecipes() {
	let filter = $titleFilterField.value;
	console.log('filter on', filter);
	renderRecipes(filter);
}