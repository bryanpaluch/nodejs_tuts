var mongoose = require('mongoose')
, Schema = mongoose.Schema;

var ConferenceSchema = new Schema({
  number: {type:Number, max: 99999999999}
, code: {type:Number, max: 9999999999, min: 1000}
, user: {type: Schema.ObjectId, ref: 'User'}
, createdAt: {type: Date, default: Date.now}
, pin: {type: Number, max: 99999, min: 1000}
, conferenceId : {type: String}
});

ConferenceSchema.pre('save', function(next){
  this.conferenceId = this.number.toString() + '-' +this.code.toString();
  next();
});

ConferenceSchema.index({conferenceId: 1});
mongoose.model('Conference', ConferenceSchema);


