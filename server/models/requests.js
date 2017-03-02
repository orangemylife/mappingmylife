var americano = require('americano');


var maxDist = 0.000008,
    isNearPoint = function(lat1, lon1, lat2, lon2) {
        var x = lat1 - lat2,
            y = lon1 - lon2,
            dist = (x * x) + (y * y);
    
        if(dist < maxDist) {
            return true;
        } else {
            return false;
        }
    };


module.exports = {
    geopoint: {
        all: americano.defaultRequests.all,
        byDay: function(doc) {
            if(doc.radius < 1000 && doc.latitude != null && doc.longitude != null) {
                return emit([doc.timestamp, doc.msisdn], doc);
            } else {
                return null;
            }
        },
        mostImportant: {
            map: function(doc) {
                if(doc.latitude == null || doc.longitude == null) {
                    return null;
                } else {
                    return emit([doc.msisdn, doc.latitude, doc.longitude], 1);
                }
            },
            reduce: function(key, values, rereduce) {
                return sum(values);
            }
        },
        countByMsisdn: {
            map: function(doc) {
                if(doc.latitude == null || doc.longitude == null) {
                    return null;
                } else {
                    return emit(doc.msisdn, 1);
                }
            },
            reduce: function(key, values, rereduce) {
                return sum(values);
            }
        },
        getAllGeopoint: {
            map: function(doc) {
                if(doc.latitude != null && doc.longitude != null) {
                    if (doc.radius < 1000)
                        return emit([doc.timestamp, doc.longitude, doc.latitude, doc.radius, doc._id], doc);
                }
            },
            reduce: function(key, values, rereduce) {
                return 1;
            }
        }
    },
    phonecommunicationlog: {
        
        byDay: function(doc) {
            if(doc.latitude.toLowerCase() !== "null" && doc.longitude.toLowerCase() !== "null") {
                return emit([doc.timestamp, doc.msisdn], doc);
            } else {
                return null;
            }
        },
        suscriberList: {
            map: function (doc) {
                if(doc.msisdn != "NULL") {
                    return emit(doc.msisdn, 1);
                } else {
                    return false;
                }
            },
            reduce: function (key, values, rereduce) {
                return 1;
            }
        },
        getAllPhone: {
            map: function(doc) {
                if(doc.latitude.toLowerCase() !== "null" && doc.longitude.toLowerCase() !== "null") {
                    return emit([doc.timestamp, doc.longitude, doc.latitude, doc.msisdn, doc.partner, doc.type, doc._id], doc._id);
                }
            },
            reduce: function(key, values, rereduce) {
                return 1;
            }
        }
    }
};
