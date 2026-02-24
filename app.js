const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const User = require('./models/User');
const bcrypt = require('bcryptjs');
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

mongoose.connect('mongodb://localhost:27017/userapp')
    .then(() => {
        console.log('successfully connected to mongoDB!');
        app.listen(3001, () => {
            console.log('Server is running at http://localhost:3001');
        });
    })
    .catch(err => {
        console.error('connecting Error!', err);
    })

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage });

app.get('/', (req, res) => {
    res.render('register');
});

app.post('/register', upload.single('profileImage'), async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        let profileImage = 'default.png';
        if (req.file) {
            profileImage = req.file.filename;
        }

        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            profileImage: profileImage,
            password: hashedPassword
        });

        await newUser.save();

        res.send(`
            <h2 style="color: green;">사용자가입 성공!</h2>
            <p>이름: ${newUser.name}</p>
            <p>이메일: ${newUser.email}</p>
            <p>프로필: ${newUser.profileImage}</p>
            <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">돌아가기</a>
        `);
    } catch (err) {
        console.log('Error', err);

        if (err.code === 11000) {
            return res.send(`
                <h2 style="color: red;">이미 존재하는 이메일입니다.</h2>
                <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">돌아가기</a>
            `);
        }

        res.send(`
            <h2 style="color: red;">사용자가입 실패!</h2>
            <p>${err.message}</p>
            <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">돌아가기</a>
        `);
    }
});