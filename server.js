// npm requirements
var express = require("express");
var bodyParser = require("body-parser");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var request = require("request");

// require models
var db = require("./models");

// set a port 
// process.env.PORT for Heroku
var PORT = process.env.PORT || 3000;

// initialize Express
var app = express();

// middleware
app.use(bodyParser.urlencoded({ extended: false }));
// express.static serves the public folder as a static directory
app.use(express.static("public"));

// set up app to use handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// If deployed, use the deployed database. Otherwise use the local mongoScraper database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongoScraper";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Routes
// home page, find all articles and render landing handlebars in order of newest first
app.get("/", function(req, res) {
  db.Article.find({}, null, { sort: {'_id': -1} }, function(error, data) {
    if (error) throw error;
    res.render("landing", { articleData: data })
  });
});

// saved page, find all articles where saved is true and render saved handlebars in order of newest first
app.get("/saved", function(req, res) {
  db.Article.find({ saved: true }, null, { sort: {'_id': -1} }, function(error, data) {
    if (error) throw error;
    res.render("saved", { articleData: data })
  });
});

// route for scraping nhl.com/news
app.get("/scrape", function(req, res) {
  // find all articles already in db, save titles in array
  db.Article.find({}, function(err, currentArticles) {
    if (err) throw err;
    var currentArticleTitles = [];
    for (var i = 0; i < currentArticles.length; i++) {
      currentArticleTitles.push(currentArticles[i].title);
    }
    // then grab html body, load into cheerio
    request("https://www.nhl.com/news", function(error, response, html) {
      var $ = cheerio.load(html);
      // grab every article from html, save title/summary/link/image in a result object if the title doesn't already appear in db
      $("article").each(function(i, element) {
        var result = {};
        if (currentArticleTitles.indexOf($(element).data("title")) === -1) {
          result.title = $(element)
            .data("title");
          result.summary = $(element)
            .find("h2")
            .text();
          result.link = $(element)
            .data("url");
          result.image = "";
          // nhl.com is inconsistent in how it saves images, hence multiple options to populate result.image
          if ($(element).find("img").data("src")) {
            result.image = $(element).find("img").data("src");
          } 
          else if ($(element).find("img").attr("src")) {
            result.image = $(element).find("img").attr("src");
          }
          else {
            result.image = '/assets/images/default.png';
          }
          // Create a new Article using the `result` object, log it, catch any errors
          db.Article.create(result)
            .then(function(dbArticle) {
              console.log(dbArticle);
            })
            .catch(function(err) {
              return res.json(err);
            });
        }
      });
      // If we were able to successfully scrape and save articles, redirect home
      res.redirect("/");
    });
  });
});

// route for updating articles in db for saved/unsaved
app.put("/articles/:id", function(req, res) {
  // update at req.params.id, update with req.body from app.js, throw err if err, if not - log the result, send back 200 if successful
  db.Article.update({ _id: req.params.id }, { $set: req.body }, function(err, result) {
    if (err) throw err;
    console.log(result);
    res.sendStatus(200);
  });
});

// Route for saving an Article's associated comment
app.post("/articles/:id", function(req, res) {
  // Create a new comment and pass the req.body to the entry
  db.Comment.create(req.body)
    .then(function(dbComment) {
      // if comment creation success, find article with req.params.id match, associate it with the comment body sent from app.js by pushing it to comments array
      // new true returns updated article
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { comments: dbComment._id } }, { new: true });
    })
    .then(function(dbArticle) {
      // we were able to successfully update an Article, send it back, otherwise send the error
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing a specific Article by id
app.get("/articles/:id", function(req, res) {
  // Using the id passed in the id parameter, find it, populate it with its comments, send back json if successful/error if not
  db.Article.findOne({ _id: req.params.id })
    .populate("comments")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// delete route for comment removal
app.delete("/comments/:id", function(req, res) {
  db.Comment.remove({ _id: req.params.id }, function(err, data) {
    if (err) throw err;
    console.log(data);
    res.sendStatus(200);
  })
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});