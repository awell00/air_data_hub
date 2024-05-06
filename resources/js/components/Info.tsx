import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import {removeAccents} from '../utils/Auth';
import '../../css/mobiscroll.javascript.min.css'
import '@mobiscroll/react/dist/css/mobiscroll.min.css';
import { Select, Input, setOptions, localeFr } from '@mobiscroll/react';
import { createGlobalStyle } from 'styled-components';
import Test from '../utils/Test';
const worker = new Worker(new URL('./worker.ts', import.meta.url))

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

// Initialization API
Radar.initialize(import.meta.env.VITE_RADAR);

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const { t } = useTranslation();
    const [gasTypes, setGasTypes] = useState<string[]>([]);
    const [dataAgency, setDataAgency] = useState([]);
    const [admins, setAdmins] = useState([]);
    const [selectedGas, setSelectedGas] = useState("");
    const [selectedCoWriters, setSelectedCoWriters] = useState<string[]>([]);
    const [address, setAddress] = useState("");
    const [formulaGas, setFormulaGas] = useState("");
    const [sector, setSector] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [isFormComplete, setFormComplete] = useState(false);
    const [dataGas, setDataGas] = useState([]);
    const [index, setIndex] = useState<number | null>(null);
    const access_token = localStorage.getItem('access_token');
    const [title, setTitle] = useState("AIR DATA HUB");
    const [role, setRole] = useState<string | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    const resetForm = () => {
        setAddress("");
        setFormulaGas("");
        setSector("");
    };

    useEffect(() => {
        const handleResize = () => {
            // If the window width is less than or equal to 450, set the title to "ADH"
            // Otherwise, set the title to "AIR DATA HUB"
            setTitle(window.innerWidth <= 450 ? "ADH" : "AIR DATA HUB");
        };

        // Add the resize event listener
        window.addEventListener('resize', handleResize);

        handleResize();

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

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
                idSector: sector,

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

            setIsVisible(true);
            setTimeout(() => {
                setIsVisible(false);
                setSuccessMessage("");
            }, 5000);
        }
    }

    const handleSubmitReport = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // Assuming your form inputs have the names 'address', 'gasName', and 'sector'
        const target = event.target as typeof event.target & {
            titleReport: { value: string };
            dataDate: { value: string };
        };

        const titleReport = target.titleReport.value;
        const dataDate = target.dataDate.value;
        const coWriters = selectedCoWriters;

        const access_token = localStorage.getItem('access_token');
        if (!access_token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch('/api/add-report', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titleReport: titleReport,
                dataDate: dataDate,
                coWriters: coWriters,
            })
        });

        if (!response.ok) {
            console.log(selectedCoWriters)
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.message === 'Report added successfully') {
            resetForm();
            setSuccessMessage('Report added successfully');
            setReports(prevReports => [...prevReports, { title: titleReport, date: dataDate }]);
        }
    }

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

        // Send the sensor data to the web worker
        worker.postMessage(data);

        // Listen for messages from the web worker
        worker.onmessage = (event) => {
            // The web worker has finished reverse geocoding the sensor data
            const sensorsValue = event.data;
            setSensors(sensorsValue);
        };
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

    //Get the data in agency to add in the select option of the form with request get /api/data-in-agency
    useEffect(() => {
        const fetchAdminsInAgency = async () => {
            try {
                const response = await fetch('/api/admins-in-agency', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                    },
                });

                if (!response.ok) {
                    console.error('Network response was not ok');
                    return;
                }

                const data = await response.json();

                const fullName = data.map((item: {firstName: string, lastName: string}) => [item.firstName, item.lastName]);
                const name = fullName.map((item: string[]) => item.join(" "));

                setAdmins(name);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    console.error('Validation error:', error.errors);
                } else {
                    console.error('Error fetching gas types:', error);
                }
            }
        };

        const fetchDataInAgency = async () => {
            try {
                const response = await fetch('/api/data-in-agency', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                    },
                });

                if (!response.ok) {
                    console.error('Network response was not ok');
                    return;
                }

                const data = await response.json();

                const dateData = data.map((item: {dateData: string}) => item.dateData);
                const gasData = data.map((item: {formulaGas: string}) => item.formulaGas);

                setDataAgency(dateData);
                setDataGas(gasData);
            } catch (error) {
                if (error instanceof z.ZodError) {
                    console.error('Validation error:', error.errors);
                } else {
                    console.error('Error fetching gas types:', error);
                }
            }
        };

        fetchAdminsInAgency().catch(error => console.error('Error in fetchGasTypes:', error));
        fetchDataInAgency().catch(error => console.error('Error in fetchGasTypes:', error));
    }, []);

    return (
        <>
            <GlobalStyles />
            <Container>
                <Nav>
                    <Redirection href="/">
                        <Title>{title}</Title>
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
                {role === 'technician' && (
                    <Form onSubmit={handleSubmit}>
                        <Elements>
                            <InputComponent type="text" name="address" placeholder="Address" value={address}
                                            onChange={e => setAddress(e.target.value)}/>
                            <Selects>
                                <Select
                                    name="formulaGas"
                                    value={formulaGas}
                                    onChange={(event) => setFormulaGas(event.value)}
                                    data={[
                                        { text: t('Gases'), value: '', disabled: true },
                                        ...gasTypes.map(gasType => {
                                            let displayValue = gasType;

                                            if (gasType === "CO2 non bio") {
                                                displayValue = "CO2nb";
                                            } else if (gasType === "CO2 bio") {
                                                displayValue = "CO2b";
                                            }

                                            return { text: displayValue, value: displayValue };
                                        })
                                    ]}
                                    touchUi={false}
                                    dropdown={false}
                                    inputStyle={"outline selectorData" as any}
                                    cssClass="selectorD"
                                    placeholder="Gas"
                                />

                                <Select
                                    name="sector"
                                    value={sector}
                                    data={[
                                        { text: t('Sectors'), value: '', disabled: true },
                                        {text: 'Sector 1', value: 1},
                                        {text: 'Sector 2', value: 2},
                                        {text: 'Sector 3', value: 3},
                                    ]}
                                    touchUi={false}
                                    inputStyle={"outline selectorData" as any}
                                    placeholder="Sector"
                                    dropdown={false}
                                    cssClass="selectorD"
                                    onChange={(event) => setSector(event.value)}
                                />

                            </Selects>
                        </Elements>
                        <Submit isFormComplete={isFormComplete}>
                            <input type="submit" value={t("Add")}/>
                        </Submit>

                    </Form>
                )}

                {role === 'agent' && (
                    <Form onSubmit={handleSubmitReport}>
                        <Elements>
                            <InputComponent
                                type="text"
                                name="titleReport"
                                placeholder={index === null ? "Select Date" : "Enter " + dataGas[index] + " Report"}
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                disabled={index === null}
                            />
                            <Selects>
                                <Select
                                    data={[{ text: t('Data'), value: '', disabled: true }, ...dataAgency]}
                                    inputStyle={"outline selectorData" as any}
                                    touchUi={false}
                                    dropdown={false}
                                    labelStyle="stacked"
                                    placeholder="Data"
                                    onChange={(event) => {
                                        const selectedValue = event.value;
                                        setFormulaGas(selectedValue);
                                        const selectedIndex = dataAgency.findIndex(item => item === selectedValue);
                                        setIndex(selectedIndex);
                                    }}
                                    cssClass="selectorD"
                                />
                                <Select
                                    data={[{ text: t('Co-Writers'), value: '', disabled: true }, ...admins.map(admin => removeAccents(admin))]}
                                    selectMultiple={true}
                                    touchUi={false}
                                    inputStyle={"outline selector" as any}
                                    labelStyle={"stacked labelStyle" as any}
                                    placeholder="Co-Writers"
                                    dropdown={false}
                                    cssClass="selectorD"
                                    onChange={(event) => setSelectedCoWriters(event.value)}
                                />
                            </Selects>
                        </Elements>
                        <Submit isFormComplete={isFormComplete}>
                            <input type="submit" value={t("Add")}/>
                        </Submit>
                    </Form>

                )}

                {role === 'agent' && (
                    <InnerDiv>
                        <Input
                            inputStyle={"outline inputComponent1" as any}
                            type="text"
                            name="titleReport"
                            placeholder={index === null ? "Need to select Data..." : "Enter " + dataGas[index] + " Report"}
                            onChange={(e: {
                                target: { value: React.SetStateAction<string>; };
                            }) => setAddress(e.target.value)}
                            disabled={index === null}
                        />
                        <Select
                            data={[{ text: t('Data'), value: '', disabled: true }, ...dataAgency]}
                            inputStyle={"outline inputComponent2" as any}
                            touchUi={false}
                            dropdown={false}
                            placeholder="Select Data..."
                            onChange={(event) => {
                                const selectedValue = event.value;
                                setFormulaGas(selectedValue);
                                const selectedIndex = dataAgency.findIndex(item => item === selectedValue);
                                setIndex(selectedIndex);
                            }}
                            cssClass="selectorD"
                        />
                        <Select
                            data={[{ text: t('Co-Writers'), value: '', disabled: true },...admins.map(admin => removeAccents(admin))]}
                            inputStyle={"outline inputComponent3" as any}
                            touchUi={false}
                            dropdown={false}
                            placeholder="Select Co-Writers..."
                            selectMultiple={true}
                            labelStyle="stacked"
                            cssClass="selectorD"
                            onChange={(event) => setSelectedCoWriters(event.value)}
                        />
                        <Submit isFormComplete={isFormComplete}>
                            <input type="submit" value={t("Add")}/>
                        </Submit>
                    </InnerDiv>
                )}

                {role === 'technician' && (
                    <InnerDiv>
                        <Input
                            inputStyle={"outline inputComponent1" as any}
                            type="text"
                            name="titleReport"
                            placeholder={index === null ? "Need to select Data..." : "Enter " + dataGas[index] + " Report"}
                            onChange={(e: {
                                target: { value: React.SetStateAction<string>; };
                            }) => setAddress(e.target.value)}
                            disabled={index === null}
                        />
                        <Select
                            data={[{ text: t('Data'), value: '', disabled: true }, ...dataAgency]}
                            inputStyle={"outline inputComponent2" as any}
                            touchUi={false}
                            dropdown={false}
                            placeholder="Select Data..."
                            onChange={(event) => {
                                const selectedValue = event.value;
                                setFormulaGas(selectedValue);
                                const selectedIndex = dataAgency.findIndex(item => item === selectedValue);
                                setIndex(selectedIndex);
                            }}
                            cssClass="selectorD"
                        />
                        <Select
                            data={[{ text: t('Co-Writers'), value: '', disabled: true },...admins.map(admin => removeAccents(admin))]}
                            inputStyle={"outline inputComponent3" as any}
                            touchUi={false}
                            dropdown={false}
                            placeholder="Select Co-Writers..."
                            selectMultiple={true}
                            labelStyle="stacked"
                            cssClass="selectorD"
                            onChange={(event) => setSelectedCoWriters(event.value)}
                        />
                        <Submit isFormComplete={isFormComplete}>
                            <input type="submit" value={t("Add")}/>
                        </Submit>
                    </InnerDiv>
                )}

                {successMessage && <Success className={successMessage ? 'fadeOut' : ''}>{successMessage}</Success>}

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
        </>
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
    z-index: 1000;
`
const InnerDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: none;

    @media (max-width: 650px) {
        display: flex;
    }
`;

const TruncatedText = styled.h2`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 800px;

    @media (min-width: 1100px) {
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 600px;
    }
`;

const GlobalStyles = createGlobalStyle`

    .inputComponent1 {
        border-radius: 7px 7px 0 0 !important;
        border-bottom: none !important;
        width: 25rem !important;
        font-family: 'FoundersGrotesk-Regular', sans-serif !important;
        border-width: 1.5px !important;
        border-color: #dcdcdc !important;
        margin: 0 0 !important;

        @media (max-width: 450px) {
            width: 89vw !important;
        }
    }

    .inputComponent2 {
        border-radius: 0 !important;
        border-bottom: none !important;
        width: 25rem !important;
        font-family: 'FoundersGrotesk-Regular', sans-serif !important;
        border-width: 1.5px !important;
        border-color: #dcdcdc !important;
        margin: 0 0 !important;

        @media (max-width: 450px) {
            width: 89vw !important;
        }
    }

    .inputComponent3 {
        border-radius: 0 0 7px 7px !important;
        width: 25rem !important;
        border-width: 1.5px !important;
        border-color: #dcdcdc !important;
        margin: 0 0 !important;
        font-family: 'FoundersGrotesk-Regular', sans-serif !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;

        @media (max-width: 450px) {
            width: 89vw !important;
        }
    }

    .selectorD {
        font-family: 'FoundersGrotesk-Regular', sans-serif !important;
    }

    .selectorData {
        width: 7rem !important;
        display: block !important;
        height: 2.9rem !important;
        border-radius: 7px !important;
        background-color: #fffffe !important;
        font-size: 1rem !important;
        border-width: 1.5px !important;
        margin: 0 !important;
        font-family: 'FoundersGrotesk-Regular', sans-serif !important;
        color: #020204 !important;
        border-width: 1.5px !important;
        border-color: #dcdcdc !important;
        max-width: 7rem !important;
        max-height: 10rem !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;

        :hover {
            cursor: pointer;
        }
    }

    .mbsc-ios.mbsc-textfield-wrapper-box, .mbsc-ios.mbsc-textfield-wrapper-outline {
        margin: 0;
    }

    .selector {
        display: block !important;
        border-radius: 7px !important;
        background-color: #fffffe !important;
        font-size: 1rem !important;
        border-width: 1.5px !important;
        margin: 0 !important;
        font-family: 'FoundersGrotesk-Regular', sans-serif !important;
        color: #020204 !important;
        border-width: 1.5px !important;
        border-color: #dcdcdc !important;
        max-width: 10rem !important;
        max-height: 10rem !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;

        :hover {
            cursor: pointer;
        }
    }

    @keyframes fadeOut {
        0% { opacity: 1; }
        60% { opacity: 1; }
        100% { opacity: 0; }
    }

    .fadeOut {
        animation-name: fadeOut;
        animation-duration: 5s;
        animation-fill-mode: forwards;
    }
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

    @media (max-width: 650px) {
        display: none;
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

const Success = styled.p`
    color: #0f0e17;
    font-family: 'FoundersGrotesk-Regular', sans-serif;
    margin: 1rem 0;
    text-align: center;
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
        margin: 1rem 0;
        padding: .75rem 1.7rem;
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

        @media (max-width: 650px) {
            width: 25rem;
        }

        @media (max-width: 450px) {
            width: 89vw;
        }
    }
`;


const InputComponent = styled.input`
    padding: 1rem;
    height: 2.9rem;
    border: 1.5px solid #dcdcdc;
    border-radius: 7px;
    margin: 0 0 0 16px;
    width: 25rem;
    font-size: 1rem;
    font-family: 'FoundersGrotesk-Regular', sans-serif;
    color: #0f0e17;

    @media (max-width: 640px) {
        width: 49vw;
    }

    @media (max-width: 1000px) {
        width: 30vw;
    }

    ::placeholder {
        color: #a7a9be;
    }

    &:focus {
        outline: none;
        font-size: 1rem;
    }
`;

const Selector = styled.select `
    border-radius: 7px;
    border: 1.5px solid #dcdcdc;
    background-color: #fffffe;
    padding: 1rem;
    font-size: 1rem;
    color: #0f0e17;
    font-family: 'FoundersGrotesk-Medium', sans-serif;
    -webkit-appearance: none;
    -moz-appearance: none;

    &:focus {
        outline: none;
        font-size: 1rem;
    }
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


    @media (max-width: 1100px) {
        width: 90vw;
    }

   /* @media (max-width: 768px) {
        margin: 30px auto;
        width: 500px;
    }

    @media (max-width: 550px) {
        width: 90vw;
    }*/



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
