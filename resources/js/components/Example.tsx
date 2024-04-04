import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import '../../css/app.css';
import Radar from 'radar-sdk-js';
import 'radar-sdk-js/dist/radar.css';

type Coordinate = [number, number];

Radar.initialize('prj_live_pk_e0443df992afd7bebd2ae00bfbc34e850a743aea');

const App: React.FC = () => {
    const [center, setCenter] = useState<Coordinate | undefined>();
    const [zoom, setZoom] = useState<number>(6);

    useEffect(() => {
        Radar.autocomplete({
            query: 'Bordeaux',
            limit: 10
        })
            .then((result) => {
                const { addresses } = result;
                setCenter([addresses[0].latitude, addresses[0].longitude] as Coordinate)
            })
            .catch((err) => {
                // handle error
            });
    }, []); // Empty dependency array ensures this runs only on first render


    console.log(center)
    return (
        <div>
            <MapContainer center={[47.2276,2.6137]} zoom={zoom}>
                <TileLayer
                    attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.osm.org/{z}/{x}/{y}.png"
                />
                {center && <Marker position={center}>
                    <Popup>
                        A pretty CSS3 popup. <br /> Easily customizable.
                    </Popup>
                </Marker>}
            </MapContainer>
        </div>
    );
}

const renderApp = () => {
    const root = document.getElementById("example");
    if (root) {
        const rootContainer = ReactDOM.createRoot(root);
        rootContainer.render(
            <React.StrictMode>
                <App />
            </React.StrictMode>
        );
    }
}

// Wait for the DOM to load before rendering the app
document.addEventListener('DOMContentLoaded', renderApp);
