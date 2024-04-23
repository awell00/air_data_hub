import React, { useState, useLayoutEffect, useRef, useEffect, useCallback } from 'react';
import ReactDOM from "react-dom/client";
import '../../css/app.css';
import Radar from 'radar-sdk-js';
import 'radar-sdk-js/dist/radar.css';
import mapboxgl from 'mapbox-gl';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import styled from 'styled-components';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import { BrowserRouter as Router } from 'react-router-dom';

type GasType = 'NH3' | 'CO2b' | 'PFC' | 'CO2nb' | 'CH4' | 'HFC' | 'N2O' | 'NH3' | 'PFC' | 'SF6';
type Coordinate = [number, number];
type Zoom = number;

interface Expression {
    [index: number]: string | number | Expression;
}

Radar.initialize(import.meta.env.VITE_RADAR);

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
    const titleRef = useRef<HTMLHeadingElement | null>(null);
    const timeoutRef = useRef<number | null>(null);
    const [coordinatesValue, setCoordinates] = useState([]);
    const [ppmValue, setPpm] = useState<number[]>([])
    const [city, setCity] = useState('');
    const [lat, setLat] = useState(0);
    const [lng, setLng] = useState(0);
    const [prevMapStyle, setPrevMapStyle] = useState('')
    const [selectedGas, setSelectedGas] = useState<GasType | ''>('');
    const [currentZoom, setCurrentZoom] = useState<Zoom>(0.8);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [gasColors, setGasColors] = useState<string[]>();
    const textElementTitle1 = document.getElementsByClassName('title1');
    const textElementTitle2 = document.getElementsByClassName('title2');
    const textElement3 = document.getElementsByClassName('button');
    const geocoderAddedRef = useRef(false);
    const selectRef = useRef<HTMLSelectElement | null>(null);
    const [title, setTitle] = useState("AIR DATA HUB");


    useEffect(() => {
        const browserLang = navigator.language.split('-')[0];
        i18n.changeLanguage(browserLang);
    }, []);

    useEffect(() => {

        fetch( '/api/gaz', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                const filteredData = data.filter((item: {formulaGas: string}) => item.formulaGas === selectedGas);

                const coords = filteredData.map((item: {latSensor: number, longSensor: number})  => {
                    return [item.longSensor, item.latSensor];
                });

                const ppm = filteredData.map((item: {ppmValue: number, max_ppmValue: number}) => {
                    return (item.ppmValue/item.max_ppmValue)
                })

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
            if (currentZoom == 1.2) {
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

                mapboxgl.accessToken = import.meta.env.VITE_MAPBOX;
                map.current = new mapboxgl.Map({
                    container: mapContainer.current,
                    style: mapStyle,
                    center: center ? center : [lon, lat],
                    zoom: currentZoom
                });

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

                const geocoderDiv = document.getElementById('search');
                const gasSelector = document.querySelector('.gas-selector');

                if (geocoderDiv && gasSelector && !geocoderAddedRef.current) {
                    geocoderDiv.insertBefore(geocoder.onAdd(map.current), gasSelector);
                    geocoderAddedRef.current = true;

                    const titleContainer = document.querySelector('.title-container') as HTMLElement;
                    const titleContainerWidth = titleContainer ? titleContainer.offsetWidth : 0;

                    if (geocoderDiv.firstChild) {
                        const thirdChild = geocoderDiv.children[0] as HTMLElement;

                        thirdChild.style.color = '#0b0b19';
                        /*thirdChild.style.backgroundColor = '#eeeeee';*/
                        thirdChild.style.borderRadius = '10px';

                        thirdChild.style.fontFamily = 'Aileron-SemiBold';
                        thirdChild.style.display = 'flex';
                        thirdChild.style.alignItems = 'center';
                        thirdChild.style.justifyContent = 'center';

                        thirdChild.style.transition = 'background-color 1s ease';

                    }
                }

                map.current?.on('move', () => {
                    const zoom = map.current?.getZoom();
                    const centerV = map.current?.getCenter();
                    if (zoom && centerV) {
                        setCurrentZoom(zoom);
                        setCenter([centerV.lng, centerV.lat]);
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


    const zoomTest = 0.001678693092394923;

    map.current?.on('move', () => {
        const latitude = map.current?.getCenter().lat;
        const zoom = map.current?.getZoom();
        if (latitude && zoom) {
            const scale = 256 * 0.5 / Math.PI * Math.pow(2, zoom);
            const metersPerPixel = Math.cos(latitude * Math.PI / 180) / scale;
            if (metersPerPixel) {
                if (metersPerPixel > zoomTest) {
                    const element = textElementTitle1;
                    const element2 = textElementTitle2;
                    const element3 = textElement3;


                    if (element instanceof HTMLElement && element2 instanceof HTMLElement && element3 instanceof HTMLElement) {
                        element.style.color = '#eee';
                        element2.style.color = "#eee";

                        element3.style.visibility = "visible";
                        element3.style.opacity = "1";
                    }
                } else {
                    const element = textElementTitle1;
                    const element2 = textElementTitle2;
                    const element3 = textElement3;

                    if (element instanceof HTMLElement && element2 instanceof HTMLElement && element3 instanceof HTMLElement) {
                        element.style.color = "#0B0B19FF";
                        element2.style.color = "#0B0B19FF";

                        element3.style.visibility = "hidden";
                        element3.style.opacity = "0";
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

    const [gasTypes, setGasTypes] = useState<string[]>([]);

    useEffect(() => {
        fetch('/api/gasTypes', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
            },
        })
            .then(response => response.json())
            .then(data => {
                const gasTypes = data.map((item: {formulaGas: string}) => item.formulaGas);
                setGasTypes(gasTypes);
            })
            .catch(error => console.error('Error fetching gas types:', error));
    }, []);

    const handleGasChange = (value: string) => {
    if (gasTypes.includes(value)) {
        if (value === "CO2 non bio") {
            value = "CO2nb";
        } else if (value === "CO2 bio") {
            value = "CO2b";
        }

        setSelectedGas(value as GasType);

        if (value === 'NH3') {
            setGasColors(['rgba(235,255,235,0)', 'rgb(204,255,204)', 'rgb(153,255,153)', 'rgb(102,255,102)', 'rgb(51,255,51)', 'rgb(0,255,0)'])
        } else if (value === 'CO2b') {
            setGasColors(['rgba(255,235,235,0)', 'rgb(255,204,204)', 'rgb(255,153,153)', 'rgb(255,102,102)', 'rgb(255,51,51)', 'rgb(255,0,0)'])
        } else if (value === 'PFC') {
            setGasColors(['rgba(236,222,239,0)', 'rgb(208,209,230)', 'rgb(166,189,219)',  'rgb(103,169,207)', 'rgb(28,144,153)', 'rgb(1,105,114)'])
        } else if (value === 'CO2nb') {
            setGasColors(['rgba(235,235,255,0)', 'rgb(204,204,255)', 'rgb(153,153,255)', 'rgb(102,102,255)', 'rgb(51,51,255)', 'rgb(0,0,255)'])
        } else if (value === 'CH4') {
            setGasColors(['rgba(255,255,235,0)', 'rgb(255,255,204)', 'rgb(255,255,153)', 'rgb(255,255,102)', 'rgb(255,255,51)', 'rgb(255,255,0)'])
        } else if (value === 'HFC') {
            setGasColors(['rgba(255,235,255,0)', 'rgb(255,204,255)', 'rgb(255,153,255)', 'rgb(255,102,255)', 'rgb(255,51,255)', 'rgb(255,0,255)'])
        } else if (value === 'N2O') {
            setGasColors(['rgba(235,235,235,0)', 'rgb(204,204,204)', 'rgb(153,153,153)', 'rgb(102,102,102)', 'rgb(51,51,51)', 'rgb(0,0,0)'])
        }

    } else {
        console.error(`Invalid gas type: ${value}`);
    }
};

    useEffect(() => {
        if (map.current) {
            map.current.setStyle(mapStyle);
        }
    }, [mapStyle]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 450) {
                setTitle("ADH");
            } else {
                setTitle("AIR DATA HUB");
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Call the function initially to set the title based on the initial window size

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    const colorClassTitle1 = mapLoaded ? 'title1' : 'white-color';
    const colorClassTitle2 = mapLoaded ? 'title2' : 'white-color';

    return (
        <Container>
            <AllTitle id="all-title-div">
                <Title className={`title1 ${colorClassTitle1}`} ref={titleRef}>{title}</Title><Search id="search">
                <GasSelector ref={selectRef} onChange={e => handleGasChange(e.target.value)} className="gas-selector">
                        <option value="" disabled selected>{t('Gases')}</option>
                        {gasTypes.map(gasType => {
                            let displayValue = gasType;
                            if (gasType === "CO2 non bio") {
                                displayValue = "CO2nb";
                            } else if (gasType === "CO2 bio") {
                                displayValue = "CO2b";
                            }
                            return <option key={gasType} value={displayValue}>{displayValue}</option>
                        })}
                    </GasSelector>
                </Search>


                <a href="/login" className="button-div"><RightButton className="button">{t('Log in')}</RightButton></a>


            </AllTitle>


            <Map ref={mapContainer} className={mapLoaded ? 'map-visible' : 'map-hidden'}/>
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

const AllTitle = styled.div`
    display: flex;
    justify-content: space-between;

    width: 100%;
    position: absolute;
    z-index: 1;
    padding: 30px;
`

const GasSelector = styled.select`
    display: block;
    padding: 10px 15px 10px 15px;
    width: 100px;
    border: none;
    border-radius: 10px;
    font-size: 14px;
    font-family: 'Aileron-SemiBold', sans-serif;
    color: #0b0b19;
    background-color: white;
    box-shadow: 0px 0px 7px rgba(11, 11, 25, 0.15);

    @media (max-width: 768px) {
        margin-left: 10px;
    }

    @media (max-width: 375px) {
        margin-left: 0;
        margin-top: 20px;
    }
`

const Search = styled.div`
    display: flex;
    justify-content: space-between;

    @media (max-width: 768px) {
        justify-content: center;
        position: fixed;
        padding: 30px;
        bottom: 60px;
        left: 0;
        width: 100%;
    }

    @media (max-width: 375px) {
        justify-content: center;
        flex-direction: column;
        align-items: center;
    }
`


const RightButton = styled.button`
    padding: 12px 18px;
    background: white;
    color: #0b0b19;
    border: none;
    font-family: 'Aileron-SemiBold', sans-serif;
    border-radius: 10px;
    font-size: 14px;
    cursor: pointer;
    box-shadow: 0px 0px 7px rgba(11, 11, 25, 0.15);
    text-decoration: none;

    transition: background 0.3s, color 0.3s;

    &:hover {
        background: #c6c6c6;
        color: #0b0b19;
    }
`;

const Title = styled.h1`
    font-size: 1.2rem;
    font-family: "Montserrat", sans-serif;
    font-weight: 800;
    color: white;
    white-space: nowrap;
    text-shadow: 0px 0px 7px rgba(11, 11, 25, 0.15);
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
//FIX: The geocoder not display
