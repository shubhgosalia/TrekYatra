mapboxgl.accessToken =mapToken;

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: trek.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

//adding map control
map.addControl(new mapboxgl.NavigationControl());


new mapboxgl.Marker()
    .setLngLat(trek.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset:25})
            .setHTML(
                `<h5>${trek.title}</h5><p>${trek.location}</p>`
            )
    )
    .addTo(map)