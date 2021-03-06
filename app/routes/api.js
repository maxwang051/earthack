var bodyParser = require('body-parser');
var User = require('./../models/User');
var Entry = require('./../models/entry');
var jwt = require('jsonwebtoken');
var config = require('../../config');
var express=require('express');
var superSecret = config.secret;

//export api to server
module.exports =  function(app,express,passport){
    var apiRouter = express.Router();

    // Get all users
    apiRouter.get('/users', function(req, res) {
        User.find({}, function(err, data) {
            res.json(data);
        });
    });

    //get current logged in user info
    apiRouter.get('/user', function(req, res) {
        res.json(req.user);
    });


    apiRouter.route('/user/:user_id')

    	.put(function(req,res){
    		User.findOne({'id':req.params.user_id},function(err, user){

    			if (err) return res.send(err);

                if (req.user != null) {
                    console.log(req.body);

        			//update info
        			if (req.body.name) user.name = req.body.name;
        			if (req.body.userType) user.userType = req.body.userType;
        			if (req.body.location) user.location = req.body.location;
                    if (req.body.entityName) user.entityName = req.body.entityName;



        			//save the user
        			user.save(function(err){
        				if (err) return res.send(err);

        				//return update message
        				res.json({message: 'User updated!'});
        			});

                };

    		});
    	})
    	
    	.get(function(req, res) {
    	    User.findOne({ 'id': req.params.user_id}, function(err, user) {
    	        res.json(user);
    	    });
    	});

    apiRouter.route('/user/:user_id/entries')

    	//add entry for user
    	.post(function(req,res){
    	    console.log(req.body);
    	    
    		var entry = new Entry();

    		entry.restaurant_id = req.params.user_id;
    		entry.food_item = req.body.food_item;
    		entry.amount = req.body.amount;
    		entry.status = req.body.status;

    		entry.save(function(err){
    			if (err) {
    				return res.send(err);
    			}
    			//return entry
    			return res.json(entry);
    		});
    	})

    	//get all entries for user
    	.get(function(req,res){
    		Entry.find({ restaurant_id : req.params.user_id }, function(err,entries){
    			if (err) return res.send(err);
    			//return entries of that user
    			return res.json(entries);
    		});
    	});

    apiRouter.route('/user/:user_id/entries/:entry_id')

    	.get(function(req,res){
    		Entry.findbyId(req.params.entry_id,function(err,entry){
    			if (err) res.send(err);

    			//make sure user is logged in
    			if (req.user != null && req.user.id == entry.restaurant_id){
    				res.json(entry);
    			} else {
    				res.json({message: "You don't have access to this note"});
    			}
    		});
    	})

    	.put(function(req,res){
    		Entry.findbyId(req.params.entry_id,function(err,note){
    			if (err) res.send(err);

    			if (req.user != null && req.user.id == entry.restaurant_id){
    				if (req.body.restaurant_id) entry.restaurant_id = req.body.restaurant_id;
    				if (req.body.food_item) entry.food_item = req.body.food_item;
    				if (req.body.amount) entry.amount = req.body.amount;
    				if (req.body.status) entry.status = req.body.status;

    				entry.save(function(err){
    					if (err) {
    						return res.send(err);
    					}	else{
    						return res.json("message: Entry updated!");
    					}
    				});
    			}
    		})
    	})

    	.delete(function(req,res){
    		var id = req.params.entry_id;
    		Entry.remove({
    			_id: id
    		}, function(err,note){
    			if (err) {
    				return res.send(err);
    			}
    			return res.json({message:'Successfully deleted!'});
    		});
    	});

    // Get all entries
    apiRouter.get('/allEntries', function(req, res) {
        Entry.find({}, function(err, data) {
            res.json(data);
        });
    });

    return apiRouter;
};
