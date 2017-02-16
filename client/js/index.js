/*var mymap = L.map('mapid').setView([43.703, 7.266], 13);*/
var mymap = L.map('mapid', {center: [48.866667,2.333333],zoom:13});
/*var marker = L.marker([43.703, 7.280]).addTo(mymap);*/

var apiPath = "",
    getDay  = "getAllDay/",
    getImportant = "getImportant/";


L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1Ijoia29yZGVsb3IiLCJhIjoiY2l5Ymo4NnloMDA3ZDJ3cWt4OHV0bHFwbyJ9.jFVQwINz__6hzbUEPNP04A', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets'
   }).addTo(mymap);

/*var circle = L.circle([43.703, 7.2], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 500
}).addTo(mymap);*/



/*marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
circle.bindPopup("I am a circle.");*/

/********************** Pour recup les coordonnees sur un click **********************/
var popup = L.popup();

/*function onMapClick(e) {

    popup
        .setLatLng(e.latlng)
        .setContent("latitude : " + e.latlng.lat+"<br> longitude : " +e.latlng.lng)
        .openOn(mymap);
}

mymap.on('click', onMapClick);*/
/*************************************************************************************/

/********** Création des markers personnalises **********/

var greenIcon = L.icon({
    iconUrl: '../img/leaf-green.png',

    iconSize:     [19, 48], // size of the icon
    iconAnchor:   [19, 48], // point of the icon which will correspond to marker's location
    popupAnchor:  [-3, -48] // point from which the popup should open relative to the iconAnchor
});


/******* Creation des marker antenne *******/
function addAntenne(antenne) {
    for (var i = 0; i < antenne.length; i++){
        cercle = new L.circle([antenne[i].latitude,antenne[i].longitude], {radius: antenne[i].radius}).addTo(mymap);
        cercle.bindPopup('Latitude : ' +antenne[i].latitude+ '<br> Longitude : '+antenne[i].longitude+ '<br> Radius : '+antenne[i].radius);
        cercle.on('click', function (e) {
            this.openPopup();
        });
        /*marker.on('click', function (e) {
            this.remove();
        });
        marker.on('contextmenu', function (e){
            this.bindPopup("Nouveau contenu");
        })*/
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

function initBind(){
    $('.layerSwitcher [name=dataType]').change(function(e) {
        var targetID = e.target.id;

        switch(targetID) {
            case "agregatedRadio":
                hideDaySelector();
                getImportantMarkers();
                break;
            case "dayByDayRadio":
                displayDaySelector();
                getDayMarkers();
                break;
        }
    });

    document.getElementById('openclose').onclick = function() {
        var node = $('#openclose');

        if(node.hasClass('open')) {
            node.removeClass('open');
            node.addClass('close');
            $('.layerSwitcher .container').css('display', 'block');
        } else {
            node.addClass('open');
            node.removeClass('close');

            $('.layerSwitcher .container').css('display', 'none');
        }
    };

    $('#date-filter-form').bind('submit', function(e) {
        e.preventDefault();
        getDayMarkers();
    });

    $('#timelineLeft').bind('click', function(e) {
        moveTimeLine(-1);
    });

    $('#timelineRight').bind('click', function(e) {
        moveTimeLine(1);
    });
    // Etait utilisé pour centrer la carte lorsque l'on cliquait sur l'element principal de la timeline
    // maintenant lorsque l'on clique sur un element on est deja redirigé
//  $('.timelineItemSelected').bind('click', redirectMarker);
}

/**
 * Fonction qui permet de récuperer les données sur l'API cozy-cloud en fonction du jour entrée dans l'élément "date-filter"
 */
function getDayMarkers() {
    var split = document.getElementById("date-filter").value.split('-'),
        date = new Date(split[0], split[1]-1, split[2]),
        url;

    if(!date) {
        error && error("wrong date type");
        return;
    }

    date = formatDate(date);
    url = apiPath + getDay + date;
    $.ajax(url, {
        dataType: "json",
        success: function(data) {
            var positions,
                phonecalls,
                numbers,
                item;

            markersTab = [];
            phoneCallsTab = [];
            timelineTab = [];

            if(data && data.message) {
                positions = data.message.positions;
                phonecalls= data.message.phonecalls;
                if(numberList.length == 0) {
                    numberList= data.message.subscriberNumbers;
                    initLayers();
                }

                if(positions && positions.length > 0) {
                    for(var i = 0; i < positions.length; i += 1) {
                        item = createMarker(positions[i]);
                        markersTab.push(item);
                        timelineTab.push(item);
                    }
                }
                if(numberList && numberList.length > 0) {
                    if(phonecalls && phonecalls.length > 0) {
                        for(var i = 0; i < phonecalls.length; i += 1) {
                            item = createPhoneMarker(phonecalls[i]);
                            phoneCallsTab.push(item);
                            timelineTab.push(item);
                        }
                    }
                }

                timelineTab.sort(function(a, b) {
                    return (b.timestamp > a.timestamp) ? -1 : (b.timestamp == a.timestamp ? 0 : 1);
                });
                updateMap();
            }
        },
        error: function() {
            alert("Une erreur est survenue lors de la récupération des données, si le problème persiste contactez un administrateur.");
            console.error("Error retrieving data from server");
        }
    });
}


/******* Creation des marker du telephone *******/
function addPhone(phone) {
    for (var i =0; i<phone.length; i++){
        phoneInfo = phone[i];
        marker = new L.marker([phoneInfo.latitude,phoneInfo.longitude], {icon: greenIcon}).addTo(mymap);

        /****** Creation des info de la popup *******/

        if (phoneInfo.info.length != 1){
            var strmulti = " <div class='titre'> Nombre de communications = "+phoneInfo.info.length+"</div>"+
                  " <div id='info' style='display:none'>"
            var infoComm = "";
            for (var l=0;  l<phoneInfo.info.length; l++){
                infoComm =  infoComm +
                            "<div id='msisdn' class='msisdn'> msisdn : "+phoneInfo.info[l].msisdn+"</div>"+
                            "<div id='partner' class='partner'> partner : "+phoneInfo.info[l].partner+"</div>"+
                            "<div id='comm' class='comm'> Type : "+phoneInfo.info[l].comm+"</div><br>";
            }
            str =   strmulti + infoComm +
                    "</div>"+
                    "<div id='showhide' onclick='showhide()' >afficher tout</div>";
        } else {
            str =  "<div id='msisdn' class='msisdn'> msisdn : "+phoneInfo.info[0].msisdn+"</div>"+
                    "<div id='partner' class='partner'> partner : "+phoneInfo.info[0].partner+"</div>"+
                    "<div id='comm' class='comm'> Type : "+phoneInfo.info[0].comm+"</div><br>";
        }
        marker.bindPopup(str);
        marker.on('click', function (e) {
            this.openPopup();
        });
        /*marker.on('mouseout', function(e) {
            this.closePopup();
        });*/
    }
}




   /* marker = new L.marker([latitude,longitude], {icon: greenIcon}).addTo(mymap);
    marker.bindPopup('Nom Numero : ' +msisdn+ '<br> mon partner : '+partner+ '<br> type de comm : ' + comm);
    marker.on('mouseover', function (e) {
        this.openPopup();
    });
    marker.on('mouseout', function(e) {
        this.closePopup();
    });*/
    /*marker.on('click', function (e) {
        this.remove();
    });
    marker.on('contextmenu', function (e){
        this.bindPopup("Nouveau contenu");
    })*/

//mymap.on('click', addMarker);

function init() {
    initBind();
    url = apiPath + "getAllGeoppoint";
    $.ajax(url, {
        dataType: "json",
        success: function(data) {
            latitude = data.message.latitude;
            longitude = data.message.longitude;
            radius = data.message.radius;

            antenneTab = [];

            function selectRadius(latitude, longitude, tour){
                for (var i=0; i<antenneTab.length; i++){
                    if (antenneTab[i].latitude === latitude && antenneTab[i].longitude === longitude){
                        return antenneTab[i].radius;
                    }
                }
            }


            for (var i = 0; i < latitude.length; i++){
                    _radius = selectRadius(latitude[i], longitude[i], i)
                if (_radius != null && _radius > radius[i]){
                    _radius = radius[i];
                }else if(_radius == null) {
                    /*if ( antenne.latitude.indexOf(data.message.latitude[i]) < 0 && antenne.longitude.indexOf(data.message.longitude[i]) < 0){
                        antenne.latitude.push(data.message.latitude[i]);
                        antenne.longitude.push(data.message.longitude[i]);
                        antenne.radius.push(data.message.radius[i]);
                    }*/
                    antenne = new Object();
                    antenne.latitude = latitude[i];
                    antenne.longitude = longitude[i];
                    antenne.radius = radius[i];
                    antenneTab.push(antenne);
                }
            }
            addAntenne(antenneTab);
        },
        error: function() {
            alert("Une erreur est survenue lors de la récupération des données, si le problème persiste contactez un administrateur.");
            console.error("Error retrieving data from server");
        }
    });
    $.ajax("getAllPhone", {
        dataType: "json",
        success: function(data) {
            phoneTab = [];

            toto = data;
            latitude = data.message.latitude;
            longitude = data.message.longitude;
            msisdn = data.message.msisdn;
            partner = data.message.partner;
            comm = data.message.comm;

            function selectCoord(latitude, longitude, tour){
                for (var i=0; i<phoneTab.length; i++){
                    if (phoneTab[i].latitude === latitude && phoneTab[i].longitude === longitude){
                        return phoneTab[i].info;
                    }
                }
            }

            for (var i = 0 ; i < latitude.length; i++){
                infoTel = selectCoord(latitude[i], longitude[i], i);
                if (infoTel != null){
                    infoTel.push({msisdn: msisdn[i], partner: partner[i], comm: comm[i]});
                }else{
                    info = new Object();
                    info.msisdn = msisdn[i];
                    info.partner = partner[i];
                    info.comm = comm[i];

                    coord = new Object ();
                    coord.latitude = latitude[i];
                    coord.longitude = longitude[i];
                    coord.info = [];
                    coord.info.push(info);

                    phoneTab.push(coord);
                }

            }
            addPhone(phoneTab);
        },
        error: function() {
            alert("Une erreur est survenue lors de la récupération des données, si le problème persiste contactez un administrateur.");
            console.error("Error retrieving data from server");
        }
    });
}


