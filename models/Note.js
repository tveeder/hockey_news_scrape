// Require mongoose
var mongoose = require("mongoose");
// Create a schema class
var Schema = mongoose.Schema;

// A scheme for a note
var NoteSchema = new Schema({

    // Just a string
    body: {
        type: String,
        minlength: [1, 'Please enter at least 1 character']
    },

    createdAt: {
        type: Date,
        default: Date.now()
    }

});

// Remember, Mongoose will automatically save the ObjectIds of the notes
// These ids are referred to in the Article model

// Create the Note model with the NoteSchema
var Note = mongoose.model("Note", NoteSchema);

// Export the Note model
module.exports = Note;