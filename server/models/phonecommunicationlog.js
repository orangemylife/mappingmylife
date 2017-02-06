var americano = require('americano');

var PhoneCommunicationLog = americano.getModel('phonecommunicationlog', {
    _id: String,
    msisdn: String,
    networkType: String,
    docType : String,
    type: String,
    endCause: String,
    latitude: Number,
    chipType: String,
    longitude: Number,
    timestamp: String,
    partner: String,
    docTypeVersion: String,
    length: Number
});

module.exports = PhoneCommunicationLog;