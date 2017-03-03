/*****************************************************************************
 ********************************* CONSTANTES ********************************
 *****************************************************************************/
var apiPath = "",
    getDay  = "getAllDay/",
    getImportant = "getImportant/",
    getAllGeoPoint = "getAllGeoPoint",
    getAllPhone = "getAllPhone",
    getAll = "getAll",
    getPeriod = "getPeriod/"
    GEOLOCITEM = "geoloc",
    PHONECALLITEM = "phonecall";


/*****************************************************************************
 ********************************* VARIABLES *********************************
 *****************************************************************************/
var numberList = [];
var radiusLayer = [];
var baseMaps = {};
var markers = new L.featureGroup();
var timeline;
var markersTab = [];
var phoneCallsTab = [];
var dataItems = [];
var geoItems = [];
var phoneItems = [];
var geoMarkers = [];
var phoneMarkers = [];
var recentDay;
/*var geoIcon =  L.icon({
    iconUrl: 'style/images/redIcon.png',
    iconRetinaUrl: 'style/images/redIcon-2x.png'
});*/
var geoIcon = L.AwesomeMarkers.icon({
    icon: 'street-view',
    markerColor: 'orange',
    prefix: 'fa'
  });
var phoneIcon = L.AwesomeMarkers.icon({
    icon: 'phone',
    markerColor: 'blue',
    prefix: 'fa'
  });
var streets = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia29yZGVsb3IiLCJhIjoiY2l5Ymo4NnloMDA3ZDJ3cWt4OHV0bHFwbyJ9.jFVQwINz__6hzbUEPNP04A', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 19,
    id: 'mapbox.streets'
    }),
    grayscale = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia29yZGVsb3IiLCJhIjoiY2l5Ymo4NnloMDA3ZDJ3cWt4OHV0bHFwbyJ9.jFVQwINz__6hzbUEPNP04A', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 19,
        id: 'mapbox.light'
       });
var mymap = L.map('mapid',{ layers: [ streets], zoom: 13, center: [48.866667,2.333333]});
var baseMaps = {
        
        "Streets": streets,
        "Grayscale": grayscale
    };
    
/**
 * Fonction d'initialisation de l'application
 */
function init() {
    
   
    // Initial TimeLine
    initTimeLine();
    // Appel à l'API pour récupérer les informations du jour sélectionné

    //getDayMarkers();
   
        
}



//Load TimeLine
function initTimeLine(){
    
    url = apiPath + getAll;
    
    $.ajax(url, {
        dataType: "json",
        success: function(data) {
            // Create a DataSet (allows two way data-binding)
            if(data && data.message) {
                var geoPoints = data.message.geopoint;
                var phoneCalls = data.message.phonecalls;
                if(geoPoints && geoPoints.length > 0) {
                    for(var i = 0; i < geoPoints.length; i += 1) {
                        var item = createGeoItems(geoPoints[i]);
                        geoItems.push(item);
                        dataItems.push(item);
                    }   
                }
                if(phoneCalls && phoneCalls.length > 0) {
                    for(var i = 0; i < phoneCalls.length; i += 1) {
                        var item = createPhoneItems(phoneCalls[i]);
                        phoneItems.push(item);
                        dataItems.push(item);
                    }   
                }

            }
            
            var recentDayGeo = geoPoints[geoPoints.length-1].start;
            var recentDayPhone = phoneCalls[phoneCalls.length-1].start;
            
            if(recentDayGeo.localeCompare(recentDayPhone) == -1){
                recentDay = recentDayPhone;
            }
            else{
                recentDay = recentDayGeo;
            }
            recentDay = recentDay.split(" ")[0];
            // DOM element where the Timeline will be attached
            var container = document.getElementById('timeline');
            // create groups
            var groups = new vis.DataSet([
            {id: 0, content: 'GeoLocation', value: 1, order: 1, className: GEOLOCITEM},
            {id: 1, content: 'PhoneCommunication', value: 2, order: 2, className: PHONECALLITEM}
            ]);
            // Configuration for the Timeline
            var options = {
                clickToUse: true,
                type: 'point',
                min: '2000-01-01',
                max:'2050-12-31',
                start: new Date(recentDay),
                stack: false,
                zoomMax: 1000 * 60 * 60 * 24 * 31 * 12 * 10,
                zoomMin: 1000 * 60,
                showCurrentTime: false,
                editable: false,
                orientation: 'top',
                locale: 'fr',
                tooltip: {
                    followMouse: true,
                    overflowMethod: 'cap'
                }
            };
            // Create a Timeline
            var items = new vis.DataSet(dataItems);
            timeline = new vis.Timeline(container, items, options, groups);
            var startDay, endDay;
            timeline.on('rangechanged', function (properties) {
                /*console.log(properties);*/
                if(properties.byUser){
                    startDay = formatDate(timeline.getWindow().start);
                    endDay = formatDate(timeline.getWindow().end)
                    document.getElementById('start').innerHTML = "start : " + startDay; 
                    document.getElementById('end').innerHTML = "end : " + endDay;

                    getPeriodDayMarkers(startDay, endDay);
                }
            });
            
            getPeriodDayMarkers(recentDay, recentDay);
            startDay = recentDay;
            endDay = recentDay;
            
            document.getElementById('start').innerHTML = "start : " + startDay; 
            document.getElementById('end').innerHTML = "end : " + endDay;
            
            //click itme to move to the marker attached
            document.getElementById('timeline').onclick = function (event) {
                var props = timeline.getEventProperties(event);
               
                if (props.item != null){
                    var idItem = props.item;
                    if (props.group == 0){
                        var item = getGeoItem(idItem);
                        var latitude = item.latitude;
                        var longitude = item.longitude;
                        var id = latitude.toString() + longitude.toString();
                        for(var i in geoMarkers){
                            var markerID = geoMarkers[i].options.alt;
                            if (markerID == id){
                                geoMarkers[i].openPopup();
                            };
                        }
                        mymap.panTo([latitude,longitude],{animate: true});
                        
                    }
                    if (props.group == 1){
                        var item = getPhoneItem(idItem);
                        var latitude = item.latitude;
                        var longitude = item.longitude;
                        var id = latitude.toString() + longitude.toString();
                        for(var i in phoneMarkers){
                            var markerID = phoneMarkers[i].options.alt;
                            if (markerID == id){
                                phoneMarkers[i].openPopup();
                            };
                        }
                        mymap.panTo([latitude,longitude],{animate: true});
                    }

                }
            }
        },
        error: function() {
            alert("Une erreur est survenue lors de la récupération des données, si le problème persiste contactez un administrateur.");
            console.error("Error retrieving data from server");
        }
    });
    
        
    /**
     * Move the timeline a given percentage to left or right
     * @param {Number} percentage   For example 0.1 (left) or -0.1 (right)
     */
    function move (percentage) {
        var range = timeline.getWindow();
        var interval = range.end - range.start;

        timeline.setWindow({
            start: range.start.valueOf() - interval * percentage,
            end:   range.end.valueOf()   - interval * percentage
        });
    }
    // attach events to the navigation buttons
    document.getElementById('zoomIn').onclick    = function () { timeline.zoomIn( 0.2); };
    document.getElementById('zoomOut').onclick   = function () { timeline.zoomOut( 0.2); };
    document.getElementById('moveLeft').onclick  = function () { move( 0.2); };
    document.getElementById('moveRight').onclick = function () { move(-0.2); };

    
}

function getGeoItem(id){
    for(key in geoItems) {
        if(geoItems[key].id == id) {
            return geoItems[key];
        }
    }
}
function getPhoneItem(id){
    for(key in phoneItems) {
        if(phoneItems[key].id == id) {
            return phoneItems[key];
        }
    }
}
function selectGeoInfo(position){
                var lat = position.latitude;
                var lng = position.longitude;
               
                for (var i = 0; i < markersTab.length; i++){
                    
                    if(markersTab[i].latitude == lat && markersTab[i].longitude == lng){
                        if(markersTab[i].radius > position.radius){
                            markersTab[i].radius = position.radius;
                        }
                        return markersTab[i].info;
                    }
                }

            }
function selectPhoneInfo(phonecall){
    var lat = phonecall.latitude;
    var lng = phonecall.longitude;
    for (var i=0; i<phoneCallsTab.length; i++){
        if (phoneCallsTab[i].latitude == lat && phoneCallsTab[i].longitude == lng){
            return phoneCallsTab[i].info;
        }
    }
}  
function addGeoInfo(geoInfo, position){
    var start = position.start.replace(/T|Z/g, " ");
    var id = position.id;
    geoInfo.push({start: start, id: id, itemTyoe: GEOLOCITEM});
} 
/**
 * Fonction qui permet de récuperer les données sur l'API cozy-cloud en fonction du jour entrée dans l'élément "date-filter"
 */
function getPeriodDayMarkers(start, end) {

    url = apiPath + getPeriod + start + '/' + end;
    $.ajax(url, {
        dataType: "json",
        success: function(data) {
            var positions,
                phonecalls,
                item;            
                markersTab = [];
                phoneCallsTab = []; 
            
            if(data && data.message) {
                positions = data.message.geopoint;
                phonecalls= data.message.phonecalls;
                if(positions && positions.length > 0) {
                    for(var i = 0; i < positions.length; i += 1) {
                        geoInfo = selectGeoInfo(positions[i]);
                        //console.log(geoInfo);
                        if(geoInfo != null){
                            geoInfo.push({start: positions[i].start.replace(/T|Z/g, " "), id: positions[i].id, itemType: GEOLOCITEM});

                        }else{
                            item = createMarker(positions[i]);
                            markersTab.push(item);
                        }
                        
                    }
                }
                
                if(phonecalls && phonecalls.length > 0) {
                    for(var i = 0; i < phonecalls.length; i += 1) {
                        phoneInfo = selectPhoneInfo(phonecalls[i]);
                        if(phoneInfo != null){
                            phoneInfo.push({start: phonecalls[i].start.replace(/T|Z/g, " "), id: phonecalls[i].id, itemType: GEOLOCITEM, 
                            msisdn: phonecalls[i].msisdn, partner: phonecalls[i].partner, typeMessage: phonecalls[i].typeMessage});

                        }else{
                            item = createPhoneMarker(phonecalls[i]);
                            phoneCallsTab.push(item);
                        }
                        
                    }
                }
                removerExistMarker();
                addGeoPoint(markersTab);
                addPhone(phoneCallsTab);
                if(start == end){
                    drawPolyline(positions, phonecalls);
                    
                }
                
            }
        },
        error: function() {
            alert("Une erreur est survenue lors de la récupération des données, si le problème persiste contactez un administrateur.");
            console.error("Error retrieving data from server");
        }
    });
}
/**
 * Fonction qui permet de récuperer les données sur l'API cozy-cloud en fonction du jour entrée dans l'élément "date-filter"
 */
function drawPolyline(positions, phonecalls) {
    var items = positions.concat(phonecalls);
    items.sort(function(a,b) { 
        return new Date(a.start).getTime() - new Date(b.start).getTime() 
    });
    var latlngs = [];
    for (var i = 0; i < items.length; i++) {
        /*if(items[i].latitude != items[i+1].latitude && items[i].longitude != items[i+1].longitude){*/
        latlngs.push([items[i].latitude, items[i].longitude]);
        /*}*/
    }
    var polyline = L.polyline(latlngs);
    var dashline= L.polylineDecorator(polyline,{
    patterns: [
        // defines a pattern of 10px-wide dashes, repeated every 20px on the line
        {offset: 10, repeat: 20, symbol: L.Symbol.dash({pixelSize: 10})}
    ]});
    var decorator = L.polylineDecorator(polyline);
    var arrowOffset = 0;
    
    var anim = window.setInterval(function() {
        decorator.setPatterns([
            {offset: arrowOffset+'%', repeat: 0, symbol: L.Symbol.arrowHead({pixelSize: 15, polygon: false, pathOptions: {stroke: true}})}
        ]);
        if(++arrowOffset > 100){
            arrowOffset = 0;
        }
    }, 200);
    
    markers.addLayer(polyline).addTo(mymap);
    markers.addLayer(decorator).addTo(mymap);
}

function createMarker(geolocation){
    var marker;
    marker = new Object();
    marker.latitude = geolocation.latitude;
    marker.longitude = geolocation.longitude;
    marker.radius = geolocation.radius;
    marker.info = [];
    var info = new Object();
    info.start =  geolocation.start.replace(/T|Z/g, " ");
    info.itemType = GEOLOCITEM;
    info.id = geolocation.id;
    marker.info.push(info);
    return marker;
}

function createPhoneMarker(phonecall){
    var marker;
    marker = new Object();
    marker.latitude = phonecall.latitude;
    marker.longitude = phonecall.longitude;
    marker.info = [];
    var info = new Object();
    info.start =  phonecall.start.replace(/T|Z/g, " ");
    info.itemType = PHONECALLITEM;
    info.id = phonecall.id;
    info.msisdn = phonecall.msisdn;
    info.partner = phonecall.partner;
    info.typeMessage = phonecall.typeMessage;
    marker.info.push(info);
    //console.log(marker);
    return marker;
}

/**
 * Formatte une date en YY-mm-dd
 *
 * @param date: un objet date
 */
function formatDate(date) {
    var year = date.getFullYear() + "",
        month = (date.getMonth() + 1) + "",
        day = date.getDate() + "";
        hours = date.getHours() + "";
        minutes = date.getMinutes() + "";
        seconds = date.getSeconds() + "";
    if(month.length == 1) { month = "0" + month; }
    if(day.length == 1) { day = "0" + day; }
    if(hours.length == 1) { hours = "0" + hours; }
    if(minutes.length == 1) { minutes = "0" + minutes; }
    if(seconds.length == 1) { seconds = "0" + seconds; }

    
    /*return year + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds;*/
    return year + "-" + month + "-" + day;
}

/**
 * Fonction create geolocation item
 *
 * @param value: données de l'item
 */
function createGeoItems(value) {
    var marker;
    marker = value;
    marker.start = value.start.replace(/T|Z/g, " ");
    marker.template = "geotemplate";
    marker.className = GEOLOCITEM;
    marker.group = 0;
    marker.title = '<div class="data-tooltip"><p>Position: (' + value.latitude +', '+  value.longitude + ')</p><p>Timestamp: '+ value.start +'</div>'
    return marker;
    
}
/**
 * Fonction create phoneCommunication item
 *
 * @param value: données de l'item
 */
function createPhoneItems(value) {
    var marker;
    marker = value;
    marker.start = value.start.replace(/T|Z/g, " ");
    marker.template = "phonetemplate";
    marker.className = PHONECALLITEM;
    marker.group = 1;
    marker.title = '<div class="data-tooltip"><p>Numéro de contact: ' 
            + value.partner+'</p><p>Type d\'appel: ' + value.typeMessage + '</p></div>'; 
    return marker;
    
}

// clear existing markers before add the new one
function removerExistMarker() {
    
    markers.clearLayers();
    
}


/******* Creation des marker du telephone *******/
function addPhone(phone) {
    for (var i =0; i<phone.length; i++){
        phoneInfo = phone[i];
        marker = new L.marker([phoneInfo.latitude, phoneInfo.longitude],{alt:phoneInfo.latitude.toString() + phoneInfo.longitude.toString(),icon: phoneIcon});
        markers.addLayer(marker).addTo(mymap);
        phoneMarkers.push(marker);
        /****** Creation des info de la popup *******/

        if (phoneInfo.info.length != 1){
            var strmulti = " <div class='titre'> Nombre de communications = "+phoneInfo.info.length+"</div><br>"+
                  " <div id='info' style='display:none'>"
            var infoComm = "";
            for (var l=0;  l<phoneInfo.info.length; l++){
                infoComm =  infoComm +
                            '<div class="markerPopup">Latitude: ' + phoneInfo.latitude + 
                            '<p>Longitude: '+ phoneInfo.longitude + 
                            '</p><p>Numéro d\'appel: +'+ phoneInfo.info[l].partner +
                            '</p><p>Data Type: '+ phoneInfo.info[l].typeMessage + 
                            '</p><p>Date: ' + phoneInfo.info[l].start +
                            '</p><p hidden>Id: ' + phoneInfo.info[l].id +'</p></div><br>'
            }
            str =   strmulti + infoComm +
                    "</div>"+
                    "<div id='showhide' onclick='showhide()' >afficher tout</div>";
        } else {
            str =  '<div>Latitude: ' + phoneInfo.latitude + 
                            '<br>Longitude: '+ phoneInfo.longitude + 
                            '<br>Numéro d\'appel: '+ phoneInfo.info[0].partner +
                            '<br>Data Type: '+ phoneInfo.info[0].typeMessage + 
                            '<br>Date: ' + phoneInfo.info[0].start +
                            '<br><p hidden>Id: ' + phoneInfo.info[0].id +'</p></div>'
        }
        marker.bindPopup(str);
        var content = marker._popup.getContent();
        marker.on('click',function(){
                var geoContent = this._popup.getContent();
                var item_id= geoContent.split('Id: ')[1].split('</p>')[0];
                timeline.setSelection(item_id, {focus:true});
            });
        /*marker.on('mouseout', function(e) {
            this.closePopup();
        });*/
    }
}
/******* Creation des marker antenne *******/
function addGeoPoint(geolocation) {
    for (var i = 0; i < geolocation.length; i++){
        geoInfo = geolocation[i];
        marker = L.marker([geoInfo.latitude, geoInfo.longitude],{alt:geoInfo.latitude.toString() + geoInfo.longitude.toString(), icon: geoIcon});
        geoMarkers.push(marker);
        markers.addLayer(marker).addTo(mymap);
        /****** Creation des info de la popup *******/

        if (geoInfo.info.length != 1){
            var strmulti = " <div class='titre'> Nombre de geolocations = "+ geoInfo.info.length + "</div><br>" +
                  " <div id='info' style='display:none'>"
            var infoComm = "";
            for (var l=0;  l<geoInfo.info.length; l++){
                infoComm =  infoComm +
                            '<div class="markerPopup">Latitude: ' + geoInfo.latitude + 
                            '<p>Longitude: '+ geoInfo.longitude + 
                            '</p><p>Radius: ' + geoInfo.radius +
                            '</p><p>Date: ' + geoInfo.info[l].start +
                            '</p><p hidden>Id: ' + geoInfo.info[l].id +'</p></div><br>'
            }
            str =   strmulti + infoComm +
                    "</div>"+
                    "<div id='showhide' onclick='showhide()' >afficher tout</div>";
        } else {
            str =  '<div>Latitude: ' + geoInfo.latitude + 
                            '<br>Longitude: '+ geoInfo.longitude + 
                            '<br>Radius: ' + geoInfo.radius +
                            '<br>Date: ' + geoInfo.info[0].start +
                            '<br><p hidden>Id: ' + geoInfo.info[0].id +'</p></div>'
        }
        marker.bindPopup(str);
        marker.on('click',function(){
            var geoContent = this._popup.getContent();
            var item_id= geoContent.split('Id: ')[1].split('</p>')[0];
            timeline.setSelection(item_id,{focus: true});
        });
    }
}
function showhide(){
    if ($("#info").css('display') == "none"){
        $("#info").removeAttr('style');
        $("#showhide").text("cacher tout");
    }else {
         $("#info").css('display', 'none');
         $("#showhide").text("afficher tout");
    }
}


