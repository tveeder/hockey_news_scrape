// Dependencies ===============================================================
var express = require("express");
var router = express.Router();
var cheerio = require("cheerio");
var axios = require("axios");
var db = require("../models");


// Routes =====================================================================


// SCRAPE ROUTES ============
// scrapes the hackernews front page
// returns a JSON object with inidividual JSON objects that have each posts:
// title, article link, and a "comments" link the hackernews discussion
router.get("/scrape", function(req, res) {
    axios.get("https://news.ycombinator.com/over?points=100").then(function(html) {
        var completelisting = [];
        var hnresults = [];
        var commentURIList = [];

        // load the html received into cheerio, saving it to the '$' selector command
        var $ = cheerio.load(html.data);

        // pull the title and link of every post on this hackernews page
        $('tr').each(function(i, element) {
            var link = $(element, ".athing").children().find(".storylink").attr("href");
            var title = $(element, ".athing").children().find(".storylink").text();

            // not all the tr elements have the appropriate structure and
            // contain the element we're looking for
            if ((link !== undefined) && (title !== undefined)) {
                // this is the div below the title / link
                var subDiv = $(element, ".athing").children().find(".subtext");

                // you have to visit each subdiv in each tr element to get the links out
                subDiv.each(function(j, secondElement) {
                    var commentURI = $(secondElement).children().last().attr("href");
                    // since it is going through every element in the subtext class
                    // make sure that it doesn't add each element to the array, only
                    // the elements with links
                    if (commentURI.length > 1) {
                        commentURIList.push(commentURI);
                    }

                });

                // Save these results in an object to push into the result array defined earlier
                hnresults.push({
                    title: title,
                    link: link
                });
            }
        });

        // removes the first listing in the hnresults list because of a duplicate error
        hnresults = hnresults.slice(1);

        // this combines the hnresults array and commentURI array into a final array
        hnresults.forEach(function(item, i) {
            completelisting.push({
                title: item.title,
                link: item.link,
                comments: "https://news.ycombinator.com/" + commentURIList[i]
            });
        });

        res.status(200).json(completelisting);
    });
});

// used to get the first comment on the hackernews discussion page
// returns an html blob
router.get("/scrape/:commentsPageID", function(req, res) {
    var commentsPageID = req.params.commentsPageID.toString();

    axios.get("https://news.ycombinator.com/item?id=" + commentsPageID).then(function(html) {
        var $ = cheerio.load(html.data);
        var topComment = $(".comment").children().first().html();
        res.status(200).send(topComment);
    });
});
// ========================================================================

// DB ARTICLE ROUTES
// grabs all db article entries and their associated / related "notes"
// returns a JSON object
router.get("/all", function(req, res) {
    db.Article.find({}).populate("notes").lean().exec(function(err, articles) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(articles).end();
        }
    });
});

// grabs a specific article by it's ID and also populates it's related "notes"
// returns a JSON object
router.get("/all/:articleid", function(req, res) {
    db.Article.findById({ _id: req.params.articleid }).populate("notes").exec(function(err, article) {
        if (err) {
            res.status(500).send(err);
        } else {
            res.status(200).json(article).end();
        }
    });
});

// grabs all articles in db
// returns json object with article objects
router.get("/articles", function(req, res) {

    db.Article.find({}).then(function(articles) {
        res.status(200).json(articles).end();
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

// creates a new article object and pushes it to the db
router.post("/articles", function(req, res) {

    // creates new article instance / object
    var savedArticle = new db.Article({
        title: req.body.title,
        link: req.body.link,
        comments: req.body.cmtslink
    });

    // sends article instance to the database
    savedArticle.save().then(function(resp) {
        res.status(200).end();
    }).catch(function(err) {
        res.status(500).send(err);
        console.log(err);
    });


});

// checks to see if an article exists in the database already
// returns true / false boolean value
router.post("/articles/exist", function(req, res) {

    // search database for title of article and return true / false value based on whether it is in DB or not
    db.Article.findOne({ title: req.body.title }).then(function(response) {
        if (response == null) {
            res.status(200).send(false).end();
        } else {
            res.status(200).send(true).end();
        }

    }).catch(function(err) {
        res.status(500).send(err).end();
    });

});

// adds a note to the the respective (matching article) notes array
router.post("/articles/:articleid", function(req, res) {

    // add note id to article's notes array
    db.Article.updateOne({ _id: req.params.articleid }, {
        $push: {
            notes: req.body.noteID
        }
    }).then(function(response) {

        res.status(200).json(response);

    }).catch(function(err) {

        res.status(500).send(err);
    });



});

// handles deleting an individual article from the database
router.delete("/articles/:articleid", function(req, res) {

    // first find the article in the database
    db.Article.findOne({ _id: req.params.articleid }).then(function(article) {

        // then use this custom method to delete the associated / linked "notes"
        article.cascadeDeleteNotes();

        // then delete article from database
        db.Article.deleteOne({ _id: req.params.articleid }).then(function(response) {
            res.status(200).end();
        }).catch(function(err) {
            console.log(err);
        });
    });
});

// deletes all articles from the database
router.delete("/articles", function(req, res) {
    db.Article.deleteMany({}, function(response) {});
    db.Note.deleteMany({}, function(response) {});
    res.status(200).end();
});
// ============================================================

// DB NOTES ROUTES
// find all notes in the database
// returns a large json object with all notes
router.get("/notes", function(req, res) {
    db.Note.find({}).then(function(notes) {
        res.status(200).json(notes).end();
    }).catch(function(err) {
        res.status(500).send(err);
    });
});

// creates a note object and adds it to the database
router.post("/notes", function(req, res) {

    // creates new note instance / object
    var savedNote = new db.Note({
        body: req.body.textBody
    });

    // sends note instance to the database
    savedNote.save().then(function(resp) {
        res.status(200).send(resp).end();
    }).catch(function(err) {
        res.status(500).send(err);
        console.log(err);
    });
});

// deletes a specific note, according to it's ID
router.delete("/notes/:noteid", function(req, res) {
    db.Note.deleteOne({
        _id: req.params.noteid
    }).then(function(response) {
        res.status(200).send(response).end();
    }).catch(function(err) {
        res.status(500).send(err);
    });
});
// ============================================================

module.exports = router;