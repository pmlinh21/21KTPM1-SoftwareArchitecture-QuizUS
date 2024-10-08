const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  // answer_id: { type: String, required: true },
  answer_text: { type: String, required: true },
  is_correct: { type: Boolean, required: true }
});

const QuestionSchema = new Schema({
  // question_id: { type: String, required: true }, mongodb tự tạo id tên trường là _id nên không cần tự ghi id cho nó
  question_text: { type: String, required: true },
  answers: [AnswerSchema]
});

const QuizSchema = new Schema({
    // quiz_id: { type: String },
    description: { type: String },
    questions: [QuestionSchema]
}, { versionKey: false });

module.exports = mongoose.model('Quiz', QuizSchema);
