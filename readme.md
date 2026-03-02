# Discussion Board

Node.js + Express + MongoDB based discussion board project

## 🚀 Features

- Sign Up / Login (bcrypt encryption)
- Board CRUD (Create, Read, Update, Delete)
- Comment system
- File upload (multer)
- Session authentication (express-session)
- Auto view count

## 🛠 Tech Stack

- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Template**: EJS
- **Auth**: express-session, bcryptjs
- **Upload**: multer

## 📦 Installation & Run

```bash
# 1. Clone
git clone https://github.com/yourusername/repository-name.git

# 2. Install packages
npm install

# 3. Run MongoDB (separate terminal)
mongod

# 4. Run server
node app.js

# 5. Access
http://localhost:3001
```

## 📁 Folder Structure

```
├── models/          # DB schemas
├── views/           # EJS templates
├── public/          # CSS, images
├── uploads/         # uploaded files
└── app.js           # main server
```

## 📝 License

MIT
