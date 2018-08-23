var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
var CommentSchema = new Schema({
  body: String
});

// This creates our model from the above schema, using mongoose's model method
var Comments = mongoose.model("Comments", CommentSchema);

// Export the Comment model
module.exports = Comments;
