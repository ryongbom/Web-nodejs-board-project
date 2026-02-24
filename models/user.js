const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, '이름을 입력하여야 합니다!']
    },
    email: {
        type: String,
        required: [true, '이메일을 입력하여야 합니다!'],
        unique: true,
        match: [/.+\@.+\..+/, '올바른 이메일 형식이 아닙니다.']
    },
    profileImage: {
        type: String,
        default: 'default.png'
    },
    password: {
        type: String,
        required: [true, '비밀번호를 입력하여야 합니다!'],
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);