module.exports = (req, res, next) => {

    let errorMessage = '';
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
    else if (!username || !password) {
        errorMessage = 'Username or Password not found';
        res.render('login', { errorMessage })
    } else {
        next();
    }

} 
