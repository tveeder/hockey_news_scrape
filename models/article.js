var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new UserSchema object
// This is similar to a Sequelize model
var ArticleSchema = new Schema({
  // `title` is required and of type String
  title: {
    type: String,
    required: true
  },
  // `summary` is required and of type String
  summary: {
    type: String,
    required: true
  },
  // `link` is required and of type String
  link: {
    type: String,
    required: true
  },
  // image link
  image: {
    type: String,
    required: true
  },
  // defines whether or not article is saved
  saved: {
    type: Boolean,
    default: false,
    required: true
  },
  // link to comment model/table by using the ref and saving an obj id with it. it's an array of objects so that we can have many comments
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    }
  ]

});

// This creates our model from the above schema, using mongoose's model method
var Article = mongoose.model("Article", ArticleSchema);

// Export the Article model
module.exports = Article;