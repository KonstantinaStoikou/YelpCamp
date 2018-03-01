var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middleware = require('../middleware');   //i can use this instead of ../middleware/index.js because index files dont need that

//NEW - show form to create new comment on campground with id
router.get('/campgrounds/:id/comments/new', middleware.isLoggedIn, function(req, res) {
    Campground.findById(req.params.id, function(err, campground) {
        if (err) {
            console.log(err);
        } else {
            res.render('comments/new', {campground: campground});
        }
    });
});

//CREATE - add new comment to campground with id
router.post('/campgrounds/:id/comments', middleware.isLoggedIn, function (req, res) {
    Comment.create(req.body.comment, function (err, comment) {
        if (err) {
            console.log(err);
        } else {
            Campground.findOne({"_id": req.params.id}).populate('comments').exec(function (err, campground) {
                if (err) {
                    console.log(err);
                    res.redirect('/campgrounds');
                } else {
                    comment.author.id = req.user._id;
                    comment.author.username = req.user.username;
                    comment.save();
                    campground.comments.push(comment);
                    campground.save();
                    req.flash('success', 'Successfully added comment');
                    res.redirect('/campgrounds/' + campground._id);
                }
            });
        }
    });
});

//EDIT
router.get('/campgrounds/:id/comments/:comment_id/edit', middleware.checkCommentOwnership, function(req, res) {
    Comment.findById(req.params.comment_id, function(err, foundComment) {
        if (err) {
            res.redirect('back');
        } else {
            console.log('found comment:');
            console.log(foundComment);
            res.render('comments/edit', {campground_id: req.params.id, comment: foundComment});
        }
    });
});

//UPDATE
router.put('/campgrounds/:id/comments/:comment_id', middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, {new: true}, function(err, updatedComment) {
        if (err) {
            res.redirect('back');
        } else {
            console.log('updated comment');
            console.log(updatedComment);
            console.log(req.body.comment);
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

//DESTROY
router.delete('/campgrounds/:id/comments/:comment_id', middleware.checkCommentOwnership, function(req, res) {
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
        if (err) {
            res.redirect('/campgrounds');
        } else {
            req.flash('success', 'Comment deleted');
            res.redirect('/campgrounds/' + req.params.id);
        }
    });
});

module.exports = router;
