// Creates global variables
var map, marker;
var markers = [];

//initMap called from index.html as ajax callback function.
// This function will 
//1. fill the global array markers with all locations.
//2. create map with initial zoom level and custom style and center log,lat
//3. create all markers with default color for all locations.
function initMap() {

    // Top places for Mumbai
    var locations = [{
            title: 'Gateway of India',
            location: {
                lat: 18.921984,
                lng: 72.834654
            }
        },
        {
            title: 'Zoo',
            location: {
                lat: 18.978710,
                lng: 72.835121
            }
        },
        {
            title: 'Jehangir Art Gallery',
            location: {
                lat: 18.927456,
                lng: 72.831703
            }
        },
        {
            title: 'Essel World',
            location: {
                lat: 19.232724,
                lng: 72.805508
            }
        },
        {
            title: 'Film Studio',
            location: {
                lat: 19.162903,
                lng: 72.883690
            }
        }
    ];

    // Create a styles array to use with the map.
    var styles = [{
        featureType: 'water',
        stylers: [{
            color: '#19a0d8'
        }]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [{
                color: '#ffffff'
            },
            {
                weight: 6
            }
        ]
    }, {
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [{
            color: '#e85113'
        }]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.stroke',
        stylers: [{
                color: '#efe9e4'
            },
            {
                lightness: -40
            }
        ]
    }, {
        featureType: 'transit.station',
        stylers: [{
                weight: 9
            },
            {
                hue: '#e85113'
            }
        ]
    }, {
        featureType: 'road.highway',
        elementType: 'labels.icon',
        stylers: [{
            visibility: 'off'
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.stroke',
        stylers: [{
            lightness: 100
        }]
    }, {
        featureType: 'water',
        elementType: 'labels.text.fill',
        stylers: [{
            lightness: -100
        }]
    }, {
        featureType: 'poi',
        elementType: 'geometry',
        stylers: [{
                visibility: 'on'
            },
            {
                color: '#f0e4d3'
            }
        ]
    }, {
        featureType: 'road.highway',
        elementType: 'geometry.fill',
        stylers: [{
                color: '#efe9e4'
            },
            {
                lightness: -25
            }
        ]
    }];

    // Constructor creates a new map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 19.075984,
            lng: 72.877656
        },
        zoom: 11,
        styles: styles,
        mapTypeControl: false
    });

    // The following group uses the 'data' array to create an array of markers on 
    // initialize.
    var largeInfoWindow = new google.maps.InfoWindow();
    
    // Creates a "default location" marker color for when user
    // closes infowindow
    var defaultIcon = makeMarkerIcon('4124ff');

    // Creates a "highlighted location" marker color for when the user
    // clicks on the marker.
    var highlightedIcon = makeMarkerIcon('24ff3e');
    for (var i = 0; i < locations.length; i++) {
        // Get the position and title from the data array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            icon: defaultIcon,
            id: i
        });
        // Attach the marker to the place object
        vm.places()[i].marker = marker;
        // Push the marker to our array of markers.
        markers.push(marker);
        
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            //populateInfoWindow with getStreetview
            populateInfoWindow(this, largeInfoWindow);
        });
    }


    // This function populates the infowindow when the marker is clicked. We'll only allow
    // one infowindow which will open at the marker that is clicked, and populate based
    // on that markers position.
    function populateInfoWindow(marker, infowindow) {
        // Creates a "default location" marker color for when user
        // closes infowindow
        var defaultIcon = makeMarkerIcon('65135B');
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            // Clear the infowindow content to give the streetview time to load.
            infowindow.setContent('');
            infowindow.marker = marker;
            //highlight  the selected marker and also set animation.
            marker.setIcon(highlightedIcon);
            marker.setAnimation(google.maps.Animation.BOUNCE);
            setTimeout(function() {
                marker.setAnimation(google.maps.Animation.DROP);
                marker.setIcon(defaultIcon);
            }, 4900);

            // Make sure the marker property is cleared if the infowindow is closed.
            infowindow.addListener('closeclick', function() {
                //infowindow.setMarker = null;
                marker.setAnimation(null);
                marker.setIcon(defaultIcon);
            });
        }

        var streetViewService = new google.maps.StreetViewService();
        var radius = 50;
        // In case the status is OK, which means the pano was found, compute the
        // position of the streetview image, then calculate the heading, then get a
        // panorama from that and set the options
        function getStreetView(data, status) {
            if (status == google.maps.StreetViewStatus.OK) {
                var nearStreetViewLocation = data.location.latLng;
                var heading = google.maps.geometry.spherical.computeHeading(
                    nearStreetViewLocation, marker.position);
                var panoramaOptions = {
                    position: nearStreetViewLocation,
                    pov: {
                        heading: heading,
                        pitch: 30
                    }
                };
                var panorama = new google.maps.StreetViewPanorama(
                    document.getElementById('pano'), panoramaOptions);
            } else {
                infowindow.setContent(infowindow.getContent() + '<hr/>' + '<div>' + marker.title + '</div>' +
                    '<div>No Street View Found</div>');
            }
        }
        var innerHTML = '<div>';
        innerHTML += '<h3>' + marker.title + '</h3>'+'<hr/>';

        fsRating(marker.title, function(data) {
            infowindow.setContent(innerHTML += 'Foursquare says..<br/>' +
                '<strong> ' + data.usersCount + '</strong> ' +
                '  foursquare user(s) checked into ' + marker.title +
                '<strong> ' + data.checkinsCount + ' </strong>  times.<hr/>' + '<div id="pano"></div>');

            streetViewService.getPanoramaByLocation(marker.position, radius, getStreetView);
        });
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }

    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

    // Foursquare helper function
    function callFoursquare(data, callback) {

        // Specify foursquare url components
        var VERSION = "20170921";
        var CLIENT_SECRET = "ZEFVVCDICF13IUFJRBLGXQB53W2XER4RPGJN2TZA1SX1S3N1";
        var CLIENT_ID = "3MPGYMDKGY33SOZKNXU3GGBNKGJVEMAFNJRTPMDRWFMW0MWH";
        var LL = "39.513295,-119.81618";
        var query = data.toLowerCase().replace("", "");
        var fsURL = "https://api.foursquare.com/v2/venues/search?v=" + VERSION + "&ll=" + LL + "&query=" + query + "&client_id=" + CLIENT_ID + "&client_secret=" + CLIENT_SECRET;

        // Request JSON from foursquare api, process response
        $.getJSON(fsURL).done(function(data) {
            var place = data.response.venues[0];
            callback(place);
        }).fail(function() {
            alert("Apologies. The Foursquare API returned an error.");
        });
        //Debugging code used to ensure the callFoursquare function is returning
        //the correct data unique to the location selected in map
        console.group('Debug location details');
        console.log(data + ' vs ' + title);
        console.groupEnd();
    }

    // Function for returning the check-ins of a place on foursquare
    function fsRating(data, callback) {
        callFoursquare(data, function(data) {
            var foursquare = {};
            foursquare.checkinsCount = data.stats.checkinsCount;
            foursquare.usersCount = data.stats.usersCount;
            callback(foursquare);
        });
    }
}


// Handles error if map doesn't load 
//called from index.html incase of error
mapError = function() {
    alert("Apologies. The Google Maps API didn't load correctly. Please try again later.");
};


// My ViewModel.
ViewModel = function() {
    var self = this;

    self.places = ko.observableArray([{
            title: 'Gateway of India',
            address: 'Apollo Bunder, Colaba, Mumbai, Maharashtra 400001, India',
            pnumber: '+91-22-22044040',
            placeId: ''
        },
        {
            title: 'Jijamata Udyan, Zoo',
            address: 'Dr Baba Saheb Ambedkar Road, Byculla, Mumbai, Maharashtra 400008, India',
            pnumber: '+91-22-23742162',
        },
        {
            title: 'Jehangir Art Gallery',
            address: ' 161 Kala Ghoda, Mumbai, Maharashtra 400001, India',
            pnumber: '+91-22-22843989',
        },
        {
            title: 'Essel World',
            address: 'Global Pagoda Road, Gorai Island, Mumbai, Maharashtra 400091, India',
            pnumber: '+91-22-65280305',
        },
        {
            title: 'Dadasaheb Phalke Chitranagri, Filmcity Mumbai',
            address: ' Film City Road, Goregaon (East), Mumbai, Maharashtra 400065, India',
            pnumber: '+91-22-28401533',
        }
    ]);


    // Filters 'Top Places'.
    self.filter = ko.observable('');
    self.filteredPlaces = ko.computed(function() {
        var filter = self.filter().toLowerCase();
        if (!filter) {
            self.places().forEach(function(place) {
                if (place.marker) {
                    place.marker.setVisible(true);
                }
            });
            return self.places();
        } else {
            return ko.utils.arrayFilter(self.places(), function(place) {
                if (place.title.toLowerCase().indexOf(filter) > -1) {
                    place.marker.setVisible(true);
                    return true;
                } else {
                    place.marker.setVisible(false);
                    return false;
                }
            });
        }
    }, self);

    self.showInfo = function(location) {
        google.maps.event.trigger(location.marker, 'click');
    };
};
var vm = new ViewModel();
ko.applyBindings(vm);
