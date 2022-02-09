const router = require("express").Router();
const User = require('../models/User.model');

// Bcrypt
const { genSaltSync, hashSync, compareSync } = require('bcrypt');
const saltRounds = 10;

// Middleware
const userLogged = require('../middleware/userLogged');
const userError = require('../middleware/userError');

/* GET home page */
router.get("/", (req, res) => res.render("index"));

router.get('/signup', (req, res) => res.render('signup'))

router.post('/signup', userError, async (req, res) => {

  const { username, password } = req.body;

  const salt = genSaltSync(saltRounds);
  const hash = hashSync(password, salt);

  const checkUsers = await User.find({ username: username })

  if (checkUsers) {
    const errorMessage = 'User has already been created';
    return res.render('signup', { errorMessage })
  }

  // Create User
  const user = await User.create({
    username: username,
    password: hash
  })

  try {
    req.session.user = user;
    res.redirect('/')
  } catch (err) {
    console.error(err)
  }


})

router.get('/login', (req, res) => res.render('login'))

router.post('/login', userError, (req, res) => {

  const { username, password } = req.body;

  User.findOne({ username: username })
    .then(foundUser => {

      errorMessage = 'Username or Password not found';

      // Case 1: User doesn't exist
      if (!foundUser) return res.render('login', { errorMessage })

      // Case 2: User is found, compare passwords
      const match = compareSync(password, foundUser.password)

      // Case 2.5: Passwords don't match
      if (!match) return res.render('login', { errorMessage })

      // Case 3: Username and Password are correct, Add Session
      req.session.user = foundUser;
      res.redirect('/main')

    })
})

// Logout / End Session
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login')
})

// Once Logged in, User can access these routes
router.get('/main', userLogged, (req, res) => {
  res.render('userPages/main');
})

router.get('/private', userLogged, (req, res) => {
  res.render('userPages/private')
})

module.exports = router;