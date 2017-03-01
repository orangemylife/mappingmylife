var americano = require('americano');

var PhoneCommunicationLog = americano.getModel('PhoneCommunicationLog', {
    _id: String,
    partner : String,
    length : Number,
    timestamp: String,
    docTypeVersion: String,
    chipType: String,
    type: String,
    latitude: Number,
    longitude: Number,
    msisdn: String,
    endCause: String,
    networkType: String
});

module.exports = PhoneCommunicationLog;
