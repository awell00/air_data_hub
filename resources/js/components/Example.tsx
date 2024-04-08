import React, { useState, useLayoutEffect, useRef, useEffect, useCallback } from 'react';
import ReactDOM from "react-dom/client";
import '../../css/app.css';
import Radar from 'radar-sdk-js';
import 'radar-sdk-js/dist/radar.css';
import mapboxgl from 'mapbox-gl';
import { LngLat } from 'mapbox-gl';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import styled from 'styled-components';

type Coordinate = [number, number];
type Zoom = number;

Radar.initialize('prj_live_pk_e0443df992afd7bebd2ae00bfbc34e850a743aea');

const App: React.FC = () => {

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [center, setCenter] = useState<Coordinate | undefined>();
    const { t } = useTranslation();
    const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
    const [styleChanged, setStyleChanged] = useState(false);
    const [styleChangedOnce, setStyleChangedOnce] = useState(false);
    const [zoomValue, setZoom] = useState<Zoom>(3);
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/standard');
    const titleRef = useRef<HTMLHeadingElement | null>(null); // Add this line
    const timeoutRef = useRef<number | null>(null);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth * 0.8;
            const height = window.innerHeight * 0.8;
            map.current?.resize();

            let divisor = 1100;
            if (window.innerWidth <= 600) {
                divisor = 400;
            } else if (window.innerWidth <= 1400) {
                divisor = 380;
            }

            setZoom(Math.min(width, height) / divisor);
            map.current?.setZoom(zoomValue);
        };


        window.addEventListener('resize', handleResize);

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
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: mapStyle,
                    center: [lon, lat],
                    zoom: 1.7
                });

                map.current.on('load', () => {
                    /*map.current?.on('zoom', () => {
                        if (map.current) {

                            if (map.current.getZoom() > zoomValue * 1.5) {
                                if (!styleChanged && map.current?.isStyleLoaded()) {
                                    setMapStyle('mapbox://styles/robinshood/clulbaf1200p601r2a317d1ju');
                                    setTimeout(() => {
                                        setStyleChanged(true);
                                    }, 1000);
                                }
                            }
                        }
                    });*/

                    if (map.current) {
                        map.current.setFog({
                            color: 'rgb(186, 210, 235)',
                            'high-color': 'rgb(36, 92, 223)',
                            'horizon-blend': 0.006,
                            'space-color': 'rgb(11,11,25)',
                            "star-intensity": 0.23
                        });

                    }

                    handleResize();

                    /*setTimeout(() => {
                        if (map.current) {
                            map.current.flyTo({
                                center: [lon, lat],
                                zoom: zoomValue * 1.5,
                                essential: true
                            });
                        }
                    }, 2000);*/

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

                    if (!map.current?.getSource('points')) {
                        map.current?.addSource('points', {
                            type: 'geojson',
                            data: geojson
                        });
                    }

                    if (!map.current?.getLayer('points')) {
                        map.current?.addLayer({
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
                                'circle-color': '#0b0b19'
                            }
                        });
                    }
                });
            } catch (error) {
                console.error('Error fetching IP info:', error);
            }
        }


        fetchData();

        return () => {
            window.removeEventListener('resize', handleResize);

            map.current?.remove();
        };
    }, [styleChanged, styleChangedOnce, zoomValue]);

    const textElements = document.getElementsByClassName('my-text');
    const textElement = document.getElementsByClassName('my-text2')[0] as HTMLElement;

// The radius of the globe in degrees
    const zoomTest = 0.001678693092394923;

    map.current?.on('move', () => {
        const latitude = map.current?.getCenter().lat;
        const zoom = map.current?.getZoom();
        if (latitude && zoom) {
            const scale = 256 * 0.5 / Math.PI * Math.pow(2, zoom);
            const metersPerPixel = Math.cos(latitude * Math.PI / 180) / scale;
            if (metersPerPixel) {
                if (metersPerPixel > zoomTest) {
                    for (let i = 0; i < textElements.length; i++) {
                        const element = textElements[i];
                        const element2 = textElement;
                        if (element instanceof HTMLElement) { // Check if the element is an HTMLElement (and not SVGElement for example)
                            element.style.color = 'white'; // Or any other style changes you want to make
                            element2.style.background = "white";
                            element2.style.color = "#0B0B19FF";

                            let style = document.createElement('style');
                            style.innerHTML = `
                            .my-text2::placeholder {
                                color: #575757FF;
                            }`;
                            document.head.appendChild(style);
                        }
                    }
                } else {
                    for (let i = 0; i < textElements.length; i++) {
                        const element = textElements[i];
                        const element2 = textElement;
                        if (element instanceof HTMLElement) {
                            element.style.color = "#0B0B19FF";
                            element2.style.background = "#0B0B19FF";
                            element2.style.color = "white";
                            let style = document.createElement('style');
                            style.innerHTML = `
                            .my-text2::placeholder {
                                color: #EEEEEEFF;
                            }`;
                            document.head.appendChild(style);
                        }
                    }
                }
            }
        }


    });




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

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Set a new timeout
            timeoutRef.current = setTimeout(() => {
                flyToLocation(8);
            }, 4000);
        }
    }, [city]);

    const flyToLocation = (zoomFly: number) => {
        map.current?.flyTo({
            center: [lng, lat],
            essential: true,
            zoom: zoomFly
        });
    };

    useEffect(() => {
        if (city === '') {
            setLat(lat); // replace with the latitude of the initial location
            setLng(lng); // replace with the longitude of the initial location
            timeoutRef.current = window.setTimeout(() => {
                flyToLocation(1.7);
            }, 500);
        } else if (lat && lng) {
            timeoutRef.current = window.setTimeout(() => {
                flyToLocation(8);
            }, 4000);
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [lat, lng]);

    const handleTest = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            // Clear the timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            setTimeout(() => {
                flyToLocation(8);
            }, 2500);

        }
    };

    const handleStyleChange = () => {
        if (mapStyle === 'mapbox://styles/mapbox/streets-v11') {
            setMapStyle('mapbox://styles/mapbox/standard');
        } else {
            setMapStyle('mapbox://styles/mapbox/light-v11');
        }
    };

// Step 3: Update the map style when the state variable changes
    useEffect(() => {
        if (map.current) {
            map.current.setStyle(mapStyle);
        }
    }, [mapStyle]);

    const handleKeyPress = (e: React.KeyboardEvent<Element>) => {
        if (e.key === "Enter") {
            handleTest(e);
        }
    };

    return (
        <Container>
            <AllTitle>
                <Title className="my-text" ref={titleRef}>AIR DATA HUB</Title>
                <Title2 className="my-text">FROM DATA-X</Title2>
                <InputCity type="text" className="my-text2" value={city} onChange={e => setCity(e.target.value)}
                           onKeyPress={handleKeyPress} placeholder="Search a City"/>
                {/*<button onClick={handleStyleChange}>Change Map Style</button>*/}
            </AllTitle>

            <Map ref={mapContainer}/>
            {/*<TestButton onClick={flyToLocation}>
                Fly
            </TestButton>*/}
            {/*<Translate>{t('Welcome to React')}</Translate>*/}
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

const AllTitle = styled.div`
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 1;
`

const Title = styled.h1`
    font-size: 4vw;
    font-family: "Montserrat", sans-serif;
    font-weight: 800;
   /* letter-spacing: .5vw;*/
    color: #EEEEEEFF;
    padding-left: 30px;
    padding-top: 30px;
`

const Title2 = styled.h2`
    font-size: 1.5vw;
    font-family: "Montserrat", sans-serif;
    font-weight: 500;
    /* letter-spacing: .5vw;*/
    color: #EEEEEEFF;
    padding-left: 30px;

`

const TestButton = styled.button`
    display: 'block';
    margin: '20px auto';
    padding: '10px';
    background: '#ee8a65';
    color: '#EEEEEEFF';
    border: 'none';
    borderRadius: '3px';

`

const InputCity = styled.input`
    display: block;
    padding-left: 30px;
    margin: 30px;
    margin-right: 10%;
    padding: 10px;
    background: rgb(255, 255, 255);
    color: #0b0b19;
    border: none;
    border-radius: 10px;
    font-weight: 500;
    font-size: 16px;
    font-family: "Montserrat", sans-serif;

    @media (min-width: 768px) {
        font-size: 16px;
        margin-right: 5%;
    }
`;

const Translate = styled.h2`
    font-family: "ArchivoBlack-Regular", sans-serif;
`

const Container = styled.div`
    position: relative;
    background: rgba(11, 11, 25);
    height: 100vh;
`

const Map = styled.div`
    position: relative;
    width: 100%;
    height: 100%;

`
