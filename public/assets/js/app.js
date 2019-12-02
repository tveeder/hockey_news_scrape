$(document).ready(function(){
    // materialize nav bar collapse functionality
    $('.button-collapse').sideNav();
  
    // materialize modal functionality
    $('.modal').modal();
  
    $('.save-article-button').on('click', function() {
      // grab _id from saved data attribute
      var dbId = $(this).data('dbid');
      
      
      // ajax put method to articles/_id
      // send data { saved: true } back
    $.ajax({
        method: "PUT",
        url: "/articles/" + dbId,
        data: { saved: true }
        // when done, log it
      }).done(function(data) {
        console.log(data);
      });
      // update button html to article saved
      $(this).html("Article saved");
    });
    
    // when delete from saved is clicked, update db to change saved to false
    $('.delete-from-saved-button').on('click', function() {
      var dbId = $(this).data('dbid');
      // ajax put method to articles/_id
      // send data { saved: false } back
      $.ajax({
        method: "PUT",
        url: "/articles/" + dbId,
        data: { saved: false }
      }).done(function(data) {
        // when done, reload page so article is removed from saved page
        location.reload();
      })
    });
  
    // when view comments is clicked, pull in comments from db with ajax get req to articles/_id
    $('.view-comments-button').on('click', function() {
      var dbId = $(this).data('dbid');
      $("#comment-input").val('');
      $.ajax({
        method: "GET",
        url: "/articles/" + dbId
        // then, populate title, empty commend display root, add dbid attr to save comment button based on article dbid
        // then, if no comments exists, populate no comments message. if comments exists, populate a card for each comment
      }).done(function(data){
        console.log(data);
        $('.modal-title').html(data.title);
        $('.comment-display-root').empty();
        $('.save-comment-button').data('dbid', data._id);
        if (data.comments.length === 0) {
          $('.comment-display-root').html("No comments yet. Be the first to comment!");
        } else {
          for (var i = 0; i < data.comments.length; i++) {
            var newCard = 
              "<div class='card blue-grey darken-1'><div class='card-content white-text valign-wrapper'><p class='col s11 left-align'>" 
              + data.comments[i].body + "</p><button class='col s1 btn delete-comment-button' data-dbid='" + data.comments[i]._id + "'>X</button></div></div>";
            $('.comment-display-root').prepend(newCard);
          }
        }
      });
    });
  
    
    
    // when save comment is clicked, add comment to db
    $('.save-comment-button').on('click', function() {
      var dbId = $(this).data('dbid');
      // grab id from data attr, use ajax post method to send comment from text-input val to the article
      $.ajax({
        method: "POST",
        url: "/articles/" + dbId,
        data: {
          body: $("#comment-input").val()
        }
        // then log it and empty the input box
      }).done(function(data) {
        console.log(data);
        $(this).html("Comment Saved")
      })
    });
  
    // when delete comment button is clicked, remove the button
    $(document).on('click', '.delete-comment-button', function() {
      var dbId = $(this).data('dbid');
      $.ajax({
        method: "DELETE",
        url: "comments/" + dbId
      }).done(function(data) {
        console.log(data);
        location.reload();
      })
    });
  });