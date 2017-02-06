var geolocationlog = require('../models/geopoint');
var phonecommunicationlog = require('../models/phonecommunicationlog');


module.exports.byDay = function(req, res) {
    var day = new Date(req.params.day),
        startDay, endDay;

    if (day) {
        day = day.toISOString().substring(0, 10);
        startDay = day + "A";
        endDay = day + "Z";
    } else {
        res.send(200, {error: "wrong date format"});
        return;
    }


	var params = {
            startkey: [startDay],
            endkey: [endDay]
        },
        result = {
            positions: [],
            phonecalls: [],
            subscriberNumbers: []
        },
        isError = false,
        count = 3,
        onSuccess= function() {
            count -= 1;
            if(count == 0 && !isError) {
                res.send(200, {message: result});
            }
        },
        onError = function(error) {
            if(!isError) {
                res.send(200, {error: error});
            }
            isError = true;
        };

	geolocationlog.rawRequest("byDay", params, function(err, templates) {
        if(err !== null) {
            onError(err);
        } else {
            if(templates && templates.length > 0) {
                var element, lastElement, lastElements = {};
                for(var i = 0; i < templates.length; i += 1) {
                    element = templates[i].value;
                    lastElement = lastElements[element.msisdn];

                    if(lastElement && lastElement.latitude == element.latitude && lastElement.longitude == element.longitude) {
                        lastElement.dateOut = element.timestamp;
                    } else {
                        result.positions.push(element);
                        element.dateIn = element.timestamp;
                        element.dateOut = element.timestamp;
                        lastElements[element.msisdn] = element;
                    }
                }
            }
            onSuccess();
        }
	});

    phonecommunicationlog.rawRequest("byDay", params, function(err, templates) {
        if(err !== null) {
           onError(err);
        } else {
            if(templates && templates.length > 0) {
                for(var i = 0; i < templates.length; i += 1) {
                    result.phonecalls.push(templates[i].value);
                };
            }
            onSuccess();
        }
    });

    phonecommunicationlog.rawRequest("suscriberList", {group: true}, function(err, templates) {
        if(err !== null) {
           onError(err);
        } else {
            if(templates && templates.length > 0) {
                for(var i = 0; i < templates.length; i += 1) {
                    result.subscriberNumbers.push(templates[i].key);
                };
            }
            onSuccess();
        }
    });
};

module.exports.byDate = function(req, res) {
    var params = {group: true};
    geolocationlog.rawRequest("byDate", params, function(err, templates) {
        if(err !== null) {
            console.log(err);
            res.send(200, {error: err});
        } else {
            res.send(200, {message: template});
        }
    });
};

module.exports.mostImportant = function(req, res) {
    var params = {
            group: true
        },
        numbersResults = {},
        sortFunc = function(a, b) {
            return (b.value - a.value);
        },
        isError = false,
        count = 2,
        onSuccess= function() {
            count -= 1;
            if(count == 0 && !isError) {

                for(var key in numbersResults) {
                    numbersResults[key].positions.sort(sortFunc);
                    numbersResults[key].positions.splice(10, numbersResults[key].positions.length);
                }

                res.send(200, {message: numbersResults});
            }
        },
        onError = function(error) {
            if(!isError) {
                res.send(200, {error: error});
            }
            isError = true;
        };

    geolocationlog.rawRequest("mostImportant", params, function(err, templates) {
        if(err !== null) {
            onError(err);
        } else {
            var result, phoneNumber,
                formatResult = function(resultItem) {
                    return {
                        latitude: resultItem.key[1],
                        longitude: resultItem.key[2],
                        value: resultItem.value
                    };
                };

            for(var i = 0; i < templates.length; i += 1) {
                result = templates[i];
                phoneNumber = result.key[0];

                if(!numbersResults[phoneNumber]){
                    numbersResults[phoneNumber] = {
                        positions: [ formatResult(result) ]
                    };
                } else {
                    numbersResults[phoneNumber].positions.push(formatResult(result));
                }
            }

            onSuccess();

        }
    });

    geolocationlog.rawRequest("countByMsisdn", params, function(err, templates) {
        if(err != null) {
            onError(err);
        } else {
            for(var i = 0; i < templates.length; i += 1) {
                if(!numbersResults[templates[i].key]){ numbersResults[templates[i].key] = {positions: []}; }
                numbersResults[templates[i].key].total = templates[i].value;
            }
            onSuccess();
        }
    });
}
