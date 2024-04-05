import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import '../../css/app.css';
import Radar from 'radar-sdk-js';
import 'radar-sdk-js/dist/radar.css';
import mapboxgl from 'mapbox-gl';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import styled from 'styled-components';

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
        const fetchData = async () => {
            if (!mapContainer.current) return;

            try {
                const response = await fetch('https://api.ipify.org?format=json');
                const data = await response.json();
                const ip = data.ip;

                let lat: number, lon: number;
                try {
                    const geoResponse = await fetch(`https://ipapi.co/${ip}/json`);
                    const geoData = await geoResponse.json();
                    lat = parseFloat(geoData.latitude);
                    lon = parseFloat(geoData.longitude);
                } catch (error) {
                    console.error('Error fetching geolocation info:', error);
                    lat = 46.2276;
                    lon = 2.2137;
                }

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
                                    color: 'rgb(186, 210, 235)',
                                    'high-color': 'rgb(36, 92, 223)',
                                    'horizon-blend': 0.002,
                                    'space-color': 'rgb(255,255,255)',
                                });
                            }

                            setTimeout(() => {
                                if (map.current) {
                                    map.current.flyTo({
                                        center: [lon, lat],
                                        zoom: 4,
                                        essential: true
                                    });
                                }
                            }, 2000);

                            const coordinates = [
                                [-0.580816, 44.836151],
                                [-75.5, 39],
                                [-76.5, 38],
                                [-0.580816 + 0.3, 44.836151 - 0.3],
                                [-77.5, 37],
                                [-78.5, 36],
                                [-79.5, 35],
                                [-80.5, 34],
                                [-81.5, 33],
                                [-82.5, 32]
                            ];

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
                                        radius: (index + 1) * 10
                                    }
                                }))
                            };

                            if (map.current) {

                                if (!map.current.getSource('points')) {
                                    map.current.addSource('points', {
                                        type: 'geojson',
                                        data: geojson
                                    });
                                }

                                if (!map.current.getLayer('points')) {
                                    map.current.addLayer({
                                        id: 'points',
                                        type: 'circle',
                                        source: 'points',
                                        paint: {
                                            'circle-radius': [
                                                'interpolate',
                                                ['linear'],
                                                ['zoom'],
                                                2, 1,
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
                            }
                        });
                    }
                }
            } catch (error) {
                console.error('Error fetching IP info:', error);
            }
        }

        fetchData();

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
        <Container>
            <Map ref={mapContainer} style={{width: '400px', height: '400px'}}/>
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
            <Translate>{t('Welcome to React')}</Translate>
        </Container>
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

const Translate = styled.h2`
    font-family: "Roboto", sans-serif;
    font-weight: 400;
    font-style: normal;
`

const Container = styled.div`
    position: relative;
    height: 100vh;
`

const Map = styled.div`
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    border-radius: 20px;
`
