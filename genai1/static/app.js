
document.addEventListener('DOMContentLoaded', init, false);

let $fileInput, $reviewButton, $results;

async function init() {

	$fileInput = document.querySelector('#file');
	$reviewButton = document.querySelector('#submit');
	$results = document.querySelector('#results');

	$reviewButton.addEventListener('click', handleReview, false);
}

async function handleReview(e) {
	e.preventDefault();
	console.log('click');
	if($fileInput.files.length === 0) return;
	$reviewButton.disabled = true;
	let file = $fileInput.files[0];
	// Create a form body object to post the file
	let formData = new FormData();
	formData.append('file', file);

	let resp = await fetch('/review', { 
		method: 'POST', 
		body: formData 
	});
	let json = await resp.json();
	let result = marked.parse(json.review);
	console.log(result);
	let html = `
	<h2>Review</h2>
	${marked.parse(json.review)}
	<h2>Revised Resume</h2>
	${marked.parse(json.revisedResume)}
	`;
	$results.innerHTML = html;
	$reviewButton.disabled = false;

}