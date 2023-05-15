const express = require('express');
const router = express.Router();

const authController = require('./app/controllers/authController');

//Route [GET] index
router.get('/', (req, res) => {
    res.render('index', {title: 'Banana Chat', index: true})
})

// Route đăng ký
router.get('/register', (req, res) => {
    const loi = req.flash('error')
    res.render('register', {title: 'Sign Up', loi: loi});
});
router.post('/register', authController.register);

// Route đăng nhập
router.get('/login', (req, res) => {
    const error = req.flash('error')
    res.render('login', {title: 'Sign In', error});
});
router.post('/login', authController.login);

// Route chatform
router.get('/home', (req, res) => {
    const fullname = req.session.fullname;
    const username = req.session.username;
    res.render('home', {title: 'Online Chat',  username: username, fullname: fullname});
});

//[GET] logout
router.get('/logout', authController.logout);

module.exports = router;
