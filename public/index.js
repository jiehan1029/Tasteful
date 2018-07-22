headerTemplate=Handlebars.compile($('#header-template').html());
searchTemplate=Handlebars.compile($('#search-template').html());
lightboxTemplate=Handlebars.compile($('#lightbox-template').html());
sidebarTemplate=Handlebars.compile($('#sidebar-template').html());

$(loadHeader);

// display header navbar based on user login status
function loadHeader(){
	let userLoggedIn=Cookies.get('username')===undefined ? false:Cookies.get('username');
	let hbsObj={userLoggedIn:userLoggedIn};
	$('.header-template-container').html(headerTemplate(hbsObj));
	$('.sidebar-login').html(sidebarTemplate(hbsObj));
}

/*********** Login/Signup modal display *************/
$('body').on('click','.loginLink, .sidebar-login-btn', function(e){
	e.preventDefault();
	e.stopPropagation();
	// clear any remainders
	$('#formRemainder').text("");
	// show div
	$('#login-modal-container').attr({hidden:false});
	$.fancybox.open({
		src:'#login-modal-container',
		type:'inline',
		opts:{
			afterShow:function(instance,current){
				//console.info('show login/signup in modal!')
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
		//console.log('User login succeeded');
		loadHeader();
		//console.log(data);
		sessionStorage.setItem('userBooks', JSON.stringify(data));
		$.fancybox.close();
	})
	.catch(err=>{
		console.log(err);
		if(err.status===401){
			$('.login-form').append(`<p class='.remainder'>Username or password is not correct!</p>`);
		}
	})
});

// enable signup
$('body').on('click','.signupBtn', function(e){
	e.stopPropagation();
	e.preventDefault();
	// make sure having all form fields filled
	if($('#loginUsername').val()==="" || $('#loginPassword').val()===""){
		$('#formRemainder').text('please fill in both username and password');
	}else{
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
			//console.log('User registration succeeded');
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
				//console.log('automatic login succeeded');
				loadHeader();
				//console.log(dataFrLogin);
				sessionStorage.setItem('userBooks', JSON.stringify(dataFrLogin));
				// close modal
				$.fancybox.close();
			})
			.catch(err=>{
				//console.log(err);
				//console.log(err.responseJSON);
				if(err.responseJSON.message){
					$('#formRemainder').text(err.responseJSON.message);
				}else{
					$('#formRemainder').text('Internal Server Error');
				}
			})
		})
		.catch(err=>{
			console.log(err);
				//console.log(err);
				//console.log(err.responseJSON);
				if(err.responseJSON.message){
					$('#formRemainder').text(err.responseJSON.message);
				}else{
					$('#formRemainder').text('Internal Server Error');
				}
		});		
	}

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
			//console.log(res.message);
			loadHeader();
			sessionStorage.removeItem('userBooks');
		})
		.catch(err=>{
			console.log(err);
		});
});

/*********** display recipe search results *************/

$('body').on('click','.form-submit-btn',function(e){
	e.stopPropagation();
	// save form search data to sessionStorage
	let searchTerms={
		query:$('.search-query').val(),
		type:$('.search-type').val(),
		cuisine:$('.search-cuisine').val(),
		page:1,
		continue:false
	};
	// update hidden form data (page)
	$('.search-page').val(searchTerms.page);
	//console.log($('.search-page').val());
	//console.log(searchTerms);
	sessionStorage.setItem('formSearchTerms',JSON.stringify(searchTerms));
	//console.log('sessionStorage set')
	// then submit form
	$('.search-recipe-form').submit();
	// watch scroll evt
	//watchScroll();
});

$(watchScroll);

// https://www.sitepoint.com/jquery-infinite-scrolling-demos/
function watchScroll(){
	//console.log('start watching page scroll');
	const win=$(window);
	win.scroll(function(e){
		// if reach end of the page
		if($(document).height()-win.height()==win.scrollTop()){
			// ajax call, read req data from sessionStorage
			const searchTerms=JSON.parse(sessionStorage.getItem('formSearchTerms'));
			const options={
				url:'/recipes',
				type:'GET',
				contentType: "application/json; charset=utf-8",
				dataType:'json',
				data:{
					page:searchTerms.page+1,
					query:searchTerms.query,
					type:searchTerms.type,
					cuisine:searchTerms.cuisine,
					continue:true
				}				
			};
			$.ajax(options)
				.then(function(data){
					let html=searchTemplate(data);
					$('.recipe-search-results').append(searchTemplate(data));
					// update sessionStorage
					let currTerm=JSON.parse(sessionStorage.getItem('formSearchTerms'));
					currTerm.page+=1;
					sessionStorage.setItem('formSearchTerms',JSON.stringify(currTerm));
				})
				.catch(err=>{console.log(err)});
		}
	});

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
		let hbsObj=data;
		let userLoggedIn=Cookies.get('username')===undefined ? false:Cookies.get('username');
		hbsObj.userLoggedIn=userLoggedIn;
		let userBooks=JSON.parse(sessionStorage.getItem('userBooks'));
		hbsObj.userBooks=userBooks;
		hbsObj.instructions.map(instruction=>{
			if(instruction.name===''){
				instruction.name=false;
			}
		});
		//console.log(hbsObj);
		let html=lightboxTemplate(hbsObj);
		$('#lightbox-template-container').html(html);
	})
	.then(()=>{
		$.fancybox.open({
			src:'#lightbox-template-container',
			type:'inline',
			opts:{
				afterShow:function(instance,current){
					//console.info('show recipe details in modal!')
				}
			}
		});
	})
	.catch(err=>{console.log(err)});
});

/**** enable add to recipe book inside recipe details lightbox ****/
// display new book form
$('body').on('change','.lightbox-book-select',function(e){
	e.stopPropagation();
	if($('.lightbox-book-select').val()==='newBook'){
		// display new book form
		$('.lightbox-new-book-form').attr({hidden:false});
	}else{
		$('.lightbox-new-book-form').attr({hidden:true});
	}
});

// enable add to new book & add to existing books
$('body').on('click','.add-to-book-btn',function(e){
	e.preventDefault();
	e.stopPropagation();

	let selection=$('.lightbox-book-select').val();

	let recipeId=$(e.target).closest('.lightbox-recipe-details').attr('data-recipeApiId');
	let recipeImg=$(e.target).closest('.lightbox-recipe-details').find('img').attr('src');
	let recipeTitle=$(e.target).closest('.lightbox-recipe-details').find('img').attr('alt');
	let recipeServing=$(e.target).closest('.lightbox-recipe-details').find('.recipe-serving').attr('data-recipeServing');
	let recipeReady=$(e.target).closest('.lightbox-recipe-details').find('.recipe-ready').attr('data-recipeReady');
	
	let recipe={
		apiId:recipeId,
		title:recipeTitle,
		imageUrl:recipeImg,
		readyInMinutes:recipeReady,
		servings:recipeServing
	}

	// to create new book
	if(selection==='newBook'){
		if($('.lightbox-new-book-name').val()===''){
			$('.added-remainder').text('Please input the name of new book!')
		}else{
			const options={
				url:'/recipe-books',
				type:'POST',
				contentType: "application/json; charset=utf-8",
				dataType:'json',
				data:JSON.stringify({
					name:$('.lightbox-new-book-name').val(),
					recipes:[recipe]
				})			
			};

			$.ajax(options)
				.then(function(data){
					//console.log(data);
					// update sessionStorage
					let bookList=JSON.parse(sessionStorage.getItem('userBooks'));
					let newBook={
		                bookId:data.id,
		                name:data.name
		                }
					bookList.push(newBook);
					sessionStorage.setItem('userBooks',JSON.stringify(bookList));
					// display remainder
					$('.added-remainder').text('Recipe added!');
					setTimeout(function(){
						$('.added-remainder').text('');
					},2000);	
				})
				.catch(err=>{console.log(err)});
		}
	}
	// add to current book
	else{
		// ajax POST to server
		const options={
			type:'PUT',
			url:'/recipe-books/book',
			contentType: "application/json; charset=utf-8",
			dataType:'json',
			data:JSON.stringify({
				bookId:selection,
				editBook:'add',
				recipe:recipe
			})
		};

		$.ajax(options)
			.then(function(data){
				// show remainder (only a few seconds), then hide again
				//console.log('PUT book succeeded')
				//console.log(data);
				if(data.duplicateMessage){
					$('.added-remainder').text(data.duplicateMessage);
				}else{
					$('.added-remainder').text('Recipe added!');
				}
				setTimeout(function(){
					$('.added-remainder').text('');
				},4000);				
			})
			.catch(err=>{console.log(err)});
	}
});
