var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Records = new Schema({
	id:{
		type:String
	},
	user:{
		type:String
	},
	time:{
		type:Number
	},
});

mongoose.model('records', Records);