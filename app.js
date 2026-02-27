const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const User = require('./models/User');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// add session-middleware
app.use(session({
    secret: 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// log in check middleware
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login')
    }
    next();
};

mongoose.connect('mongodb://localhost:27017/userapp')
    .then(() => {
        console.log('successfully connected to mongoDB!');
        app.listen(3001, () => {
            console.log('Server is running at http://192.168.0.22:3001');
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
    res.render('loger');
});

// login form
app.get('/login', (req, res) => {
    res.render('login');
});

// working for logining
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.send('존재하지 않는 이메일입니다');
        }

        // this part is very internesting
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.send('비밀번호가 틀렸습니다.');
        }

        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email
        };

        res.redirect('/posts');
    } catch (err) {
        console.error(err);
        res.send('사용자가입 실패!');
    }
});

app.get('/posts', async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'name email');

        res.render('posts/list', {
            posts,
            user: req.session.user
        });
    } catch (err) {
        console.log('오유발생');
    }
});

app.get('/posts/write', checkAuth, (req, res) => {
    res.render('posts/write', { user: req.session.user });
});

app.post('/posts', checkAuth, async (req, res) => {
    try {
        const post = new Post({
            title: req.body.title,
            content: req.body.content,
            author: req.session.user._id,
            authorName: req.session.user.name
        });

        await post.save();
        res.redirect('/posts');
    } catch (err) {
        console.error(err);
        res.send('보관 실패!');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

app.get('/register', (req, res) => {
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
            <a href="/login" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">돌아가기</a>
        `);
    } catch (err) {
        console.log('Error', err);

        if (err.code === 11000) {
            return res.send(`
                <h2 style="color: red;">이미 존재하는 이메일입니다.</h2>
                <a href="/register" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">돌아가기</a>
            `);
        }

        res.send(`
            <h2 style="color: red;">사용자가입 실패!</h2>
            <p>${err.message}</p>
            <a href="/" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">돌아가기</a>
        `);
    }
});