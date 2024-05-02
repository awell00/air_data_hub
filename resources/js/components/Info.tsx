import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import {removeAccents} from '../utils/Auth';

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

// Initialization API
Radar.initialize(import.meta.env.VITE_RADAR);

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const { t } = useTranslation();
    const [gasTypes, setGasTypes] = useState<string[]>([]);
    const [selectedGas, setSelectedGas] = useState("");
    const [address, setAddress] = useState("");
    const [formulaGas, setFormulaGas] = useState("");
    const [sector, setSector] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isFormComplete, setFormComplete] = useState(false);

    const resetForm = () => {
        setAddress("");
        setFormulaGas("");
        setSector("");
    };

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

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Assuming your form inputs have the names 'address', 'gasName', and 'sector'
        const target = event.target as typeof event.target & {
            address: { value: string };
            formulaGas: { value: string };
            sector: { value: string };
        };

        const address = target.address.value;
        const formulaGas = target.formulaGas.value;
        const sector = target.sector.value;

        // Get latitude and longitude from Radar
        let lat, long;
        await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
            .then(response => response.json())
            .then(data => {
                if (data.length > 0) {
                    const result = data[0];
                    lat = result.lat;
                    long = result.lon;
                } else {
                    throw new Error('No results found');
                }
            })
            .catch(err => {
                // handle error
            });

        // Make POST request to /api/add-sensor
        const access_token = localStorage.getItem('access_token');
        if (!access_token) {
            window.location.href = '/login';
            return;
        }

        console.log(lat, long, formulaGas, sector);
        const response = await fetch('/api/add-sensor', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                latSensor: lat,
                longSensor: long,
                formulaGas: formulaGas,
                idSector: sector
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.message === 'Sensor added successfully') {
            resetForm();
            setSuccessMessage('Sensor added successfully');
            let city = '';
            await Radar.reverseGeocode({ latitude: data.newSensor.latSensor, longitude: data.newSensor.longSensor })
                .then((result) => {
                    const { addresses } = result;
                    city = addresses[0]?.addressLabel || '';
                })
                .catch((err) => {
                    // handle error
                });

            // Add the new sensor to the sensors state
            setSensors(prevSensors => [...prevSensors, { name: data.newSensor.nameGas, city: city }]);
        }
    }

    const fetchSensors = async () => {
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

            return { name: item.nameGas, city: city };
        }));

        setSensors(sensorsValue);
    };

    useEffect(() => {
        fetchSensors();
    }, []);

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

    return (
        <Container>
            <Nav>
                <Redirection href="/">
                    <Title>AIR DATA HUB</Title>
                </Redirection>
                <LogoutButton onClick={handleLogout}>{t("Log out")}</LogoutButton>
            </Nav>


            <UserInfo>
                {user ? (
                    <p>{t("Welcome")}, {removeAccents(user.name)}!</p>
                ) : (
                    <p>Loading...</p>
                )}
            </UserInfo>
            <div>

                <Form onSubmit={handleSubmit}>
                    <Elements>
                        <Input type="text" name="address" placeholder="Address" value={address} onChange={e => setAddress(e.target.value)} />
                        <Selects>
                            <Select
                                name="formulaGas"
                                value={formulaGas}
                                onChange={e => setFormulaGas(e.target.value)}
                            >
                                <option value="" disabled>
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
                            </Select>
                            <Select name="sector" value={sector} onChange={e => setSector(e.target.value)}>
                                <option value="1">Sector 1</option>
                                <option value="2">Sector 2</option>
                                <option value="3">Sector 3</option>
                            </Select>
                        </Selects>
                    </Elements>
                    <Submit isFormComplete={isFormComplete}>
                        <input type="submit" value={t("Add")}/>
                    </Submit>
                    {successMessage && <p>{successMessage}</p>}
                </Form>
            </div>
            <Reports>
                {
                    reports.map((report, index) => (
                        <Component key={index}>
                            <TruncatedText>{removeAccents(report.title)}</TruncatedText>
                            <p>{removeAccents(report.date)}</p>
                        </Component>
                    ))
                }

                {
                    sensors.map((sensor, index) => (
                        <Component key={index}>
                            <TruncatedText>{sensor.city}</TruncatedText>
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
    border-bottom: #f9f9f9 2px solid;
    position: fixed;
    top: 0;
    background-color: #fffffe;
`

const TruncatedText = styled.h2`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 500px; // Adjust this value to suit your needs
`;

const Elements = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;

    @media (max-width: 450px) {
        flex-direction: column;
    }
`

const Form = styled.form`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 1rem;

    @media (max-width: 640px) {
        flex-direction: column;
    }
`

const Selects = styled.div`
    display: flex;
    gap: 1rem;
`

const Title = styled.h1`
    font-family: "FoundersGrotesk-Bold", sans-serif;
    color: #0f0e17;
    font-size: 1.4rem;
    white-space: nowrap;
`;


const LogoutButton = styled.button`
    padding: 10px 20px;
    background-color: #f9f9f9;
    color: #0f0e17;
    border: #dcdcdc 1.5px solid;
    font-family: 'FoundersGrotesk-Medium', sans-serif;
    border-radius: 20px;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: none;

    transition: background 0.3s, color 0.3s;

    &:hover {
        cursor: pointer;
        background: #dcdcdc;
        color: #0f0e17;
    }
`

const Redirection = styled.a`
    text-decoration: none;
`

const Reports = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    margin-top: 60px;

    @media (min-width: 1100px) {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-around;
    }
`

const Submit = styled.div<{ isFormComplete: boolean }>`
    input {
        margin: 1rem;
        padding: 1rem 2rem;
        border-radius: 7px;
        border: #dcdcdc 1.5px solid;
        background-color: ${props => props.isFormComplete ? '#dcdcdc' : '#f9f9f9'};
        color: #0f0e17;
        font-family: 'FoundersGrotesk-Medium', sans-serif;
        transition: background-color 0.3s, color 0.3s;
        font-size: 1.1rem;

        &:hover {
            cursor: pointer;
            outline: none;
            background-color: #dcdcdc;
        }

        @media (max-width: 450px) {
            width: 89vw;
        }
    }
`;


const Input = styled.input`
    padding: 1rem;
    border: 1.5px solid #dcdcdc;
    border-radius: 7px;
    margin: 0 0 0 30px;
    width: 25rem;
    font-size: 1rem;
    font-family: 'FoundersGrotesk-Regular', sans-serif;
    color: #0f0e17;

    @media (max-width: 640px) {
        width: 49vw;
    }

    @media (max-width: 816px) {
        width: 45vw;
    }

    ::placeholder {
        color: #a7a9be;
    }
`;

const Select = styled.select `
    border-radius: 7px;
    border: 1.5px solid #dcdcdc;
    background-color: #fffffe;
    padding: 1rem;
    font-size: 1rem;
    color: #0f0e17;
    font-family: 'FoundersGrotesk-Medium', sans-serif;
`

const Component = styled.div`
    background-color: #f9f9f9;
    border: #dcdcdc 1.5px solid;
    border-radius: 10px;

    padding: 20px;
    width: 500px;
    margin-bottom: 30px;

    @media (min-width: 1100px) {
        width: calc(50% - 60px);
    }

    @media (max-width: 768px) {
        margin: 30px auto;
        width: 500px;
    }

    @media (max-width: 550px) {
        width: 90vw;
    }



    h2 {
        color: #0f0e17;
        font-family: 'FoundersGrotesk-Light', sans-serif;
    }

    p {
        color: #2e2f3e;
        font-family: 'FoundersGrotesk-Regular', sans-serif;
    }
`

const Container = styled.div`
    height: 100%;
    background-color: #fffffe;
    display: flex;
    justify-content: center;
    flex-direction: column;
`

const UserInfo = styled.div`
    margin: 110px 30px 30px;
    font-family: 'FoundersGrotesk-Medium', sans-serif;
`;
