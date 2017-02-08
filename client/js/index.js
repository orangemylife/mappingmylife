var mymap = L.map('mapid').setView([43.703, 7.266], 13);
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
/*var popup = L.popup();

function onMapClick(e) {

    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

mymap.on('click', onMapClick);*/
/*************************************************************************************/

/********** Ajout un marker sur un click **********/
function addMarker(e) {
	marker = new L.marker(e.latlng).addTo(mymap);
	marker.bindPopup('Lat : ' +e.latlng.lat+ '<br> long : '+e.latlng.lng);
	marker.on('mouseover', function (e) {
		this.openPopup();
		});
	marker.on('mouseout', function(e) {
		this.closePopup();
		});
	marker.on('click', function (e) {
		this.remove();
		});
	marker.on('contextmenu', function (e){
		this.bindPopup("Nouveau contenu");
		})
}

mymap.on('click', addMarker);

/*function removeMarker(e){
	this.remove()
}

function showPopup(e) {
	this.openPopup();
}

function showPopup(e) {
	this.closePopup();
}*/


function init() {
	console.log ("toto a velo");
	url = apiPath + getImportant;
    $.ajax(url, {
        dataType: "json",
        success: function(data) {
        	console.log(data);
        }
    });
}