// to do: enable delete recipe from book!


let headerUsernameTemplate=Handlebars.compile($('#header-username-template').html());
let lightboxTemplate=Handlebars.compile($('#lightbox-template').html());

// display header navbar based on user login status
$(loadHeader);

function loadHeader(){
  let userLoggedIn=Cookies.get('username')===undefined ? false:Cookies.get('username');
  let hbsObj={userLoggedIn:userLoggedIn};
  $('.header-username-template-container').html(headerUsernameTemplate(hbsObj))
}


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
