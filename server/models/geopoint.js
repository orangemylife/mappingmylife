var americano = require('americano');

var geopoint = americano.getModel('geopoint', {
    _id : String,
    docTypeVersion: String,
    msisdn: Number,
    timestamp: String,
    latitude: Number,
    longitude: Number,
    radius: Number
});

module.exports = geopoint;
