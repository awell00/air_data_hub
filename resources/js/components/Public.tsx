// React related imports
import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import { useTranslation } from 'react-i18next';

// Internationalization
import { useLanguage } from '../utils/Auth';

// Libraries for styling
import styled from 'styled-components';

// Libraries for data validation
import { z } from 'zod';

// Libraries for utility functions
import { debounce } from 'lodash';

// Libraries for mapping
import Radar from 'radar-sdk-js';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';

// Libraries for routing
import { BrowserRouter as Router } from 'react-router-dom';

// Relative imports
import '../../css/app.css';

// Types and interfaces
type GasType = 'NH3' | 'CO2b' | 'PFC' | 'CO2nb' | 'CH4' | 'HFC' | 'N2O' | 'SF6';
type Coordinate = [number, number];
type Zoom = number;

const GasDataSchema = z.array(z.object({
    formulaGas: z.string(),
    latSensor: z.number(),
    longSensor: z.number(),
    ppmValue: z.number(),
    max_ppmValue: z.number(),
}));

const GasTypeSchema = z.array(z.object({
    formulaGas: z.string(),
}));

// Initialization API
Radar.initialize(import.meta.env.VITE_RADAR);
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX;

const App: React.FC = () => {
    // Constants
    const zoomMin = 0.001678693092394923;
    const geocoderDiv = document.getElementById('search');
    const gasSelector = document.querySelector('.gas-selector');

    const gasTypeMap: { [key: string]: string } = {
        "CO2nb": "CO2 non bio",
        "CO2b": "CO2 bio"
    };

    const gasColorMap: { [key: string]: string[] }  = {
        'NH3': ['rgba(235,255,235,0)', 'rgb(204,255,204)', 'rgb(153,255,153)', 'rgb(102,255,102)', 'rgb(51,255,51)', 'rgb(0,255,0)'],
        'CO2 non bio': ['rgba(255,235,235,0)', 'rgb(255,204,204)', 'rgb(255,153,153)', 'rgb(255,102,102)', 'rgb(255,51,51)', 'rgb(255,0,0)'],
        'PFC': ['rgba(236,222,239,0)', 'rgb(208,209,230)', 'rgb(166,189,219)',  'rgb(103,169,207)', 'rgb(28,144,153)', 'rgb(1,105,114)'],
        'CO2 bio': ['rgba(235,235,255,0)', 'rgb(204,204,255)', 'rgb(153,153,255)', 'rgb(102,102,255)', 'rgb(51,51,255)', 'rgb(0,0,255)'],
        'CH4': ['rgba(255,255,235,0)', 'rgb(255,255,204)', 'rgb(255,255,153)', 'rgb(255,255,102)', 'rgb(255,255,51)', 'rgb(255,255,0)'],
        'HFC': ['rgba(255,235,255,0)', 'rgb(255,204,255)', 'rgb(255,153,255)', 'rgb(255,102,255)', 'rgb(255,51,255)', 'rgb(255,0,255)'],
        'N2O': ['rgba(235,235,235,0)', 'rgb(204,204,204)', 'rgb(153,153,153)', 'rgb(102,102,102)', 'rgb(51,51,51)', 'rgb(0,0,0)']
    };

    // Refs
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const titleRef = useRef<HTMLHeadingElement | null>(null);
    const geocoderAddedRef = useRef(false);
    const selectRef = useRef<HTMLSelectElement | null>(null);

    // Translation
    const { t } = useTranslation();

    // Map related states
    const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/standard');
    const [currentZoom, setCurrentZoom] = useState<Zoom>(0.8);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [center, setCenter] = useState<Coordinate | undefined>();

    // Style related states
    const [styleChanged, setStyleChanged] = useState(false);
    const [styleChangedOnce, setStyleChangedOnce] = useState(false);
    const [zoomValue, setZoom] = useState<Zoom>(3);

    // Data related states
    const [coordinatesValue, setCoordinates] = useState<number[][]>([]);
    const [ppmValue, setPpm] = useState<number[]>([]);
    const [selectedGas, setSelectedGas] = useState<GasType | ''>('');
    const [gasColors, setGasColors] = useState<string[]>();
    const [gasTypes, setGasTypes] = useState<string[]>([]);
    const [redirection, setRedirection] = useState("/login")

    // Title related states
    const [title, setTitle] = useState("AIR DATA HUB");
    const colorClassTitle = mapLoaded ? 'title' : 'white-color';

    // Elements
    const titleElement = document.getElementsByClassName('title');
    const buttonElement = document.getElementsByClassName('button');

    // Import Functions
    useLanguage();

    useEffect(() => {
        // Add the no-scroll class when the component mounts
        document.body.classList.add('no-scroll');

        // Remove the no-scroll class when the component unmounts
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, []);

    // This useEffect hook is used to handle window resize events.
    // It updates the title of the application based on the window width.
    // It runs once when the component is mounted and cleans up the event listener when the component is unmounted.
    useEffect(() => {
        // Define a debounced function that sets the title based on the window width
        const handleResize = debounce(() => {
            setTitle(window.innerWidth <= 450 ? "ADH" : "AIR DATA HUB");
        }, 250);

        // Add the resize event listener
        window.addEventListener('resize', handleResize);
        // Call the handleResize function immediately to set the initial title
        handleResize();

        // Return a cleanup function that will be called when the component is unmounted
        return () => {
            // Cancel any pending execution of handleResize
            handleResize.cancel();
            // Remove the resize event listener
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // This useEffect hook is used to fetch gas data from the '/api/gaz' endpoint.
    // It runs whenever the selectedGas state changes.
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/gaz', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                    },
                });

                const data = await response.json();
                // Validate the data using the GasDataSchema
                const validData = GasDataSchema.parse(data);

                // Filter the data to only include items where the formulaGas matches the selectedGas
                const filteredData = validData.filter(item => item.formulaGas === selectedGas);
                // Map the filtered data to an array of coordinates
                const coords = filteredData.map(item => [item.longSensor, item.latSensor]);
                // Map the filtered data to an array of ppm values normalized by the max_ppmValue
                const ppm = filteredData.map(item => item.ppmValue/item.max_ppmValue);

                setPpm(ppm);
                setCoordinates(coords);
            } catch (error) {
                console.error('Error fetching data from /gaz:', error);
            }
        };

        fetchData().catch(error => console.error('Error in fetchData:', error));
    }, [selectedGas, setPpm, setCoordinates, GasDataSchema]);

    // This useEffect hook is used to fetch gas types from the '/api/gasTypes' endpoint.
    // It runs once when the component is mounted.
    useEffect(() => {
        const fetchGasTypes = async () => {
            try {
                const response = await fetch('/api/gasTypes', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                    },
                });

                if (!response.ok) {
                    console.error('Network response was not ok');
                    return;
                }

                const data = await response.json();
                // Validate the data using the GasTypeSchema
                const validatedData = GasTypeSchema.parse(data);
                // Map the validated data to an array of gas types
                const gasTypes = validatedData.map((item: {formulaGas: string}) => item.formulaGas);

                setGasTypes(gasTypes);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    console.error('Validation error:', error.errors);
                } else {
                    console.error('Error fetching gas types:', error);
                }
            }
        };

        fetchGasTypes().catch(error => console.error('Error in fetchGasTypes:', error));
    }, []);

    // This function is used to handle changes in the gas type selection.
    // It updates the selectedGas and gasColors states based on the selected value.
    const handleGasChange = (value: string) => {
        // Map the value to a gas type if it exists in the gasTypeMap
        value = gasTypeMap[value] || value;

        // If the value is included in the gasTypes, update the selectedGas and gasColors states
        if (gasTypes.includes(value)) {
            setSelectedGas(value as GasType);
            setGasColors(gasColorMap[value] || ['rgba(236,222,239,0)', 'rgb(208,209,230)', 'rgb(166,189,219)',  'rgb(103,169,207)', 'rgb(28,144,153)', 'rgb(1,105,114)']);
        } else {
            console.error(`Invalid gas type: ${value}`);
        }
    };



    useEffect(() => {
        const access_token = localStorage.getItem('access_token');

        if(access_token == null) {
            setRedirection("/login")
        } else {
            setRedirection("/info")
        }
    }, []);

    useEffect(() => {
        const handleResize = debounce(() => {
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
            if (currentZoom == 1.2) {
                map.current?.setZoom(zoomValue);
            }
        }, 250);

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

                setupMap(lat, lon);
            } catch (error) {
                console.error('Error fetching IP info:', error);
            }
        }

        const setupMap = (lat: number, lon: number) => {
            if (mapContainer.current) {
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: mapStyle,
                    center: center ? center : [lon, lat],
                    zoom: currentZoom
                });
            }

            setupGeocoder();
            setupMapEvents();
        }

        const setupGeocoder = () => {
            const geocoder = new MapboxGeocoder({
                accessToken: mapboxgl.accessToken,
                flyTo: {
                    bearing: 0,
                    speed: 2,
                    curve: 1,
                    easing: function (t) {
                        return t;
                    }
                },
                mapboxgl: mapboxgl,
                marker: false,
                placeholder: t('Search for a city...'),
            });

            geocoder.on('clear', function() {
                map.current?.flyTo({
                    center: [2, 46],
                    zoom: 0.8,
                    speed: 2
                });
            });

            geocoder.on('result', function(e) {
                map.current?.flyTo({
                    center: e.result.geometry.coordinates,
                    zoom: 8
                });
            });

            if (geocoderDiv && gasSelector && !geocoderAddedRef.current) {
                geocoderDiv.insertBefore(geocoder.onAdd(map.current!), gasSelector);
                geocoderAddedRef.current = true;

                if (geocoderDiv.firstChild) {

                    const style = document.createElement('style');
                    style.innerHTML = `
                      .mapboxgl-ctrl-geocoder--input::placeholder {
                        font-family: 'FoundersGrotesk-Medium';
                        color: #a7a9be;
                      }
                      .mapboxgl-ctrl-geocoder--input {
                        font-family: 'FoundersGrotesk-Medium';

                      }
                    `;
                    document.head.appendChild(style);

                    const thirdChild = geocoderDiv.children[0] as HTMLElement;

                    thirdChild.style.color = '#0f0e17';
                    thirdChild.style.borderRadius = '20px 10px 10px 20px';
                    thirdChild.style.fontFamily = 'FoundersGrotesk-Bold';

                    thirdChild.style.fontFamily = 'Aileron-SemiBold';
                    thirdChild.style.display = 'flex';
                    thirdChild.style.alignItems = 'center';
                    thirdChild.style.justifyContent = 'center';
                    thirdChild.style.fontSize = '1rem';
                    thirdChild.style.backgroundColor = '#fffffe';

                    const svgElement = thirdChild.querySelector('svg');
                    if (svgElement) {
                        svgElement.style.margin = '1px 0 0 4px';
                        svgElement.style.fill = '#a7a9be';
                    }

                    const adjustBorderRadius = () => {
                        const mediaQuery = window.matchMedia('(max-width: 450px)');
                        if (mediaQuery.matches) {
                            thirdChild.style.borderRadius = '20px';
                        } else {
                            thirdChild.style.borderRadius = '20px 10px 10px 20px';
                        }
                    };

                    // Adjust the border radius immediately
                    adjustBorderRadius();

                    // Adjust the border radius when the window is resized
                    window.addEventListener('resize', adjustBorderRadius);

                    thirdChild.style.transition = 'background-color 1s ease';
                }
            }
        }

        const setupMapEvents = () => {
            map.current!.on('move', () => {
                const zoom = map.current?.getZoom();
                const centerV = map.current?.getCenter();
                if (zoom && centerV) {
                    setCurrentZoom(zoom);
                    setCenter([centerV.lng, centerV.lat]);
                }
            });

            map.current!.on('load', () => {
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
                                radius: 5,
                                ppm: ppmValue[index]
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
                                (map.current?.getSource('points') as mapboxgl.GeoJSONSource).setData(geojson);
                            } else {
                                // If the source 'points' does not exist, create it
                                map.current.addSource('points', {
                                    type: 'geojson',
                                    data: geojson
                                });

                                if (gasColors) {
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
                                                    gasColors[0],
                                                    0.2,
                                                    gasColors[1],
                                                    0.4,
                                                    gasColors[2],
                                                    0.6,
                                                    gasColors[3],
                                                    0.8,
                                                    gasColors[4],
                                                    1,
                                                    gasColors[5]

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
                }

                setTimeout(() => {
                    setMapLoaded(true);
                }, 500);
            });
        }

        fetchData().catch(error => console.error('Error in fetchData:', error));

        return () => {
            window.removeEventListener('resize', handleResize);

            map.current?.remove();
        };
    }, [styleChanged, styleChangedOnce, zoomValue, coordinatesValue, ppmValue]);

    /*const calculateScale = (zoom: number) => {
        return 256 * 0.5 / Math.PI * Math.pow(2, zoom);
    }

    const calculateMetersPerPixel = (latitude: number, scale: number) => {
        return Math.cos(latitude * Math.PI / 180) / scale;
    }

    const updateElementStyles = (isVisible: boolean) => {
        if (titleElement instanceof HTMLElement && buttonElement instanceof HTMLElement) {
            titleElement.style.color = isVisible ? '#eee' : "#0B0B19FF";
            buttonElement.style.visibility = isVisible ? "visible" : "hidden";
            buttonElement.style.opacity = isVisible ? "1" : "0";
        }
    }

    map.current?.on('move', () => {
        const latitude = map.current?.getCenter().lat;
        const zoom = map.current?.getZoom();

        if (latitude && zoom) {
            const scale = calculateScale(zoom);
            const metersPerPixel = calculateMetersPerPixel(latitude, scale);
            if (metersPerPixel) {
                const isVisible = metersPerPixel > zoomMin;
                updateElementStyles(isVisible);
            }
        }
    });*/

    return (
        <Container>
            <Nav id="all-title-div">
                <Title className={`title ${colorClassTitle}`} ref={titleRef}>
                    {title}
                </Title>

                <Search id="search">
                    <GasSelector
                        ref={selectRef}
                        onChange={e => handleGasChange(e.target.value)}
                        className="gas-selector"
                    >
                        <option value="" disabled selected>
                            {t('Gases')}
                        </option>

                        {gasTypes.map(gasType => {
                            let displayValue = gasType;

                            if (gasType === "CO2 non bio") {
                                displayValue = "CO2nb";
                            } else if (gasType === "CO2 bio") {
                                displayValue = "CO2b";
                            }

                            return (
                                <option key={gasType} value={displayValue}>
                                    {displayValue}
                                </option>
                            )
                        })}
                    </GasSelector>
                </Search>

                <a href={redirection} className="button-div">
                    <LoginButton className="button">
                        {t('Log in')}
                    </LoginButton>
                </a>
            </Nav>
            <Map
                ref={mapContainer}
                className={mapLoaded ? 'map-visible' : 'map-hidden'}
            />
        </Container>
);
}

const renderApp = () => {
    const root = document.getElementById("public");
    if (root) {
        const rootContainer = ReactDOM.createRoot(root);
        rootContainer.render(
            <React.StrictMode>
                <Router>
                    <App/>
                </Router>
            </React.StrictMode>
        );
    }
}

document.addEventListener('DOMContentLoaded', renderApp);

// Layout Components
const Container = styled.div`
    position: relative;
    background: #0f0e17;
    height: 100vh;
    overflow: hidden;
`

const Map = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
`

const Nav = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    position: absolute;
    z-index: 1;
    padding: 20px 30px;
`

const Search = styled.div`
    display: flex;
    justify-content: space-between;
    gap: 10px;

    @media (max-width: 768px) {
        justify-content: center;
        position: fixed;
        pointer-events: none;
        padding: 30px;
        bottom: 20px;
        left: 0;
        width: 100%;
    }

    @media (max-width: 450px) {
        height: 85%;
        gap: 60vh;
        pointer-events: none;
        justify-content: center;
        flex-direction: column;
        align-items: center;
    }
`

// Input Components
const GasSelector = styled.select`
    display: block;
    padding: 10px 20px;
    width: 87px;
    border: none;
    font-size: 1rem;
    border-radius: 10px 20px 20px 10px;
    font-family: 'FoundersGrotesk-Medium', sans-serif;
    color: #0f0e17;
    background-color: #fffffe;
    box-shadow: 0 0 7px rgba(11, 11, 25, 0.15);
    -webkit-appearance: none;
    -moz-appearance: none;

    @media (max-width: 768px) {
        margin-left: 10px;
        pointer-events: all;
    }

    @media (max-width: 450px) {
        pointer-events: all;
        border-radius: 20px;
        margin-left: 0;
    }
`

const LoginButton = styled.button`
    padding: 10px 20px;
    background-color: #fffffe;
    color: #0f0e17;
    vertical-align: baseline;
    border: none;
    font-family: 'FoundersGrotesk-Medium', sans-serif;
    border-radius: 20px;
    font-size: 1rem;
    cursor: pointer;
    box-shadow: 0 0 7px rgba(11, 11, 25, 0.15);
    text-decoration: none;

    transition: background 0.3s, color 0.3s;

    &:hover {
        cursor: pointer;
        background: #dcdcdc;
        color: #0f0e17;
    }
`

// Typography Components
const Title = styled.h1`
    font-size: 1.4rem;
    font-family: "FoundersGrotesk-Bold", sans-serif;
    color: #fffffe;
    white-space: nowrap;
    text-shadow: 0 0 7px rgba(11, 11, 25, 0.15);
`

const Translate = styled.h2`
    font-family: "ArchivoBlack-Regular", sans-serif;
`

//TODO: Change Color
//TODO: Clean Code
//TODO: Comment Code
//TODO: Add Tests
//TODO: Add Images Sources
//FIX: The geocoder not display
