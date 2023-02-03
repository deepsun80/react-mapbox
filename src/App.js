import { useRef, useEffect, useState } from 'react';
import ReactDOM from "react-dom";
import mapboxgl from 'mapbox-gl';
import axios from 'axios';
import 'mapbox-gl/dist/mapbox-gl.css';
import "mapbox-gl-style-switcher/styles.css";
import { BsLayersHalf } from 'react-icons/bs';
import Popup from './Popup';
const forestBoundaries = require('./sources/forestBoundaries.json');

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const App = () => {
  const mapContainer = useRef();
  const popUpRef = useRef(new mapboxgl.Popup({ offset: 15 }));

  const [style, setStyle] = useState('');
  const [styleToggle, setStyleToggle] = useState(false);

  const handleClick = event => {
    setStyleToggle(!styleToggle);
  }

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: style,
      center: [-115.59265136718749, 44.008620115415354],
      zoom: 6
    });

    map.on('load', () => {
      map.addSource('mapbox-dem', {
        type: 'raster-dem',
        url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
        tileSize: 512,
        maxZoom: 16
      });

      map.setTerrain({ 
        source: 'mapbox-dem', 
        'exaggeration': 1.5 
      });

      map.addSource('forest-boundaries', {
        type: 'geojson',
        data: forestBoundaries
      });
    
      map.addLayer({
        id: 'forest-boundaries-fill',
        type: 'fill',
        source: 'forest-boundaries',
        paint: {
          'fill-opacity': 0.5,
          'fill-color': styleToggle ? 'limegreen' : 'darkgreen',
        }
      });
      map.addLayer({
        id: 'forest-boundaries-line',
        type: 'line',
        source: 'forest-boundaries',
        layout: {
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': 'white',
          'line-width': 3
        }
      });

      map.addLayer({
        id: 'sky',
        type: 'sky',
        paint: {
          'sky-type': 'atmosphere',
          'sky-atmosphere-sun': [0.0, 90.0],
          'sky-atmosphere-sun-intensity': 15
        }
      });
    });

    map.on('click', async (e) => {
      try {
        // Fetch weather data
        const res = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${e.lngLat.lat}&lon=${e.lngLat.lng}&exclude=minutely,hourly,daily,alerts&appid=${process.env.REACT_APP_OW_TOKEN}&units=imperial`)
        const { data } = res;
        const features = map.queryRenderedFeatures(e.point, {
          layers: ['forest-boundaries-fill', 'forest-boundaries-line']
        });
  
        if (features?.length > 0 && features[0]?.properties) {
          const { properties } = features[0];
          // create popup node
          const popupNode = document.createElement('div');
          ReactDOM.render(
            <Popup
              title={properties?.PROJECTNAME}
              acres={properties?.GIS_ACRES}
              year={properties?.PROJECTSTARTYEAR}
              weatherData={{
                  temp: data?.main?.temp,
                  humidity: data?.main?.humidity,
                  weather: data?.weather[0]?.description,
                  icon: data?.weather[0]?.icon
                }}
            />,
            popupNode
          );
          popUpRef.current
            .setLngLat(e.lngLat)
            .setDOMContent(popupNode)
            .addTo(map);
        }
      } catch(err) {
        console.error(err); 
      }
    });

    // Controls
    map.addControl(
      new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }),
      'top-left'
    );
    map.addControl(new mapboxgl.NavigationControl(), 'top-left');

    // cleanup function to remove map on unmount
    return () => map.remove()
  }, [style, styleToggle]);

  useEffect(() => {
    styleToggle ? 
      setStyle('mapbox://styles/deepsun80/cl4de9x39002j15qr0ovi1mri') :
      setStyle('mapbox://styles/deepsun80/cl28wbm5a000514p9gd0e53ay');
  }, [styleToggle])

  return (
    <div className='root'>
      <button
        className='layer-button'
        style={{ background: styleToggle ? '#000' : '#fff' }}
        onClick={handleClick}
      >
        <BsLayersHalf style={{ 
          fontSize: '23px',
          color: styleToggle ? '#fff' : '#000'
        }} />
      </button>
      <div ref={mapContainer} className='map-container' />
    </div>
  );
}

export default App