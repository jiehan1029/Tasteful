/************* enable book description edit ***************/
$(editBookNameAndDescription);

function editBookNameAndDescription(){
	$('.bookDescription').blur(function(e){
		// change description displayed on browser
		let text = $(e.target).html();
        text = text.replace(/&/g, "&amp").replace(/</g, "&lt;");
        let bookId=$(e.target).closest('.card').attr("data-bookId");
        // ajax post to change server side data
        const options={
        	url:'/recipe-books/book',
        	type:'PUT',
        	dataType:'json',
        	contentType: "application/json; charset=utf-8",
        	data:JSON.stringify({
        		bookId:bookId,
        		description:text
        	})
        };
        $.ajax(options)
        .then(data=>{
        	console.log('update book description successfully')
        });
	});

	$('.bookName').blur(function(e){
		// change description displayed on browser
		let text = $(e.target).html();
        text = text.replace(/&/g, "&amp").replace(/</g, "&lt;");
        let bookId=$(e.target).closest('.card').attr("data-bookId");
        // ajax post to change server side data
        const options={
        	url:'/recipe-books/book',
        	type:'PUT',
        	dataType:'json',
        	contentType: "application/json; charset=utf-8",
        	data:JSON.stringify({
        		bookId:bookId,
        		name:text
        	})
        };
        $.ajax(options)
        .then(data=>{
        	console.log('update book name successfully')
        });
	});
}


/*********** Recipe details lightbox display *************/
// when user clicks on the recipe card, redirect to new url
$('.booksResults').on('click','.card',function(e){
	e.stopPropagation();
	let bookId=$(e.target).closest('.card').attr('data-bookId');
	const options={
		url:'/recipe-books/book',
		type:'GET',
		cache:true,
		data:{bookId:bookId},
		dataType:'json'
	};
	$.ajax(options)
	.then(function(data){
		console.log(`display recipe book ${bookId}`);
	})
	.catch(err=>{console.log(err)});
});
