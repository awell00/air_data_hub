import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import '../../css/app.css';
import Radar from 'radar-sdk-js';
import 'radar-sdk-js/dist/radar.css';
import mapboxgl from 'mapbox-gl';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';

type Coordinate = [number, number];

Radar.initialize('prj_live_pk_e0443df992afd7bebd2ae00bfbc34e850a743aea');

const App: React.FC = () => {

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [center, setCenter] = useState<Coordinate | undefined>();
    const { t } = useTranslation();

    useEffect(() => {
        const userLang = navigator.language || navigator.language;
        const language = userLang.startsWith('fr') ? 'fr' : 'en'; // Default to 'en' if the user's language is not 'fr'
        i18n.changeLanguage(language);
    }, [i18n]);

    useEffect(() => {
        if (!mapContainer.current) return;

        fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .then(data => {
                const ip = data.ip;

                // Fetch the geolocation data
                fetch(`http://ip-api.com/json/${ip}`)
                    .then(response => response.json())
                    .then(data => {
                        const lat = data.lat;
                        const lon = data.lon;


                        mapboxgl.accessToken = 'pk.eyJ1Ijoicm9iaW5zaG9vZCIsImEiOiJjbHVsOG1vcTUwaGt1Mmlsd2h3dTM0ZzFvIn0.W-MBSYBmX_D_AqpOUoRAcA';
                        if (mapContainer.current) {
                            map.current = new mapboxgl.Map({
                                container: mapContainer.current,
                                style: 'mapbox://styles/mapbox/streets-v12',
                                center: [lon, lat],
                                zoom: 1
                            });

                            if (map.current) {
                                map.current.on('load', () => {
                                    if (map.current) {
                                        map.current.setFog({
                                            color: 'rgb(186, 210, 235)', // Lower atmosphere
                                            'high-color': 'rgb(36, 92, 223)', // Upper atmosphere
                                            'horizon-blend': 0.002, // Atmosphere thickness (default 0.2 at low zooms)
                                            'space-color': 'rgba(11,11,25,0)', // Background color

                                        });
                                    }


                                    setTimeout(() => {
                                        if (map.current) {
                                            map.current.flyTo({
                                                center: [lon, lat],
                                                zoom: 4, // Set the zoom level you want
                                                essential: true
                                            });
                                        }
                                    }, 2000); // 2000 milliseconds = 2 seconds

                                    // Define the coordinates of the points
                                    const coordinates = [
                                        [-0.580816, 44.836151], // [longitude, latitude]
                                        [-75.5, 39],
                                        [-76.5, 38],
                                        [-0.580816+0.3, 44.836151-0.3],
                                        [-77.5, 37],
                                        [-78.5, 36],
                                        [-79.5, 35],
                                        [-80.5, 34],
                                        [-81.5, 33],
                                        [-82.5, 32]
                                    ];

                                    // Filter out any undefined values from the coordinates array
                                    const validCoordinates = coordinates.filter(coordinate => coordinate !== undefined) as Coordinate[];

                                    // Create a GeoJSON feature collection
                                    const geojson: GeoJSON.FeatureCollection = {
                                        type: 'FeatureCollection',
                                        features: validCoordinates.map((coordinate, index) => ({
                                            type: 'Feature',
                                            geometry: {
                                                type: 'Point',
                                                coordinates: coordinate
                                            },
                                            properties: {
                                                id: index,
                                                radius: (index+1) * 10
                                            }
                                        }))
                                    };

                                    if (map.current) {
                                        // Add the points as a source
                                        map.current.addSource('points', {
                                            type: 'geojson',
                                            data: geojson
                                        });

                                        // Add a layer to display the points
                                        map.current.addLayer({
                                            id: 'points',
                                            type: 'circle',
                                            source: 'points',
                                            paint: {
                                                'circle-radius': [
                                                    'interpolate',
                                                    ['linear'],
                                                    ['zoom'],
                                                    2,1,
                                                    3, 2,
                                                    4, 5,
                                                    5, 10,
                                                    6, 15,
                                                    7, 20,
                                                    8, 30,
                                                    9, 40,
                                                    10, 60,
                                                    11, 100,
                                                    12, 200,
                                                    13, 300,
                                                    14, 400,
                                                    15, 500,
                                                    16, 700,
                                                ],
                                                'circle-color': '#007cbf'
                                            }
                                        });
                                    }
                                });
                            }
                        }
                    });
            });


        // Clean up on unmount
        return () => {
            if (map.current) {
                map.current.remove();
            }
        };
    }, []);

    const [city, setCity] = useState('');
    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);

    useEffect(() => {
        if (city) {
            Radar.autocomplete({
                query: city,
                limit: 10
            })
                .then((result) => {
                    const { addresses } = result;
                    const newCenter = [addresses[0].longitude, addresses[0].latitude] as Coordinate;
                    setLat(newCenter[1]);
                    setLng(newCenter[0]);
                    console.log(newCenter);
                })
                .catch((err) => {
                    // handle error
                });
        }
    }, [city]);

    const flyToLocation = () => {
        if (map.current) {
            map.current.flyTo({
                center: [lng, lat],
                essential: true,
                zoom: 8
            });
        }
    };

    return (
        <div>
            <div ref={mapContainer} style={{width: '400px', height: '400px'}}/>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="City"/>
            <button onClick={flyToLocation} style={{
                display: 'block',
                margin: '20px auto',
                padding: '10px',
                background: '#ee8a65',
                color: '#fff',
                border: 'none',
                borderRadius: '3px'
            }}>
                Fly
            </button>
            <h2>{t('Welcome to React')}</h2>
        </div>
    );
}

const renderApp = () => {
    const root = document.getElementById("example");
    if (root) {
        const rootContainer = ReactDOM.createRoot(root);
        rootContainer.render(
            <React.StrictMode>
                <App/>

            </React.StrictMode>
        );
    }
}

// Wait for the DOM to load before rendering the app
document.addEventListener('DOMContentLoaded', renderApp);
