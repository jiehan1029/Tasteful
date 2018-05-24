// to edit instruction section - modify server ajax to send analyzed instruction instead of original instruction
// add function to enable "add to my recipe book" button
// add logout functionality
// add my-recipe-book page
// add infinite scroll to recipe page
// css: add cursor to indicate recipe card is clickable; adjust size of the lightbox


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

/*********** Login/Signup modal display *************/
$('.loginLink').click(function(e){
	e.preventDefault();
	e.stopPropagation();
	const options={}
	$.ajax(options)
	.then(function(data){
		buildLoginModal(data);
	})
	.then(()=>{
		$.fancybox.open({
			src:'#login-modal-container',
			type:'inline',
			opts:{
				afterShow:function(instance,current){
					console.info('show login/signup in modal!')
				}
			}
		});		
	})
	.catch(err=>{console.log(err)});
});

function buildLoginModal(data){
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

$('#login-modal-container').on('click','.loginBtn', function(e){
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

		$('.loginLink').attr({'hidden':true});
		$('.loginToggle').append(`<a href='#' class='nav-link welcomNavText'>Welcome! ${$('#loginUsername').val()}</a>`);
		$('.logoutLink').attr({'hidden':false});
		$('.recipebookLink').attr({'hidden':false});	

		Cookies.set('userSession',data,{expires:7});
	})
	.catch(err=>{console.log(err)})
	$.fancybox.close();
});

$('#login-modal-container').on('click','.signupBtn', function(e){
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
			console.log('automatic redirect to login succeeded');
			$('.loginLink').attr({'hidden':true});
			$('.loginToggle').append(`<a href='#' class='nav-link welcomNavText'>Welcome! ${data.username}</a>`);
			$('.logoutLink').attr({'hidden':false});
			$('.recipebookLink').attr({'hidden':false});
			Cookies.set('userSession',data,{expires:7});
		})
		.catch(err=>{console.log(err)})
		// close modal
		$.fancybox.close();
	})
	.catch(err=>{console.log(err)});
});

// logout is triggered by a nav-link --- NOT COMPLETED YET
$('.logoutLink').click(function(e){
	e.preventDefault();
	e.stopPropagation();



});


/***************** enable recipebook link *******************/
$('.recipebookLink').click(function(e){
	e.preventDefault();
	e.stopPropagation();
	const options={
		url:'/recipe-books',
		type:'GET',
		cache:true,
		beforeSend: function(xhr){
			xhr.withCredentials = true;
			xhr.setRequestHeader("Authorization", 'Bearer '+ cookies.get('userSession').auth);
		},
	};
	$.ajax(options)
	.then(function(data){
		console.log('into recipe-books page');
		console.log(data);
	})
	.catch(err=>{console.log(err)});

});
