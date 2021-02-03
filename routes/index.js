// Dependencies ===============================================================
var express = require("express");
var router = express.Router();
var cheerio = require("cheerio");
var axios = require("axios");
var db = require("../models");


// homepage
router.get('/', function(req, res) {
    res.render('index');
});

// saved articles page
router.get('/saved', function(req, res) {
    db.Article.find({}).populate("notes").lean().exec(function(err, results) {
        if (err) {
            res.status(500).send(err);
        } else {
            var articleObjects = [];
            results.forEach(function(item, i) {
                articleObjects.push(item);
            });
            articleObjects.reverse();
            res.render("savedarticles", { articles: articleObjects });
        }
    });

});

// handle favicon
router.get('/favicon.ico', function(req, res) {
    res.sendStatus(204);
});

module.exports = router;