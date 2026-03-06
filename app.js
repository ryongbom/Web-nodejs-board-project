// const express = require('express');
// const mongoose = require('mongoose');
// const session = require('express-session');
// const multer = require('multer');
// const path = require('path');
// const User = require('./models/User');
// const Post = require('./models/Post');
// const Comment = require('./models/Comment');
// const bcrypt = require('bcryptjs');
// const app = express();

// app.set('view engine', 'ejs');
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use('/uploads', express.static('uploads'));
// app.use(express.static('public'));

// // add session-middleware
// app.use(session({
//     secret: 'your-secret-key-change-this',
//     resave: false,
//     saveUninitialized: true,
//     cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
// }));

// // log in check middleware
// const checkAuth = (req, res, next) => {
//     if (!req.session.user) {
//         return res.redirect('/login')
//     }
//     next();
// };

// mongoose.connect('mongodb://localhost:27017/userapp')
//     .then(() => {
//         console.log('successfully connected to mongoDB!');
//         app.listen(3001, () => {
//             console.log('Server is running at http://localhost:3001');
//         });
//     })
//     .catch(err => {
//         console.error('connecting Error!', err);
//     })

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/');
//     },
//     filename: (req, file, cb) => {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         const ext = path.extname(file.originalname);
//         cb(null, uniqueSuffix + ext);
//     }
// });

// const upload = multer({ storage: storage });

// app.get('/', (req, res) => {
//     res.render('loger');
// });

// // login form
// app.get('/login', (req, res) => {
//     res.render('login');
// });

// // working for logining
// app.post('/login', async (req, res) => {
//     try {
//         const user = await User.findOne({ email: req.body.email });
//         if (!user) {
//             return res.send('존재하지 않는 이메일입니다');
//         }

//         // this part is very internesting
//         const isMatch = await bcrypt.compare(req.body.password, user.password);
//         if (!isMatch) {
//             return res.send('비밀번호가 틀렸습니다.');
//         }

//         req.session.user = {
//             _id: user._id,
//             name: user.name,
//             email: user.email
//         };

//         res.redirect('/posts');
//     } catch (err) {
//         console.error(err);
//         res.send('사용자가입 실패!');
//     }
// });

// app.get('/posts', async (req, res) => {
//     try {
//         const posts = await Post.find()
//             .sort({ createdAt: -1 })
//             .populate('author', 'name email');

//         res.render('posts/list', {
//             posts,
//             user: req.session.user
//         });
//     } catch (err) {
//         console.log('오유발생');
//     }
// });

// app.get('/posts/write', checkAuth, (req, res) => {
//     res.render('posts/write', { user: req.session.user });
// });

// app.get('/posts/:id', async (req, res) => {
//     try {
//         await Post.findByIdAndUpdate(req.params.id, {
//             $inc: { views: 1 }
//         });

//         const post = await Post.findById(req.params.id)
//             .populate('author', 'name email');

//         const comments = await Comment.find({ postId: req.params.id });

//         if (!post) {
//             return res.send('존재하지 않는 전자우편입니다.');
//         }

//         res.render('posts/detail', {
//             post,
//             comments,
//             user: req.session.user
//         });
//     } catch (err) {
//         console.error(err);
//         res.send('오유발생');
//     }
// });

// app.get('/posts/:id/edit', checkAuth, async (req, res) => {
//     try {
//         const post = await Post.findById(req.params.id);
//         res.render('posts/edit', { post, user: req.session.user });
//     } catch (err) {
//         console.error(err);
//         res.send('수정실패');
//     }
// });

// app.post('/posts/:id/delete', checkAuth, async (req, res) => {
//     try {
//         await Post.findByIdAndDelete(req.params.id);
//         res.redirect('/posts');
//     } catch (err) {
//         console.error(err);
//         res.send('오유발생');
//     }
// });

// app.post('/posts', checkAuth, async (req, res) => {
//     try {
//         const post = new Post({
//             title: req.body.title,
//             content: req.body.content,
//             author: req.session.user._id,
//             authorName: req.session.user.name
//         });

//         await post.save();
//         res.redirect('/posts');
//     } catch (err) {
//         console.error(err);
//         res.send('보관 실패!');
//     }
// });

// app.post('/posts/:id/update', checkAuth, async (req, res) => {
//     try {
//         const post = await Post.findByIdAndUpdate(req.params.id, {
//             title: req.body.title,
//             content: req.body.content
//         });

//         await post.save();

//         res.redirect('/posts/' + req.params.id);
//     } catch (err) {
//         console.error(err);
//         res.send('수정실패!');
//     }
// });

// // Comment Router
// app.post('/posts/:id/comments', checkAuth, async (req, res) => {
//     try {
//         const comment = new Comment({
//             content: req.body.content,
//             author: req.session.user._id,
//             authorName: req.session.user.name,
//             postId: req.params.id
//         });

//         await comment.save();
//         res.redirect('/posts/' + req.params.id);
//     } catch (err) {
//         console.error(err);
//         res.send('답변글저장 실패!');
//     }
// });

// app.post('/comments/:id/delete', checkAuth, async (req, res) => {
//     try {
//         const comment = await Comment.findById(req.params.id);

//         if (comment.author.toString() !== req.session.user._id) {
//             return res.send('삭제 권한이 없습니다.');
//         }

//         const postId = comment.postId;
//         await Comment.findByIdAndDelete(req.params.id);
//         res.redirect('/posts/' + postId);
//     } catch (err) {
//         console.error(err);
//         res.send('답변글 삭제실패!');
//     }
// });

// app.get('/logout', (req, res) => {
//     req.session.destroy();
//     res.redirect('/');
// });

// app.get('/register', (req, res) => {
//     res.render('register');
// });

// app.post('/register', upload.single('profileImage'), async (req, res) => {
//     try {
//         const salt = await bcrypt.genSalt(10);
//         const hashedPassword = await bcrypt.hash(req.body.password, salt);

//         let profileImage = 'default.png';
//         if (req.file) {
//             profileImage = req.file.filename;
//         }

//         const newUser = new User({
//             name: req.body.name,
//             email: req.body.email,
//             profileImage: profileImage,
//             password: hashedPassword
//         });

//         await newUser.save();

//         res.send(`
//             <h2 style="color: green;">사용자가입 성공!</h2>
//             <p>이름: ${newUser.name}</p>
//             <p>이메일: ${newUser.email}</p>
//             <p>프로필: ${newUser.profileImage}</p>
//             <a href="/login" style="display: inline-block; margin-top: 20px; 
//                 padding: 10px 20px; background: #007bff; color: white; 
//                 text-decoration: none; border-radius: 5px;">돌아가기</a>
//         `);
//     } catch (err) {
//         console.log('Error', err);

//         if (err.code === 11000) {
//             return res.send(`
//                 <h2 style="color: red;">이미 존재하는 이메일입니다.</h2>
//                 <a href="/register" style="display: inline-block; margin-top: 20px; 
//                     padding: 10px 20px; background: #007bff; color: white; 
//                     text-decoration: none; border-radius: 5px;">돌아가기</a>
//             `);
//         }

//         res.send(`
//             <h2 style="color: red;">사용자가입 실패!</h2>
//             <p>${err.message}</p>
//             <a href="/" style="display: inline-block; margin-top: 20px; 
//                 padding: 10px 20px; background: #007bff; color: white; 
//                 text-decoration: none; border-radius: 5px;">돌아가기</a>
//         `);
//     }
// });

// Version in English
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const bcrypt = require('bcryptjs');
const app = express();

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static('public'));

// Session middleware configuration
app.use(session({
    secret: 'your-secret-key-change-this',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 } // 1 hour
}));

// Authentication middleware
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.redirect('/login');
    }
    next();
};

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/userapp')
    .then(() => {
        console.log('Successfully connected to MongoDB!');
        app.listen(3001, () => {
            console.log('Server is running at http://localhost:3001');
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
    });

// File upload configuration
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

// Routes
app.get('/', (req, res) => {
    res.render('loger');
});

// Login form
app.get('/login', (req, res) => {
    res.render('login');
});

// Login handler
app.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.send('Email not found');
        }

        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if (!isMatch) {
            return res.send('Incorrect password');
        }

        req.session.user = {
            _id: user._id,
            name: user.name,
            email: user.email
        };

        res.redirect('/posts');
    } catch (err) {
        console.error(err);
        res.send('Login failed');
    }
});

// List all posts
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
        console.log('Error loading posts:', err);
        res.send('Failed to load posts');
    }
});

// Write post form
app.get('/posts/write', checkAuth, (req, res) => {
    res.render('posts/write', { user: req.session.user });
});

// View single post
app.get('/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndUpdate(req.params.id, {
            $inc: { views: 1 }
        });

        const post = await Post.findById(req.params.id)
            .populate('author', 'name email');

        const comments = await Comment.find({ postId: req.params.id });

        if (!post) {
            return res.send('Post not found');
        }

        res.render('posts/detail', {
            post,
            comments,
            user: req.session.user
        });
    } catch (err) {
        console.error(err);
        res.send('Failed to load post');
    }
});

// Edit post form
app.get('/posts/:id/edit', checkAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.render('posts/edit', { post, user: req.session.user });
    } catch (err) {
        console.error(err);
        res.send('Failed to load edit form');
    }
});

// Delete post
app.post('/posts/:id/delete', checkAuth, async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.redirect('/posts');
    } catch (err) {
        console.error(err);
        res.send('Failed to delete post');
    }
});

// Create new post
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
        res.send('Failed to save post');
    }
});

// Update post
app.post('/posts/:id/update', checkAuth, async (req, res) => {
    try {
        const post = await Post.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            content: req.body.content
        });

        await post.save();
        res.redirect('/posts/' + req.params.id);
    } catch (err) {
        console.error(err);
        res.send('Failed to update post');
    }
});

// Add comment
app.post('/posts/:id/comments', checkAuth, async (req, res) => {
    try {
        const comment = new Comment({
            content: req.body.content,
            author: req.session.user._id,
            authorName: req.session.user.name,
            postId: req.params.id
        });

        await comment.save();
        res.redirect('/posts/' + req.params.id);
    } catch (err) {
        console.error(err);
        res.send('Failed to save comment');
    }
});

// Delete comment
app.post('/comments/:id/delete', checkAuth, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);

        if (comment.author.toString() !== req.session.user._id) {
            return res.send('You do not have permission to delete this comment');
        }

        const postId = comment.postId;
        await Comment.findByIdAndDelete(req.params.id);
        res.redirect('/posts/' + postId);
    } catch (err) {
        console.error(err);
        res.send('Failed to delete comment');
    }
});

// like toggle
app.post('/posts/:id/like', checkAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.session.user._id;

        const alreadyLiked = await post.likes.includes(userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        // AJAX request ? check
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.json({
                success: true,
                liked: !alreadyLiked,
                likeCount: post.likes.length
            });
        } else {
            res.redirect('back');
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Failed to process like' });
    }
});

// Logout
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/');
});

// Registration form
app.get('/register', (req, res) => {
    res.render('register');
});

// Registration handler
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
            <h2 style="color: green;">Registration successful!</h2>
            <p><strong>Name:</strong> ${newUser.name}</p>
            <p><strong>Email:</strong> ${newUser.email}</p>
            <p><strong>Profile:</strong> ${newUser.profileImage}</p>
            <a href="/login" style="display: inline-block; margin-top: 20px; 
                padding: 10px 20px; background: #007bff; color: white; 
                text-decoration: none; border-radius: 5px;">Go to Login</a>
        `);
    } catch (err) {
        console.log('Registration error:', err);

        if (err.code === 11000) {
            return res.send(`
                <h2 style="color: red;">Email already exists</h2>
                <a href="/register" style="display: inline-block; margin-top: 20px; 
                    padding: 10px 20px; background: #007bff; color: white; 
                    text-decoration: none; border-radius: 5px;">Go Back</a>
            `);
        }

        res.send(`
            <h2 style="color: red;">Registration failed</h2>
            <p>${err.message}</p>
            <a href="/" style="display: inline-block; margin-top: 20px; 
                padding: 10px 20px; background: #007bff; color: white; 
                text-decoration: none; border-radius: 5px;">Go to Home</a>
        `);
    }
});

app.get('/posts/:id/like/status', checkAuth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const userId = req.session.user._id;

        const liked = post.likes.includes(userId);

        res.json({
            liked: liked,
            likeCount: post.likes.length
        });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});