// Dependencies
var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var handlebars = require("express-handlebars");

// Requiring our Note and Article models
var Comment = require("./models/comment.js");
var Article = require("./models/article.js");
// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");
// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

// Use body parser with our app
app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("./public"));

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_vjcp6p6h:6pmda79j0bgtvgoifunsl7s27k@ds111791.mlab.com:11791/heroku_vjcp6p6h");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Setting the default template for handlebars to use in order to populate DOM.
app.engine("handlebars", handlebars({defaultLayout: "main"}));
app.set("view engine", "handlebars");


// Routes
// ======

// A GET request to scrape the npr website
app.get("/scrape", function(req, res) {
  // First, we grab the body of the html with request
  request("http://www.npr.org/sections/alltechconsidered/", function(error, response, html) {
    // Then, we load that into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);
    // Now, we grab every h2 within an article tag, and do the following:
    $("article h2").each(function(i, element) {

      // Save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).children("a").text();
      result.link = $(this).children("a").attr("href");

      // Using our Article model, create a new entry
      // This effectively passes the result object to the entry (and the title and link)
      var entry = new Article(result);

      // Now, save that entry to the db
      entry.save(function(err, doc) {
        // Log any errors
        if (err) {
          console.log(err);
        }
        // Or log the doc
        else {
          console.log(doc);
        }
      });

    });
  });
  // Tell the browser that we finished scraping the text
  res.redirect("articles.html");
});

// This will get the articles we scraped from the mongoDB
app.get("/articles", function(req, res) {

  Article.find({}, function(error, doc){
    if (error){
      console.log(error);
    } else {
      res.send(doc);
    }
  });

});

// This will grab an article by it's ObjectId
app.get("/articles/:id", function(req, res) {

  Article.findOne({"_id": req.params.id}).populate("comment").exec(function(error, doc){
    if(error){
      console.log(error);
    } else {
      res.send(doc);
    }
  });

});

// Create a new comment or replace an existing comment
app.post("/articles/:id", function(req, res) {

  var newComment = new Comment(req.body);

  newComment.save(function(error, doc){
    if (error){
      console.log(error);
    } else {
      Article.findOneAndUpdate({"_id": req.params.id}, {"comment":doc._id}).exec(function(error, doc){
        if(error){
          console.log(error);
        } else {
          res.send(doc);
        }
      });
    }
  });

});

// Listen on port 3000

var PORT = process.env.PORT || 3000;

app.listen(PORT, function() {
  console.log("App running on port 3000!");
});
