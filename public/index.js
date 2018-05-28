// to edit instruction section - modify server ajax to send analyzed instruction instead of original instruction
// add function to enable "add to my recipe book" button
// add infinite scroll to recipe page
// css: add cursor to indicate recipe card is clickable; adjust size of the lightbox


// compile handlebars templates
let headerTemplate=Handlebars.compile($('#header-template').html());
let searchTemplate=Handlebars.compile($('#search-template').html());
let lightboxTemplate=Handlebars.compile($('#lightbox-template').html());

$(loadHeader);

// display header navbar based on user login status
function loadHeader(){
	let userLoggedIn=Cookies.get('username')===undefined ? false:Cookies.get('username');
	let hbsObj={userLoggedIn:userLoggedIn};
	$('.header-template-container').html(headerTemplate(hbsObj))
}

/*********** Login/Signup modal display *************/
$('body').on('click','.loginLink', function(e){
	e.preventDefault();
	e.stopPropagation();
		$('#login-modal-container').attr({hidden:false});
		$.fancybox.open({
			src:'#login-modal-container',
			type:'inline',
			opts:{
				afterShow:function(instance,current){
					console.info('show login/signup in modal!')
				}
			}
		});		
});

/************** enable login/signup/logout functionality **************/

// enable login
$('body').on('click','.loginBtn', function(e){
	e.stopPropagation();
	e.preventDefault();
	// call server to log in
	const options={
		url:'/auth/login',
		type:'POST',
		contentType: "application/json; charset=utf-8",
		dataType:'json',
		data:JSON.stringify({
			"username":$('#loginUsername').val(),
			"password":$('#loginPassword').val()
		})
	};

	$.ajax(options)
	.then(function(data){
		console.log('User login succeeded');
		loadHeader();
		sessionStorage.setItem('userBooks', JSON.stringify(data));
	})
	.catch(err=>{console.log(err)})
	$.fancybox.close();
});

// enable signup
$('body').on('click','.signupBtn', function(e){
	e.stopPropagation();
	e.preventDefault();
	// call server to create account
	const options={
		url:'/users',
		type:'POST',
		contentType: "application/json; charset=utf-8",
		dataType:'json',
		data:JSON.stringify({
			"username":$('#loginUsername').val(),
			"password":$('#loginPassword').val()
		})
	};
	$.ajax(options)
	.then(function(data){
		console.log('User registration succeeded');
		return data;
	})
	.then(function(data){
		// login on server side
		const options2={
			url:'/auth/login',
			type:'POST',
			contentType: "application/json; charset=utf-8",
			dataType:'json',
			data:JSON.stringify({
				"username":data.username,
				"password":$('#loginPassword').val()
			})						
		};

		$.ajax(options2)
		.then(function(dataFrLogin){
			console.log('automatic login succeeded');
			loadHeader();
			sessionStorage.setItem('userBooks', JSON.stringify(dataFrLogin));
		})
		.catch(err=>{console.log(err)})
		// close modal
		$.fancybox.close();
	})
	.catch(err=>{console.log(err)});
});

// enable logout 
$('body').on('click','.logoutLink', function(e){
	e.preventDefault();
	e.stopPropagation();
	const options={
		url:'/auth/logout',
		method:'GET'
	};
	$.ajax(options)
		.then((res)=>{
			console.log(res.message);
			loadHeader();
			sessionStorage.removeItem('userBooks');
		})
		.catch(err=>console.log(err));
});

/*********** display recipe search results *************/
// disable html form submission, handle with ajax
$('body').on('submit','.search-recipe-form',function(e){
	e.preventDefault();
	e.stopPropagation();
	const options={
		url:'/recipes',
		type:'POST',
		cache:true,
		data:{
			query:$('.search-query').val(),
			cuisine:$('.search-cuisine').val(),
			type:$('.search-type').val()
		},
		dataType:'json'		
	};
	$.ajax(options)
		.then(function(data){
			const html=searchTemplate(data);
			$('.search-template-container').html(html);
		})
		.catch(err=>{console.log(err)});
});

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
		let hbsObj=data;
		let userLoggedIn=Cookies.get('username')===undefined ? false:Cookies.get('username');
		hbsObj.userLoggedIn=userLoggedIn;
		let userBooks=JSON.parse(sessionStorage.getItem('userBooks'));
		hbsObj.userBooks=userBooks;
		console.log(hbsObj);
		let html=lightboxTemplate(hbsObj);
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

/**** enable add to recipe book inside recipe details lightbox ****/
$('body').on('click','.add-to-book-btn',function(e){
	e.preventDefault();
	e.stopPropagation();

	let selection=$('.lightbox-book-select').val();
	// to create new book
	if(selection==='newBook'){

	}
	// add to current book
	else{
		// ajax POST to server
		let recipeId=$(e.target).closest('.lightbox-recipe-details').attr('data-recipeApiId');
		let recipeImg=$(e.target).closest('.lightbox-recipe-details.img').attr('src');
		let recipeTitle=$(e.target).closest('.lightbox-recipe-details.img').attr('alt');
		let recipeServing=$(e.target).closest('.lightbox-recipe-details.recipe-serving').attr('data-recipeServing');
		let recipeReady=$(e.target).closest('.lightbox-recipe-details.recipe-ready').attr('data-recipeReady');
		const options={
			type:'POST',
			url:'/recipe-books',
			contentType: "application/json; charset=utf-8",
			dataType:'json',
			data:{
				bookId:selection,
				editBook:'add',
				recipe:{
					apiId:recipeId,
					title:recipeTitle,
					imageUrl:recipeImg,
					readyInMinutes:recipeReady,
					servings:recipeServing
				}
			}
		};

		$.ajax()
			.then(function(data){
				// show remainder (only a few seconds), then hide again
				console.log('PUT book succeeded')
				console.log(data);
				$('.added-remainder').attr({hidden:false});
				setTimeout(function(){
					$('.added-remainder').attr({hidden:true});
				},2000);				
			})
			.catch(err=>{console.log(err)});
	}


});
