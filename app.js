var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Campground = require('./models/campground');
var Comment = require('./models/comment');
var User = require('./models/user');
var seedDB = require('./seeds');
var passport = require('passport');
var LocalStrategy = require('passport-local');
var methodOverride = require('method-override');
var flash = require('connect-flash');

var commentRoutes = require('./routes/comments');
var campgroundRoutes = require('./routes/campgrounds');
var authRoutes = require('./routes/auth');

var url = process.env.DATABASEURL || 'mongodb://localhost/yelp_camp';   //works as backup
mongoose.connect(url);
//mongoose.connect('mongodb://localhost/yelp_camp');

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(flash());

//seedDB();  //seed the database

//PASSPORT CONFIGURATION
app.use(require('express-session')({
    secret: 'Something secret',
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//pass currentUser (and others) to every template
app.use(function(req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.error = req.flash('error');
    res.locals.success = req.flash('success');
    next();
});

//requiring routes
app.use(authRoutes);
app.use(commentRoutes);
app.use(campgroundRoutes);
//app.use('/campgrounds', campgroundRoutes);
//i can write it like that and remove /campgrounds everywhere
//in campgrounds.js e.g. app.get('/new'...) instead of
//app.get('/campgrounds/new' ...)

app.listen(process.env.PORT, process.env.IP, function() {
    console.log('Server has started.');
});

app.get('/', function(req, res) {
    res.render('landing');
});
