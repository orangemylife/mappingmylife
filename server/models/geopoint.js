var americano = require('americano');

var GeolocationLog = americano.getModel('geopoint', {
    _id : String,
    docTypeVersion: String,
    timestamp: String,
    docType: Dtring,
    latitude: Number,
    msisdn: String,
    longitude: Number,
    radius: Number
});

module.exports = GeolocationLog;
