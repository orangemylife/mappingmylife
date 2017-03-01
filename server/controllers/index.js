var geopoint = require('../models/geopoint');
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
    
    geopoint.rawRequest("byDay", params, function(err, templates) {
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
    geopoint.rawRequest("byDate", params, function(err, templates) {
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

    geopoint.rawRequest("mostImportant", params, function(err, templates) {
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
    
    geopoint.rawRequest("countByMsisdn", params, function(err, templates) {
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
};

module.exports.getAllGeopoint = function(req, res) {
    var params = {group: true};
    onSuccess= function() {
            
                res.send(200, {message: result});
            
        },
        onError = function(error) {
            if(!isError) {
                res.send(200, {error: error});
            }
            isError = true;
        };
    geopoint.rawRequest("getAllGeopoint", params, function(err, templates) {
        /*console.log (templates);*/
        result = {geopoint:[]}
        if(err !== null) {
           onError(err); 
        } else {
            if(templates && templates.length > 0) {
                for(var i = 0; i < templates.length; i += 1) {
                    result.geopoint.push({
                        "start": templates[i].key[0],
                        "longitude":templates[i].key[1],
                        "latitude": templates[i].key[2],
                        "radius": templates[i].key[3],
                        "id": templates[i].key[4]
                        });
                    
                };
            }
            onSuccess();
        }
    });
};

module.exports.getAllPhone = function(req, res) {
    var params = {group: true};

    phonecommunicationlog.rawRequest("getAllPhone", params, function(err, templates) {
        console.log (templates);
        result = {phonecalls: []};
        if(err !== null) {
            res.send(200, {error: err});
        } else {
            for(var i = 0; i < templates.length; i += 1) {
                if(templates[i].key[1] != null &&  templates[i].key[2] != null){
                    result.phonecalls.push({
                        "start": templates[i].key[0],
                        "longitude":templates[i].key[1],
                        "latitude":templates[i].key[2],
                        "msisdn":templates[i].key[3],
                        "partner":templates[i].key[4],
                        "type": templates[i].key[5],
                        "id": templates[i].key[6]
                    });
                    
                }
            }
            res.send(200, {message: result});
        }
    });
};

module.exports.getAll = function(req, res) {
     var params = {group: true};
     isError = false,
        count = 2,
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
        var result = {geopoint:[],phonecalls:[]};
        geopoint.rawRequest("getAllGeopoint", params, function(err, templates) {
            
            if(err !== null) {
               onError(err); 
            } else {
                if(templates && templates.length > 0) {
                    for(var i = 0; i < templates.length; i += 1) {
                        result.geopoint.push({"start": templates[i].key[0],
                            "longitude":templates[i].key[1],
                            "latitude": templates[i].key[2],
                            "radius": templates[i].key[3],
                            "id": templates[i].key[4]
                            });
                        
                    };
                }
                onSuccess();
            }
        });
        phonecommunicationlog.rawRequest("getAllPhone", params, function(err, templates) {
            
            if(err !== null) {
                res.send(200, {error: err});
            } else {
                for(var i = 0; i < templates.length; i += 1) {
                    if(templates[i].key[1] != null &&  templates[i].key[2] != null){
                        result.phonecalls.push({
                            "start": templates[i].key[0],
                            "longitude":templates[i].key[1],
                            "latitude":templates[i].key[2],
                            "msisdn":templates[i].key[3],
                            "partner":templates[i].key[4],
                            "typeMessage": templates[i].key[5],
                            "id": templates[i].key[6]
                        });
                        
                    }
                }
               onSuccess();
            }
        });
}
