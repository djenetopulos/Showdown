var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var RecordSchema = new Schema({
    id:{
        type:String
    },
    user:{
        type:String
    },
    time:{
        type:Number
    }
})

mongoose.model('records', RecordSchema);