var americano = require('americano');

var geopoint = americano.getModel('geopoint', {
    _id : String,
    docTypeVersion: String,
    timestamp: String,
    docType: String,
    latitude: Number,
    msisdn: String,
    longitude: Number,
    radius: Number
});

module.exports = geopoint;
