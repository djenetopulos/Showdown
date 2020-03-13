var express = require('express');
var mongoose = require('mongoose');
var router = express.Router();
var {ensureAuthenticated} = require("../helper/auth");

var highscores = [];

require('../models/Record');
var Record = mongoose.model('records');


router.get('/allrecords', ensureAuthenticated, function(req, res){
    Record.find().then(function(records){
        records.forEach(record => {
            var pushme = true;
            highscores.forEach(highscore => {
                if(highscore.id == record.id)
                    pushme = false;
            });
            if(pushme)
                highscores.push({
                    id:record.id,
                    user:record.user,
                    time:record.time
            })
        })
        highscores.sort(function(a,b){return a.time-b.time;});
        console.log(highscores);
        
        res.render('recordentry/index',{
            records:records
        });
    })

})

router.get('/highscores', function(req, res){
    Record.find().then(function(records){
        records.forEach(record => {
            var pushme = true;
            highscores.forEach(highscore => {
                if(highscore.id == record.id)
                    pushme = false;
            });
            if(pushme)
                highscores.push({
                    id:record.id,
                    user:record.user,
                    time:record.time
            })
        })
        highscores.sort(function(a,b){return a.time-b.time;});
        console.log(highscores);
        
        res.render('recordentry/displayall',{
            records:records
        });
    })

})

router.get('/recordentry/recordadd', ensureAuthenticated, function(req, res){
    res.render('recordentry/recordadd');
});

router.get('/recordentry/recordedit/:id', ensureAuthenticated, function(req, res){
    Record.findOne({
        id:req.params.id
    }).then(function(record){
        /*if(record.user != req.user.id){
            req.flash('error_msg', 'Not Authorized');
            res.redirect('/records/highscores');
        }
        else{*/
            res.render('recordentry/recordedit',{
                record:record
            });
        //}
    });
});

//Post Request
router.post('/recordentry', ensureAuthenticated, function(req, res){
    console.log(req.body);
    var errors = [];

    if(!req.body.id){
        errors.push({text:'please add an id'});
    }
    if(!req.body.user){
        errors.push({text:'please add a user name'});
    }
    if(!req.body.time){
        errors.push({test:'please add a time'});
    }

    if(errors.length > 0){
        res.render('recordentry/recordadd',{
            errors:errors,
            id:req.body.id,
            user:req.body.user,
            time:req.body.time
        });
    }
    else{
        //Send info to database
        // res.send(req.body);
        var newUser = {
            id:req.body.id,
            user:req.body.user,
            time:req.body.time
        }
        new Record(newUser).save().then(function(){
            req.flash('success_msg', 'Record Added Successfully');
            res.redirect('highscorelist');
        });
    }

    //res.send(req.body);
});

router.put('/recordedit/:id', ensureAuthenticated, function(req,res){
    Record.findOne({
        id:req.params.id
    }).then(function(record){
        record.id = req.body.id
        record.user = req.body.user
        record.time = req.body.time

        record.save().then(function(record){
            req.flash('success_msg', 'Record Edited Successfully');
            res.redirect('/records/allrecords');
        });
    });
});

router.delete('/recorddelete/:id', ensureAuthenticated, function(req,res){
    Record.deleteOne({
        _id:req.params.id
    }).then(function(){
        req.flash('success_msg', 'Record Deleted Successfully');
        res.redirect('/records/allrecords');
    });
});

module.exports = router;