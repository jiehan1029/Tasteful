let lightboxTemplate=Handlebars.compile($('#lightbox-template').html());

/*********** display recipe details in lightbox *************/
// when user clicks on the recipe card, show details on a lightbox
$('body').on('click','.card',function(e){
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
		let html=lightboxTemplate(data);
		$('#lightbox-template-container').html(html);
	})
	.then(()=>{
		$.fancybox.open({
			src:'#lightbox-template-container',
			type:'inline',
			opts:{
				afterShow:function(instance,current){
					console.info('show recipe details in modal!')
				}
			}
		});
	})
	.catch(err=>{console.log(err)});
});

/******* enable deleting recipe from book *********/
$('body').on('click','.card-delete-recipe-btn',function(e){
	e.stopPropagation();
	const recipeId=$(e.target).closest('.card').attr('data-recipeApiId');
	const bookId=$(e.target).closest('.recipes-list').attr('data-bookId');
	console.log(recipeId);
	console.log(bookId);
	// make PUT request to delete recipe from the book
	const options={
		type:'PUT',
		url:'/recipe-books/book',
		dataType:'json',
        contentType: "application/json; charset=utf-8",
		data:JSON.stringify({
			"bookId":bookId,
			"recipe":{apiId:recipeId},
			editBook:'delete'
		})
	};
	$.ajax(options)
		.then(function(updatedBook){
			console.log(updatedBook);
			console.log('recipe deleted!');
			// update recipe count
			let currCount=parseInt($('.recipe-count').text())-1;
			$('.recipe-count').text(currCount);
			// update page display
			$(e.target).closest('.card').remove();
			// update sessionStorage (update book recipe count)
			
		})
		.catch(err=>{
			console.log(err);
		});
});