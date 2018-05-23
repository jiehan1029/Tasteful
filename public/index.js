// to edit instruction section - modify server ajax to send analyzed instruction instead of original instruction
// add function to enable "add to my recipe book" button
// add login/signup modal
// add my-recipe-book page
// add infinite scroll to recipe page
// css: add cursor to indicate recipe card is clickable; adjust size of the lightbox

// when user clicks on the recipe card, show details on a lightbox
$('.searchResults').on('click','.card',function(e){
	e.stopPropagation();
	let recipeApiId=$(e.target).closest('.card').attr('data-recipeApiId');
	const options={
		url:'/recipes/details',
		type:'GET',
		cache:true,
		data:{recipeApiId:recipeApiId},
		dataType:'json'
	};
	$.ajax(options)
	.then(function(data){
		buildLightbox(data);
	})
	.then(()=>{
		$.fancybox.open({
			src:'#lightbox-container',
			type:'inline',
			opts:{
				afterShow:function(instance,current){
					console.info('show recipe details in modal!')
				}
			}
		});
	})
});

function buildLightbox(data){
	let ingredientsList=$('<ul>');
	for(let i=0;i<data.extendedIngredients.length;i++){
		let $tempLi=$('<li>');
		$tempLi.text(data.extendedIngredients[i].originalString);
		ingredientsList.append($tempLi);
	}
	let lightboxHtml=
	`<div class="col-10 offset-1 align-center" style="width: 18rem;" data-recipeApiId="${data.recipeApiId}">
		<img class="card-img-top" src="${data.image}" alt="${data.title}">
		<div class="card-body">
			<h5 class="card-title h5">${data.title}</h5>
			<p class="card-text">Ready in ${data.readyInMinutes} minutes</p>
			<p>Serves ${data.servings} people</p>
			<button class='addToBookBtn btn btn-primary'>Add to my recipe book</button>
			<hr>
			<h5 class='h5'>Ingredients</h5>
			<div>${ingredientsList.html()}</div>
			<h5 class="h5">Instructions</h5>
			<div>${data.instructions}</div>
		</div>
	</div>`;
	console.log(lightboxHtml);
	$('#lightbox-container').html(lightboxHtml);
}