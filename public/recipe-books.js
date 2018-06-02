/************* enable book description edit ***************/
$(editBookDescription);

function editBookDescription(){
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
}

/************* enable adding new book ***************/
$('.card-add-new-book-form').on('submit',function(e){
    e.preventDefault();

    // call server to POST
    const options={
        type:'POST',
        url:'/recipe-books',
        dataType:'json',
        contentType: "application/json; charset=utf-8",
        data:JSON.stringify({
            name:$('#card-add-new-book-name').val(),
            description:$('#card-add-new-book-description').val()
        })
    };
    $.ajax(options)
        .then(function(data){

            console.log(data);
            $('#card-add-new-book-name').val('');
            $('#card-add-new-book-description').val('');

            $('.remainder').text('New book added!');
            setTimeout(function(e){
                $('.remainder').text('');
            },2000);

            // add new recipe book card
            let newCardHtml=`<div class="card align-left col-12 col-sm-6 col-md-4 col-lg-3 " style="width: 18rem;" data-bookId={{id}}>
                <a href='recipe-books/book?bookId=${data.id}' data-bookId=${data.id}>
                    <img class="card-img-top" src="http://res.cloudinary.com/rollercoaster/image/upload/v1527180406/193308-OXWPEW-70_1_1.jpg" alt="recipe book cover photo">
                </a>
                <div class="card-body">
                    <a href='recipe-books/book?bookId=${data.id}' data-bookId=${data.id}>
                        <p class="card-title h5 bookName">${data.name}</p>
                    </a>
                    <p class="card-text">contains ${data.contains} recipes</p>
                    <p class="card-text bookDescription-container">description: 
                        <span class="bookDescription"contenteditable="true">${data.description}</span>
                    </p>
                    <button class='btn card-delete-book-btn'>delete book</button>
                </div>
            </div>`;

            $(newCardHtml).insertBefore('.add-new-book-div');

            // update book count
            let currCount=parseInt($('.book-count').text())+1;
            $('.book-count').text(currCount);

            // update sessionStorage
            let bookList=JSON.parse(sessionStorage.getItem('userBooks'));
            let newBook={
                bookId:data.id,
                name:data.name
                }
            bookList.push(newBook);
            sessionStorage.setItem('userBooks',JSON.stringify(bookList));            
        })
        .catch(err=>{
            if(err.status===400){
                $('.remainder').text(err.responseText);
                console.log(err); 
            }else{
                console.log(err); 
            }
        })
})

/************* enable deleting book ***************/
$('body').on('click','.card-delete-book-btn',function(e){
    e.stopPropagation();
    let bookId=$(e.target).closest('.card-body').find('a').attr('data-bookId');
    console.log(bookId);
    const options={
        url:'/recipe-books',
        type:'DELETE',
        dataType:'json',
        contentType: "application/json; charset=utf-8",
        data:JSON.stringify({
            "bookId":bookId
        })
    };
    $.ajax(options)
        .then(function(data){
            console.log('book deleted!');
            // update sessionStorage
            let currList=JSON.parse(sessionStorage.getItem('userBooks'));
            for(let i=0;i<currList.length;i++){
                if(currList[i].bookId===bookId){
                    currList.splice(i,1);
                    break;
                }
            }
            sessionStorage.setItem('userBooks',JSON.stringify(currList));
            // update book count
            let currCount=parseInt($('.book-count').text())-1;
            $('.book-count').text(currCount);
            // update page display
            $(e.target).closest('.card').remove();
        })
        .catch(err=>{
            console.log(err);
        })
});

