const router = require("express").Router();
const User = require('../models/User.model');

const { genSaltSync, hashSync, compareSync } = require('bcrypt');
const saltRounds = 10;

/* GET home page */
router.get("/", (req, res) => res.render("index"));

router.get('/signup', (req, res) => res.render('signup'))

router.post('/signup', async (req, res) => {

  const special = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

  const { username, password } = req.body;

  if (username === '' || password === '') {
    errorMessage = 'Please fill in the empty fields';
    res.render('signup', { errorMessage });
  }
  else if (special.test(username) || special.test(password)) {
    errorMessage = 'Username or Password contains special characters';
    res.render('signup', { errorMessage });
  }
  else {

    const salt = genSaltSync(saltRounds);
    const hash = hashSync(password, salt);

    // Create User
    const user = await User.create({
      username: username,
      password: hash
    })

    try {
      // Add Session
      req.session.user = user;

      res.redirect('/')
    } catch (err) { console.error(err) }

  }

})

router.get('/login', (req, res) => res.render('login'))

router.post('/login', (req, res) => {

  const { username, password } = req.body;
  let errorMessage = 'Please fill in the empty fields';

  // Error Input Check
  if (!username || !password) res.render('login', { errorMessage })

  else {

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

  }
})

// Logout / End Session
router.get('/logout', (req, res) => {
  req.session.destroy()
  res.redirect('/login')
})

// Once Logged in, User can access these routes
router.get('/main', (req, res) => {

  if (req.session?.user?.username) {
    res.render('userPages/main')
  } else {
    res.redirect('/login')
  }

})

router.get('/private', (req, res) => {

  if (req.session?.user?.username) {
    res.render('userPages/private')
  } else {
    res.redirect('/login')
  }

})

module.exports = router;