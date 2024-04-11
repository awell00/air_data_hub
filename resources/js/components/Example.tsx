import React, { useState, useLayoutEffect, useRef, useEffect, useCallback } from 'react';
import ReactDOM from "react-dom/client";
import '../../css/app.css';
import Radar from 'radar-sdk-js';
import 'radar-sdk-js/dist/radar.css';
import mapboxgl from 'mapbox-gl';
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
    const [coordinatesValue, setCoordinates] = useState([]);
    const [ppmValue, setPpm] = useState<number[]>([])
    const [city, setCity] = useState('');
    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);
    const [prevMapStyle, setPrevMapStyle] = useState('')
    const [selectedGas, setSelectedGas] = useState('NH3');
    const [currentZoom, setCurrentZoom] = useState<Zoom>(1.7);
    const [mapLoaded, setMapLoaded] = useState(false);

    useEffect(() => {
        const browserLang = navigator.language.split('-')[0];
        i18n.changeLanguage(browserLang);
    }, []);

    useEffect(() => {
        fetch( 'http://localhost:8000/api/gaz')
            .then(response => response.json())
            .then(data => {
                // Filter the data based on the selected gas
                const filteredData = data.filter((item: {name: string}) => item.name === selectedGas);

                // Map the filtered data to the format that your application expects
                const coords = filteredData.map((item: {lat: number, lon: number})  => {
                    // Add a small random offset to the coordinates
                    const latOffset = (Math.random() - 0.5) * 0.1;
                    const lonOffset = (Math.random() - 0.5) * 0.1;
                    return [item.lon + lonOffset, item.lat + latOffset];
                });

                const ppm = filteredData.map((item: {ppm: number}) => item.ppm)

                setPpm(ppm);
                setCoordinates(coords);
            })
            .catch(error => console.error('Error fetching data from /gaz:', error));
    }, [selectedGas]);


    useEffect(() => {
        setMapLoaded(false);
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
            if (currentZoom == 1.7) {
                map.current?.setZoom(zoomValue);
            }

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
                    zoom: currentZoom
                });

                map.current?.on('move', () => {
                    const zoom = map.current?.getZoom();
                    if (zoom) {
                        setCurrentZoom(zoom);
                    }
                });

                map.current.on('load', () => {
                    setMapLoaded(false);
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

                    const validCoordinates = coordinatesValue.filter(coordinate => coordinate !== undefined) as Coordinate[];

                    if (ppmValue !== null) {
                        // Create a GeoJSON feature collection
                        const geojson: GeoJSON.FeatureCollection = {
                            type: 'FeatureCollection',
                            features: validCoordinates.map((coordinate, index) => ({
                                type: 'Feature',
                                geometry: {
                                    type: 'Point',
                                    coordinates: [coordinate[0], coordinate[1]],

                                },
                                properties: {
                                    id: index,
                                    radius: 15,
                                    ppm: ppmValue[index],
                                }
                            }))
                        };

                        if (map.current) {
                            const layers = map.current.getStyle().layers;
                            let firstSymbolId;
                            for (const layer of layers) {
                                if (layer.type === 'symbol') {
                                    firstSymbolId = layer.id;
                                    break;
                                }
                            }

                            if (map.current) {
                                setMapLoaded(false);
                                if (map.current.getSource('points')) {
                                    console.log("test"),
                                    (map.current?.getSource('points') as mapboxgl.GeoJSONSource).setData(geojson);
                                } else {
                                    // If the source 'points' does not exist, create it
                                    map.current.addSource('points', {
                                        type: 'geojson',
                                        data: geojson
                                    });

                                    map.current.addLayer({
                                            id: 'heatmap',
                                            type: 'heatmap',
                                            source: 'points',
                                            'layout': {},
                                            paint: {
                                                'heatmap-weight': ['interpolate', ['linear'], ['get', 'ppm'], 0, 0, 1, 1],
                                                'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],

                                                'heatmap-color': [
                                                    'interpolate',
                                                    ['linear'],
                                                    ['heatmap-density'],
                                                    0,
                                                    'rgba(236,222,239,0)',
                                                    0.2,
                                                    'rgb(208,209,230)',
                                                    0.4,
                                                    'rgb(166,189,219)',
                                                    0.6,
                                                    'rgb(103,169,207)',
                                                    0.8,
                                                    'rgb(28,144,153)',
                                                    1,
                                                    'rgb(1,105,114)'

                                                ],
                                                'heatmap-radius': [
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
                                                'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 7, 1, 20, 0]
                                            }
                                        },
                                        firstSymbolId
                                    );
                                }
                            }


                        }
                    }

                    setTimeout(() => {
                        setMapLoaded(true);
                    }, 500);
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
    }, [styleChanged, styleChangedOnce, zoomValue, coordinatesValue, ppmValue]);

    const textElements = document.getElementsByClassName('my-text');
    const textElement = document.getElementsByClassName('my-text2');
    const textElement3 = document.getElementsByClassName('my-text3')[0] as HTMLElement;

    console.log(textElement);
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
                        const element2 = textElement[i];
                        const element3 = textElement3;

                        if (element instanceof HTMLElement && element2 instanceof HTMLElement) {
                            element.style.color = 'white';
                            element2.style.background = "white";
                            element2.style.color = "#0B0B19FF";
                            element3.style.display = "display";
                            element3.style.opacity = "1";
                            element3.style.visibility = "visible";

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
                        const element2 = textElement[i];
                        const element3 = textElement3;

                        if (element instanceof HTMLElement && element2 instanceof HTMLElement) {
                            element.style.color = "#0B0B19FF";
                            element2.style.background = "#0B0B19FF";
                            element2.style.color = "white";
                            element3.style.visibility = "hidden";
                            element3.style.opacity = "0";
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

    useEffect(() => {
        if (city) {
            Radar.autocomplete({
                query: city,
                limit: 10
            })
                .then((result) => {
                    const { addresses } = result;
                    const newCenter = [addresses[0].longitude, addresses[0].latitude] as [longitude: number, latitude: number];
                    setLat(newCenter[1]);
                    setLng(newCenter[0]);
                    console.log(newCenter);
                })
                .catch((err) => {

                });

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = window.setTimeout(() => {
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
            setLat(lat);
            setLng(lng);
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
            setPrevMapStyle(mapStyle);
            setMapStyle('mapbox://styles/mapbox/standard');
        } else if (mapStyle === 'mapbox://styles/mapbox/standard') {
            setPrevMapStyle(mapStyle);
            setMapStyle('mapbox://styles/mapbox/light-v11');
        } else {
            const temp = mapStyle;
            setMapStyle(prevMapStyle);
            setPrevMapStyle(temp);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<Element>) => {
        if (e.key === "Enter") {
            handleTest(e);
        }
    };

    useEffect(() => {
        if (map.current) {
            map.current.setStyle(mapStyle);
        }
    }, [mapStyle]);

    const colorClass = mapLoaded ? 'my-text' : 'white-color';

    return (
        <Container>
            <AllTitle>
                <Title className={`my-text ${colorClass}`} ref={titleRef}>AIR DATA HUB</Title>
                <Title2 className={`my-text ${colorClass}`}>{t('FROM DATA-X')}</Title2>
                <InputCity type="text" className={`my-text2 ${mapLoaded ? 'my-text2' : 'whit-color'}`} value={city} onChange={e => setCity(e.target.value)}
                           onKeyPress={handleKeyPress} placeholder={t('Search a City...')}/>
                <GasSelector onChange={e => setSelectedGas(e.target.value)} className={`my-text2 ${mapLoaded ? 'my-text2' : 'whit-color'}`}>
                    <option value="NH3">NH3</option>
                    <option value="CO2">CO2</option>
                    <option value="H2O">H2O</option>
                </GasSelector>
            </AllTitle>
            <RightButton className="my-text3" onClick={handleStyleChange}>{t('Log in')}</RightButton>
            <Map ref={mapContainer} className={mapLoaded ? 'map-visible' : 'map-hidden'}/>
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

document.addEventListener('DOMContentLoaded', renderApp);

const AllTitle = styled.div`
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 1;
`

const GasSelector = styled.select`
    display: block;
    margin-left: 30px;
    padding: 10px 15px 10px 15px;
    width: 80px;
    border: none;
    border-radius: 10px;
    font-weight: 500;
    font-size: 14px;
    font-family: 'Aileron-SemiBold', sans-serif;
    color: #0b0b19;
    background-color: #eeee;
`


const RightButton = styled.button`
    position: absolute;
    right: 30px;
    top: 34px;
    padding: 12px 15px 12px 15px;
    background: #eeeeee;
    color: #0b0b19;
    border: none;
    font-family: 'Aileron-SemiBold', sans-serif;
    border-radius: 10px;
    font-size: 16px;
    cursor: pointer;
    z-index: 1;

    transition: background 0.3s, color 0.3s;

    &:hover {
        background: #c6c6c6;
        color: #0b0b19;
    }

    @media (max-width: 450px) {
        font-size: 14px;
        padding: 10px 12px 10px 12px;
    }
`;

const Title = styled.h1`
    font-size: 4vw;
    font-family: "Montserrat", sans-serif;
    font-weight: 800;
    color: #eeeeee;
    padding-left: 30px;
    padding-top: 30px;
    white-space: nowrap;

    @media (max-width: 450px) {
        font-size: 7vw;
    }
`

const Title2 = styled.h2`
    font-size: 1.5vw;
    font-family: "Montserrat", sans-serif;
    font-weight: 500;
    color: #eeeeee;
    padding-left: 30px;

    @media (max-width: 450px) {
        font-size: 3vw;
    }
`

const InputCity = styled.input`
    display: block;
    padding: 15px; // Increase padding-left to make space for the SVG
    margin: 30px;
    width: 31vw;
    /*    margin-right: 8%;*//**/

    color: #0b0b19;
    background-color: #eeeeee;
    border: none;
    border-radius: 10px;
    font-weight: 500;
    font-size: 14px;
    font-family: 'Aileron-SemiBold', sans-serif;

    @media (max-width: 450px) {
        font-size: 12px;
        width: 54vw;
        padding: 13px;
    }

`

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

//TODO: Clean Code
//TODO: Remove if not needed
//TODO: Comment Code
//TODO: Add Types
//TODO: Add Tests
//TODO: Connect DB correctly
//TODO: Avoid errors
//TODO: Add Images Sources
