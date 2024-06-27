document.addEventListener('DOMContentLoaded', init, false);

let db;
let $titleField, $durationField, $ingredientsField, $directionsField, $saveRecipeBtn, $recipeListDiv, $recipeIdField, $titleFilterField, $durationFilterField, $ingredientFilterField;

async function init() {

	$titleField = document.querySelector('#title');
	$durationField = document.querySelector('#duration');
	$ingredientsField = document.querySelector('#ingredients');
	$directionsField = document.querySelector('#directions');
	$saveRecipeBtn = document.querySelector('#saveRecipe');
	$recipeListDiv = document.querySelector('#recipeList');
	$recipeIdField = document.querySelector('#recipeId');
	$titleFilterField = document.querySelector('#titleFilter');
	$durationFilterField = document.querySelector('#durationFilter');
	$ingredientFilterField = document.querySelector('#ingredientFilter');

	db = await getDatabase();

	$saveRecipeBtn.addEventListener('click', saveRecipe);

	$titleFilterField.addEventListener('input', renderRecipes);
	$durationFilterField.addEventListener('input', renderRecipes);
	$ingredientFilterField.addEventListener('input', renderRecipes);

	renderRecipes();
}

async function getDatabase() {

	return new Promise((resolve, reject) => {
		let request = indexedDB.open('recipes_complex', 1);

		request.onerror = e => {
			console.error('Error opening DB', e);
			reject(e);
		};

		request.onupgradeneeded = e => {
			console.log('onupgradeneeded');

			let db = e.target.result;
			let store = db.createObjectStore('recipes', {keyPath:'id', autoIncrement:true});

			store.createIndex('recipetitles','title_lower');
			store.createIndex('recipeingredients','ingredients_names', {multiEntry:true, unique:false});
			store.createIndex('recipedurations','duration');


		};

		request.onsuccess = e => {
			console.log('onsuccess');
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

async function editRecipe(id) {
	console.log('edit', id);
	let recipe = await getRecipe(id);
	console.log(recipe);

	$titleField.value = recipe.title;
	$durationField.value = recipe.duration;
	$ingredientsField.value = recipe.ingredients.reduce((str, i) => {
		return str += `${i.name}, ${i.qty}\n`;
	},'').trim();
	$directionsField.value = recipe.directions.join('\n\n');
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

async function getRecipes(filter={}) {
	return new Promise(async (resolve, reject) => {

		if(!filter.title && !filter.duration && !filter.ingredient) {
			console.log('Doing the simpler getAll');
			let transaction = db.transaction(['recipes'],'readonly');
			transaction.onerror = e => {
				reject(e);
			};

			let store = transaction.objectStore('recipes');

			let request = store.getAll();

			request.onsuccess = e => {
				resolve(e.target.result);
			};

		} else {
			/*
			You can't search on 2 properties at once so instead, we're going to:

			Get all filtered by title, if any
			If we filter by title and its [], leave early
			If we don't filter by duration, leave early

			Get all filtered by duration, if any
			Return where items in both. 

			Edit: Ok, now we're doing 3. I'm going to regret this.


			*/

			let result = [];
			let byTitle = [];
			let byDuration = [];
			let byIngredient = [];

			if(filter.title) {
				byTitle = await searchRecipesByName(filter.title);
				console.log('byTitle', byTitle);
				if(byTitle.length === 0) { resolve([]); return; }
				// can leave early if doing nothing else
				if(!filter.duration && !filter.ingredient) { resolve(byTitle); return; }
			}

			if(filter.duration) {
				byDuration = await searchRecipesByDuration(filter.duration);
				console.log('byDuration', byDuration);
				if(byDuration.length === 0) { resolve([]); return; }
				if(!filter.title && !filter.ingredient) { resolve(byDuration); return; }
			}

			if(filter.ingredient) {
				byIngredient = await searchRecipesByIngredient(filter.ingredient);
				console.log('byIngredient', byIngredient);
				if(byIngredient.length === 0) { resolve([]); return; }
				if(!filter.title && !filter.duration) { resolve(byIngredient); return; }
			}

			// if we get here, we need to merge
			/* original
			for(let t of byTitle) {
				if(byDuration.find(x => x.id == t.id)) result.push(t);
			}
			*/

			/*
			So, I struggled with the logic of - given we have 2 or 3 arrays, what items exist in ALL 3
			Idea by @falken on Masto
			*/
			let numArrays = 0;
			if(filter.title) numArrays++;
			if(filter.duration) numArrays++;
			if(filter.ingredient) numArrays++;
			let idBag = {};
			let obBag = {};

			if(filter.title) {
				for(t of byTitle) {
					if(!idBag[t.id]) idBag[t.id] = 1;
					else idBag[t.id]++;
					obBag[t.id] = t;
				}
			}
			if(filter.duration) {
				for(t of byDuration) {
					if(!idBag[t.id]) idBag[t.id] = 1;
					else idBag[t.id]++;
					obBag[t.id] = t;
				}
			}
			if(filter.ingredient) {
				for(t of byIngredient) {
					if(!idBag[t.id]) idBag[t.id] = 1;
					else idBag[t.id]++;
					obBag[t.id] = t;
				}
			}

			for(let id in idBag) {
				if(idBag[id] === numArrays) result.push(obBag[id]);
			}

			resolve(result);

		}

	});
}



async function searchRecipesByName(name) {
	return new Promise((resolve, reject) => {

		let transaction = db.transaction(['recipes'],'readonly');

		transaction.onerror = e => {
			reject(e);
		};

		let store = transaction.objectStore('recipes');

		let index = store.index('recipetitles');
		let range = IDBKeyRange.bound(name.toLowerCase() + '', name.toLowerCase() + 'z');
		let result = [];

		index.openCursor(range).onsuccess = (event) => {
			const cursor = event.target.result;
			if (cursor) {
				result.push(cursor.value);
				cursor.continue();
			} else {
				resolve(result);
			}
		}

	});
}

async function searchRecipesByDuration(duration) {
	return new Promise((resolve, reject) => {

		let transaction = db.transaction(['recipes'],'readonly');

		transaction.onerror = e => {
			reject(e);
		};

		let store = transaction.objectStore('recipes');

		let index = store.index('recipedurations');
		let range = IDBKeyRange.upperBound(duration);
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

	});
}

async function searchRecipesByIngredient(ingredient) {
	return new Promise((resolve, reject) => {

		let transaction = db.transaction(['recipes'],'readonly');

		transaction.onerror = e => {
			reject(e);
		};

		let store = transaction.objectStore('recipes');

		let index = store.index('recipeingredients');
		let range = IDBKeyRange.bound(ingredient.toLowerCase() + '', ingredient.toLowerCase() + 'z');
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

	});
}

async function renderRecipes() {
	let filter = {};
	filter.title = $titleFilterField.value;
	if($durationFilterField.value) filter.duration = parseInt($durationFilterField.value,10);
	filter.ingredient = $ingredientFilterField.value;
	console.log('will filter with', filter);

	let recipes = await getRecipes(filter);
	console.log('recipes',recipes);
	let s = '<h2>Recipes</h2><ul>';

	if(recipes.length) {
		recipes.forEach(r => {
			s += `<li>${r.title} <button onclick="editRecipe(${r.id})">[Edit]</button> <button onclick="deleteRecipe(${r.id})">[Delete!]</button></li>`;
		});

		s += '</ul>';
	} else s += '<p>No recipes in database yet.</p>';

	$recipeListDiv.innerHTML = s;
}

async function saveRecipe(e) {
	return new Promise((resolve, reject) => {
		e.preventDefault();

		let title = $titleField.value;
		let duration = parseInt($durationField.value, 10);
		let ingredientsRaw = $ingredientsField.value;
		let directionsRaw = $directionsField.value;
		let recipeId = $recipeIdField.value;
		console.log(title, ingredientsRaw, directionsRaw, recipeId);

		/*
		Rewrite ingredients into an array
		*/
		let ingredients = [];
		let ingredients_names = [];
		ingredientsRaw.split('\n').forEach(i => {
			let [name, qty] = i.split(', ');
			ingredients.push({ name, qty });
			ingredients_names.push(name);
		});

		//console.log(ingredients);

		let directions = [];
		directionsRaw.split('\n\n').forEach(d => directions.push(d));
		//console.log(directions);

		let transaction = db.transaction(['recipes'],'readwrite');
		
		transaction.onerror = e => {
			reject(e);
		};

		transaction.oncomplete = e => {
			console.log('oncomplete', e);
			$titleField.value = '';
			$durationField.value = '';
			$ingredientsField.value = '';
			$directionsField.value = '';
			$recipeIdField.value = '';
			renderRecipes();
			resolve();
		};

		let recipeStore = transaction.objectStore('recipes');
		
		let recipe = {
			title, 
			title_lower: title.toLowerCase(), 
			duration, 
			ingredients, 
			ingredients_names,
			directions
		}
		if(recipeId !== '') recipe.id = parseInt(recipeId,10);

		recipeStore.put(recipe);
	});
}
