function initialize() {
  var address = (document.getElementById('my-address'));
  var autocomplete = new google.maps.places.Autocomplete(address);
  autocomplete.setTypes(['geocode']);
  google.maps.event.addListener(autocomplete, 'place_changed', function() {
    var place = autocomplete.getPlace();
    if (!place.geometry) {
        return;
    }
    var address = '';
    if (place.address_components) {
      address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
          ].join(' ');
    }
  });
}

function reportDay(index, weatherObj) {
  if (weatherObj.error) {
  	return "<div class='day-block'><h4>Day -" + index + "</h4><div class='date'>" + weatherObj.error + "</div></div>";
  }
  let result = "<div class='day-block'><h4>Day -" + index + "</h4><div class='date'>" + weatherObj.dateTime.substring(0, 10) + "</div>";
  result += "<div class='summary'>" + weatherObj.summary + "</div>";
  result += "<div class='sub-info'>High: " + weatherObj.temperatureHigh + "   Low: " + weatherObj.temperatureLow + "</div>";
  result += "<div class='sub-info'>Humidity: " + weatherObj.humidity + "</div>";
  result += "<div class='sub-info'>Pressure: " + weatherObj.pressure + "</div>";
  result += "<div class='sub-info'>Wind Speed: " + weatherObj.windSpeed + "</div>";
  result += "</div>"
  return result;
}

function codeAddress() {
  geocoder = new google.maps.Geocoder();
  const address = document.getElementById("my-address").value;
  geocoder.geocode( { 'address': address}, function(results, status) {
    const panel = document.getElementById('result-panel');
    if (status == google.maps.GeocoderStatus.OK) {
      // panel.innerHTML = "Lat-Lon: "+results[0].geometry.location.lat()+", "+results[0].geometry.location.lng();
      if (!results || !Array.isArray(results) || results.length < 1 || !results[0].geometry || !results[0].geometry.location) {
        panel.innerHTML = "<div class='error'>Error: Failed to get latitude and longitude info.</div>";
      }
      else {
        const url = 'https://service-1-dot-weather-service-199721.appspot.com/api/last-week?lat='
        	+results[0].geometry.location.lat()+'&lon='+results[0].geometry.location.lng();
        fetch(url)
          .then((resp) => resp.json())
          .then(function(data) {
            // console.log(JSON.stringify(data));
            let innerHtml = "";
            if (!Array.isArray(data)) {
              innerHtml = "<div class='error'>Error: " + data + "</div>";
            }
            else {
              for (let i=1; i<=data.length; i++) {
                innerHtml += reportDay(i, data[i-1]);
              }
            }
            panel.innerHTML = innerHtml;
          });
      }
    }
    else {
      panel.innerHTML = "<div class='error'>Error: Failed to get Google geocoding info.</div>";
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

google.maps.event.addDomListener(window, 'load', initialize);