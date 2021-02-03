var mongoose = require("mongoose");
var Schema = mongoose.Schema;
var Note = require("./Note.js");

var ArticleSchema = new Schema({

    title: {
        type: String,
        required: true,
        trim: "A title is required"
    },

    link: {
        type: String,
        required: "A link is required",
        match: [/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/, "Please enter a valid url"]
    },

    comments: {
        type: String,
        required: true
    },

    notes: [{
        type: Schema.Types.ObjectId,
        ref: "Note"
    }],

    createdAt: {
        type: Date,
        default: Date.now()
    }

});

// clears array and removes deleted
ArticleSchema.methods.cascadeDeleteNotes = function() {
    this.notes.forEach(function(noteID, i) {
        Note.deleteOne({ _id: noteID }).then(function(response) {}).catch(function(err) {
            console.log(err);
        });

    });

};


// create a model, Article using the schema above
var Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;