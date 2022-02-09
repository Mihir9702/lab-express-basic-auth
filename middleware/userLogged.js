module.exports = (req, res, next) => {

    if (req.session?.user?.username) {
        res.render('userPages/main')
    } else {
        res.redirect('/login')
    }

}