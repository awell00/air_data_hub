import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';

// Libraries for mapping
import Radar from 'radar-sdk-js';

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

// Initialization API
Radar.initialize(import.meta.env.VITE_RADAR);

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const { t } = useTranslation();

    useEffect(() => {
        const browserLang = navigator.language.split('-')[0];
        i18n.changeLanguage(browserLang);
    }, []);


    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.reload();
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

    useEffect(() => {
        const fetchUser = async () => {
            const access_token = localStorage.getItem('access_token');
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

            const sensorsValue = await Promise.all(data.map(async (item: { nameGas: string; latSensor: number, longSensor: number }) => {
                let city = '';
                await Radar.reverseGeocode({ latitude: item.latSensor, longitude: item.longSensor })
                    .then((result) => {
                        const { addresses } = result;
                        city = addresses[0]?.addressLabel || '';
                    })
                    .catch((err) => {
                        // handle error
                    });

                return { name: item.nameGas, city: city };
            }));

            setSensors(sensorsValue);
        };

        fetchUser();
    }, []);


    return (
        <Container>
            <Nav>
                <Redirection href="/">
                    <Title>AIR DATA HUB</Title>
                </Redirection>
                <LogoutButton onClick={handleLogout}>Log out</LogoutButton>
            </Nav>


            <UserInfo>
                {user ? (
                    <p>Welcome, {user.name}!</p>
                ) : (
                    <p>Loading...</p>
                )}
            </UserInfo>
            <Reports>
                {
                    reports.map((report, index) => (
                        <Component key={index}>
                            <h2>{report.title}</h2>
                            <p>{report.date}</p>
                        </Component>
                    ))
                }

                {
                    sensors.map((sensor, index) => (
                        <Component key={index}>
                            <h2>{sensor.city}</h2>
                            <p>{sensor.name}</p>
                        </Component>
                    ))
                }
            </Reports>
        </Container>
    );
}

const renderApp = () => {
    const root = document.getElementById("info");
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

const Nav = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 20px 30px;
    border-bottom: rgba(0, 0, 0, 0.1) 1.5px solid;
    position: fixed;
    top: 0; // Add this line
    background-color: #fff;
`

const Title = styled.h1`
    font-family: "Montserrat", sans-serif;
    font-weight: 800;
    color: #0b0b19;
    font-size: 1.2rem;
    white-space: nowrap;
`;


const LogoutButton = styled.button`
    padding: 10px 18px;
    background: #c6c6c6;
    color: #0b0b19;
    border: none;
    font-family: 'Aileron-SemiBold', sans-serif;
    border-radius: 15px;
    font-size: 16px;
    cursor: pointer;
    text-decoration: none;

    transition: background 0.3s, color 0.3s;

    &:hover {
        cursor: pointer;
        background: #0b0b19;
        color: #ffffff;
    }
`

const Redirection = styled.a`
    text-decoration: none;
`

const Reports = styled.div`

`

const Component = styled.div`
    background-color: #dadada;
    border-radius: 10px;
    padding: 20px;
    width: 500px;
    font-family: 'Aileron-SemiBold';
    margin: 30px;
`

const Container = styled.div`
    height: 100%;

`

const UserInfo = styled.div`
    margin: 110px 30px 30px;
    font-family: 'Montserrat', 'sans serif';
`;
