const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, '제목을 입력해주십시오.']
    },
    content: {
        type: String,
        required: [true, '내용을 입력하십시오.']
    },
    author: {
        type: mongoose.Schema.Types.ObjectId, // What is it? I don't understand
        ref: 'User', // connected to model 'User'
        required: true
    },
    authorName: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    views: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('Post', postSchema);