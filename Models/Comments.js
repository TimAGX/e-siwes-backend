const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const commentSchema = new Schema({
  id: String,
  comment: String,
  student: String,
  supervisor: String,
  studentName: String,
  supervisorName: String,
  sender: String,
});

const Comment = model("Comment", commentSchema);

module.exports = Comment;
