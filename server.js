
var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000

// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/wowHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

var app = express();

//serves static assets in public folder
app.use(express.static("public"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));

app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: "main"
}));

app.set('view engine', '.hbs');

// A GET route for scraping the WOWHead website
app.get("/", function (req, res) {
    // First, we grab the body of the html with request
    axios.get("https://www.wowhead.com/news").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $("div.news-post").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.pkey = $(this)
                .attr("id")
            result.title = $(this)
                .find(".news-post-header-title .heading-size-1 a")
                .text();
            result.link = $(this)
                .find(".news-post-header-title .heading-size-1 a")
                .attr("href");
            result.summary = $(this)
                .find("noscript")
                .text();

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
              .then(function(dbArticle) {
                // View the added result in the console
                console.log(dbArticle);
              })
              .catch(function(err) {
                // If an error occurred, send it to the client
                console.log(err);
              });
        });
        db.Article.find({})
        .populate("comment")
        .then(function(articles){
            res.render("index", {articles:articles})
        });
        // If we were able to successfully scrape and save an Article, send a message to the client
    });
});

// Route to save and append comment to article
app.post("/articles/:id", function(req, res) {
    db.Comment.create(req.body)
      .then(function(dbComment) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: {comment: dbComment._id }}, { new: true });
      })
      .then(function(dbArticle) {
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

// Listen on port 3000
app.listen(PORT, function () {
    console.log(`App running on localhost: ${PORT}`);
});