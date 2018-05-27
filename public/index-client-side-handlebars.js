// to edit instruction section - modify server ajax to send analyzed instruction instead of original instruction
// add function to enable "add to my recipe book" button
// add infinite scroll to recipe page
// css: add cursor to indicate recipe card is clickable; adjust size of the lightbox





// compile handlebars templates
let headerTemplate=Handlebars.compile($('#header-template').html());

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
		buildLoginModal();
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

function buildLoginModal(){
	let modalHtml=
	`<h1 class="h5">Login/Signup to explore more</h1>
	 <form class="loginForm" onsubmit={return false;}>
	 	<fieldset>
	 	<label for="loginUsername">Username</label>
	 	<input id="loginUsername" type="text" class="form-control" required>
	 	<label for="loginPassword">Password</label>
	 	<input id="loginPassword" type="text" class="form-control" required>
	 	</fieldset>
	 	<button type="submit" class="loginBtn btn btn-primary">Log in</button>
	 	<button class="btn signupBtn">Sign up</button>
	 </form>
	`;
	$('#login-modal-container').html(modalHtml);
}

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
		})
		.catch(err=>console.log(err));
});


// recipe search results display is enabled by server-side handlebars


/*********** Recipe details lightbox display *************/

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
	.catch(err=>{console.log(err)});
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


