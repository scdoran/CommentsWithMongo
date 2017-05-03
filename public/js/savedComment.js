// Grab the articles as a json
$.getJSON("/articles", function(data) {
  // For each one
  for (var i = 0; i < data.length; i++) {
    // Display the apropos information on the page
    $("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
  }
});


// Whenever someone clicks a p tag
$(document).on("click", "p", function() {
  // Empty the comments from the comment section
  $("#comments").empty();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#comments").append("<h3>" + data.title + "</h3>");
      // An input to enter a new title
      $("#comments").append("<input id='titleinput' name='title' placeholder='Type Your Title Here'>");
      // A textarea to add a new comment body
      $("#comments").append("<textarea id='bodyinput' name='body' placeholder='Type your comment here. Say constructive things, please!'></textarea>");
      // A button to submit a new comment, with the id of the article saved to it
      $("#comments").append("<button class='btn btn-success' data-id='" + data._id + "' id='savecomment'>Submit Comment</button>");

      $("#comments").append("<a href='/articles/" + data._id + "'><button class='btn btn-info' id='viewOthers'>View Other Comments</button></a>")

      // If there's a comment in the article
      if (data.comment) {
        // Place the title of the comment in the title input
        $("#titleinput").val(data.comment.title);
        // Place the body of the comment in the body textarea
        $("#bodyinput").val(data.comment.body);
      }
    });
});

// When you click the savecomment button
$(document).on("click", "#savecomment", function() {
  // Grab the id associated with the article from the submit button
  var thisId = $(this).attr("data-id");

  // Run a POST request to change the comment, using what's entered in the inputs
  $.ajax({
    method: "POST",
    url: "/articles/" + thisId,
    data: {
      // Value taken from title input
      title: $("#titleinput").val(),
      // Value taken from comment textarea
      body: $("#bodyinput").val()
    }
  })
    // With that done
    .done(function(data) {
      // Log the response
      console.log(data);
      // Empty the comments section
      $("#comments").empty();
    });

  // Also, remove the values entered in the input and textarea for comment entry
  $("#titleinput").val("");
  $("#bodyinput").val("");
});
