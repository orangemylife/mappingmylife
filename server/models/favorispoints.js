var americano = require('americano');

var favorispoints = americano.getModel('favorispoints', {
    _id : String,
    id : String,
    docType: String,
    latitude: String,
    longitude: String,
    name: String
});

module.exports = favorispoints;
