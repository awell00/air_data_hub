import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import {removeAccents} from '../utils/Auth';
import '@mobiscroll/react/dist/css/mobiscroll.min.css';
import { Select, Input, setOptions, localeFr, Datepicker } from '@mobiscroll/react';
import { createGlobalStyle } from 'styled-components';
import { Navigation } from '../utils/Nav';

setOptions({
    locale: localeFr,
    theme: 'ios',
    themeVariant: 'light'
});



// Libraries for mapping
import Radar from 'radar-sdk-js';

import { z } from 'zod';
type GasType = 'NH3' | 'CO2b' | 'PFC' | 'CO2nb' | 'CH4' | 'HFC' | 'N2O' | 'SF6';

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

interface User {
    name: string;
}

interface Report {
    title: string;
    date: string;
}

interface Sensor {
    name: string;
    city: string;
}

interface Personnel {
    firstName: string;
    lastName: string;
    startDate: string;
    namePost: string;
    verificationCode: number;
}

// Initialization API
Radar.initialize(import.meta.env.VITE_RADAR);

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const { t } = useTranslation();
    const [address, setAddress] = useState("");
    const [formulaGas, setFormulaGas] = useState("");
    const [sector, setSector] = useState("");
    const [role, setRole] = useState("");
    const [personnel, setPersonnel] = useState<Personnel[]>([]);
    const access_token = localStorage.getItem('access_token');

    const sensorElement = document.getElementById('sensor');
    let sensor = null;

    if (sensorElement && sensorElement.dataset.sensor) {
        sensor = JSON.parse(sensorElement.dataset.sensor);
        console.log(sensor);
    }
/*    const resetForm = () => {
        setAddress("");
        setFormulaGas("");
        setSector("");
    };

    useEffect(() => {
        const fetchUser = async () => {
            const access_token = localStorage.getItem('access_token');
            if (!access_token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/info', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setUser(data);
            setRole(data.role);
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            const access_token = localStorage.getItem('access_token');
            if (!access_token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/personnel', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const personnelValue = data.map((item: { firstName: string; lastName: string, startDate: string, namePost: string, verificationCode: number}) => ({ firstName: item.firstName, lastName: item.lastName, startDate: item.startDate, namePost: item.namePost, verificationCode: item.verificationCode}));
            console.log(personnelValue)
            setPersonnel(personnelValue);
        };

        fetchUser();
    }, []);


    useEffect(() => {
        const fetchUser = async () => {
            const access_token = localStorage.getItem('access_token');
            if (!access_token) {
                window.location.href = '/login';
                return;
            }

            const response = await fetch('/api/report', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const reportsValue = data.map((item: { titleReport: string; dateReport: string }) => ({ title: item.titleReport, date: item.dateReport }));
            setReports(reportsValue);
        };

        fetchUser();
    }, []);

    const fetchSensors = async () => {
        if (!access_token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch('/api/sensors', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        for (const item of data) {
            let city = '';

            await Radar.reverseGeocode({ latitude: item.latSensor, longitude: item.longSensor })
                .then((result) => {
                    const { addresses } = result;
                    let formattedAddress = addresses[0]?.formattedAddress || '';
                    let addressParts = formattedAddress.split(',');
                    if (addressParts.length >= 2) {
                        city = addressParts[0].trim() + ' | ' + addressParts[1].trim();
                    } else {
                        city = formattedAddress;
                    }
                })
                .catch((err) => {
                    // handle error
                });

            // Update the sensors state as soon as a sensor gets its address
            setSensors(prevSensors => [...prevSensors, { name: item.nameGas, city: city }]);
        }
    };

    useEffect(() => {
        fetchSensors();
    }, []);*/

    return (
        <>
            <GlobalStyles />
            <Container>
                <Navigation/>
                <h1>{sensor.name}</h1>
                <p>{sensor.description}</p>
            </Container>
        </>
    );
}

const renderApp = () => {
    const root = document.getElementById("sensor");
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

const GlobalStyles = createGlobalStyle`

`

const Container = styled.div`
    height: 100%;
    background-color: #fffffe;
    display: flex;
    justify-content: center;
    flex-direction: column;
`
