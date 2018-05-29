let headerTemplate=Handlebars.compile($('#header-template').html());

$(loadHeader);
// display header navbar based on user login status
function loadHeader(){
	let userLoggedIn=Cookies.get('username')===undefined ? false:Cookies.get('username');
	let hbsObj={userLoggedIn:userLoggedIn};
	$('.header-template-container').html(headerTemplate(hbsObj))
}

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
	.then(()=>{
		$.ajax('/');
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
		.then(()=>{
			$.ajax('/');
		})
		.catch(err=>{console.log(err)})
		// close modal
		$.fancybox.close();
	})
	.catch(err=>{console.log(err)});
});
