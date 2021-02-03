// Dependencies ==============================================================
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// Express web server set up =================================================
var express = require('express');
var exphbs = require("express-handlebars");
var app = express();
var PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// Initialize Express and routes
var routes = require("./routes/index");
var apiRoutes = require("./routes/apiRoutes");
app.use("/", routes);
app.use("/api", apiRoutes);

// Make public a static dir
app.use(express.static("public"));

var hbs = exphbs.create({
    // Specify helpers which are only registered on this instance.
    helpers: {
        trimDate: function(dateToTrim) {
            // this will trim dates
            var newDate = String(dateToTrim).substring(0, 15);
            return newDate;
        }
    },
    defaultLayout: "main"
});

// Set Handlebars as the default templating engine.
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");

// Express Web Server listener
app.listen(PORT, function() {
    console.log("App listening on PORT: " + PORT);
});