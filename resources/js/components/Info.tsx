// React imports
import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom/client";

// Styling imports
import styled from 'styled-components';
import { createGlobalStyle } from 'styled-components';
import '@mobiscroll/react/dist/css/mobiscroll.min.css';

// Translation imports
import { useTranslation } from 'react-i18next';

// Mobiscroll imports
import { Select, Input, setOptions, localeFr } from '@mobiscroll/react';

// Utility imports
import {removeAccents} from '../utils/Auth';
import {useLanguage} from '../utils/Auth';

// Component imports
import { Navigation } from '../utils/Nav';

// Libraries for mapping
import Radar from 'radar-sdk-js';

// Zod schemas
import { z } from 'zod';

// Type Definitions
type GasType = 'NH3' | 'CO2b' | 'PFC' | 'CO2nb' | 'CH4' | 'HFC' | 'N2O' | 'SF6';

// Zod Schemas
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

// Interface Definitions
interface User {
    name: string;
    cityAgency: string;
}

interface Report {
    title: string;
    date: string;
}

interface Sensor {
    id: any;
    name: string;
    city: string;
}

// Mobiscroll Options
setOptions({
    locale: localeFr,
    theme: 'ios',
    themeVariant: 'light'
});

// Initialization API
Radar.initialize(import.meta.env.VITE_RADAR);

const App: React.FC = () => {
    // User related states
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<string | null>(null);
    const [admins, setAdmins] = useState([]);

    // Report related states
    const [reports, setReports] = useState<Report[]>([]);
    const [titleReport, setTitleReport] = useState("");

    // Sensor related states
    const [sensors, setSensors] = useState<Sensor[]>([]);
    const [selectedGas, setSelectedGas] = useState("");
    const [formulaGas, setFormulaGas] = useState("");
    const [address, setAddress] = useState("");

    // Data related states
    const [dataAgency, setDataAgency] = useState([]);
    const [dataGas, setDataGas] = useState([]);
    const [dataDate, setData] = useState("");
    const [index, setIndex] = useState<number | null>(null);

    // Other states
    const { t } = useTranslation();
    const [gasTypes, setGasTypes] = useState<string[]>([]);
    const [selectedCoWriters, setSelectedCoWriters] = useState<string[]>([]);
    const [sector, setSector] = useState("");
    const [successMessage, setSuccessMessage] = useState("Sensor added successfully");
    const [isFormComplete, setFormComplete] = useState(false);
    const [title, setTitle] = useState("AIR DATA HUB");
    const [isVisible, setIsVisible] = useState(false);
    const [sectors, setSectors] = useState<string[]>([]);

    // Local storage
    const access_token = localStorage.getItem('access_token');
    const resetForm = () => {
        setAddress("");
        setFormulaGas("");
        setSector("");
    };

    useLanguage();

    useEffect(() => {
        const fetchUser = async () => {
            const access_token = localStorage.getItem('access_token');

            if (!access_token) {
                window.location.href = '/login';
                return;
            }

            // Fetch user data from the API
            const response = await fetch('/api/info', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                },
            });

            // If the response is not ok, throw an error
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            let city = '';

            try {
                // Use Radar API to reverse geocode the latitude and longitude
                const result = await Radar.reverseGeocode({ latitude: data.latAgency, longitude: data.longAgency });
                const { addresses } = result;

                city = addresses[0]?.city || '';
            } catch (err) {
                console.error(err);
            }

            const user = {
                name: data.name,
                cityAgency: city,
            };

            // Update the user and role state variables
            setUser(user);
            setRole(data.role);
        };

        fetchUser();
    }, []);

    useEffect(() => {
        const fetchReportData = async () => {
            // Retrieve the access token from local storage
            const access_token = localStorage.getItem('access_token');

            // If there's no access token, redirect to the login page
            if (!access_token) {
                window.location.href = '/login';
                return;
            }

            // Fetch report data from the API
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

            // Map the data to an array of report values
            const reportsValue = data.map((item: { titleReport: string; dateReport: string }) => ({ title: item.titleReport, date: item.dateReport }));

            setReports(reportsValue);
        };

        fetchReportData();
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Initialize latitude and longitude variables
        let lat, long;

        // Use the OpenStreetMap API to geocode the address
        await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`)
            .then(response => response.json())
            .then(data => {
                // If there are results, set the latitude and longitude
                if (data.length > 0) {
                    const result = data[0];
                    lat = result.lat;
                    long = result.lon;
                } else {
                    // If there are no results, throw an error
                    throw new Error('No results found');
                }
            })
            .catch(err => {
                // Handle any errors that occur during geocoding
                console.error(err);
            });

        // Retrieve the access token from local storage
        const access_token = localStorage.getItem('access_token');

        // If there's no access token, redirect to the login page
        if (!access_token) {
            window.location.href = '/login';
            return;
        }

        // Make a POST request to the /api/add-sensor endpoint
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

        // If the sensor was added successfully
        if (data.message === 'Sensor added successfully') {
            resetForm();

            setSuccessMessage('Sensor added successfully');

            let city = '';

            // Use the Radar API to reverse geocode the latitude and longitude
            await Radar.reverseGeocode({ latitude: lat, longitude: long })
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
                    // Handle any errors that occur during reverse geocoding
                    console.error(err);
                });

            // Add the new sensor to the sensors state
            setSensors(prevSensors => [{ name: data.newSensor.nameGas, city: city, id: data.newSensor.idSensor }, ...prevSensors]);

            // Show the success message
            setIsVisible(true);

            // After 3 seconds, hide the success message and reload the page
            setTimeout(() => {
                setIsVisible(false);
                window.location.reload();
            }, 3000);
        }
    }

    const handleSubmitReport = async (event: React.FormEvent<HTMLFormElement>) => {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Retrieve the access token from local storage
        const access_token = localStorage.getItem('access_token');

        // If there's no access token, redirect to the login page
        if (!access_token) {
            window.location.href = '/login';
            return;
        }

        // Make a POST request to the /api/add-report endpoint
        const response = await fetch('/api/add-report', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${access_token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titleReport: titleReport,
                dataDate: dataDate,
                coWriters: selectedCoWriters,
            })
        });

        // If the response is not ok, log the form data and throw an error
        if (!response.ok) {
            console.log(selectedCoWriters, dataDate, titleReport);
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the response data as JSON
        const data = await response.json();

        // If the report was added successfully
        if (data.message === 'Report added successfully') {
            resetForm();

            setSuccessMessage('Report added successfully');

            // Add the new report to the reports state
            setReports(prevReports => [...prevReports, { title: titleReport, date: dataDate }]);

            // Show the success message
            setIsVisible(true);

            // After 5 seconds, hide the success message
            setTimeout(() => {
                setIsVisible(false);
            }, 5000);
        }
    }

    const fetchSensors = async () => {
        // Retrieve the access token from local storage
        const access_token = localStorage.getItem('access_token');

        // If there's no access token, redirect to the login page
        if (!access_token) {
            window.location.href = '/login';
            return;
        }

        // Fetch sensor data from the API
        const response = await fetch('/api/sensors', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
        });

        // If the response is not ok, throw an error
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the response data as JSON
        const data = await response.json();

        // Map the data to an array of promises for reverse geocoding
        const promises = data.map(async (item: { latSensor: any; longSensor: any; nameGas: any; idSensor: any; }) => {
            // Initialize city variable
            let city = '';

            // Use the Radar API to reverse geocode the latitude and longitude
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
                    // Handle any errors that occur during reverse geocoding
                    console.error(err);
                });

            // Return the new sensor object
            return { name: item.nameGas, city: city, id: item.idSensor };
        });

        // Wait for all promises to resolve
        const newSensors = await Promise.all(promises);

        // Update the sensors state with the new array
        setSensors(newSensors);
    };

    useEffect(() => {
        fetchSensors();
    }, []);

    // Fetch gas types
    useEffect(() => {
       // Define an asynchronous function to fetch gas types
        const fetchGasTypes = async () => {
            try {
                const response = await fetch('/api/gasTypes', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                // Validate the data using the GasTypeSchema
                const validatedData = GasTypeSchema.parse(data);

                // Map the validated data to an array of gas types
                const gasTypes = validatedData.map((item: {formulaGas: string}) => item.formulaGas);

                setGasTypes(gasTypes);
            } catch (error) {
                console.error('Error fetching gas types:', error);
            }
        };

        fetchGasTypes();
    }, []);

    // Fetch sectors
    useEffect(() => {
        const fetchSectors = async () => {
            try {
                const response = await fetch('/api/sectors', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const sectors = data.map((item: {nameSector: number}) => item.nameSector);

                setSectors(sectors);
            } catch (error) {
                console.error('Error fetching sectors:', error);
            }
        };

        fetchSectors();
    }, []);

    // Fetch admins in agency and data in agency
    useEffect(() => {
        const fetchAdminsInAgency = async () => {
            try {
                const response = await fetch('/api/writers-in-agency', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${access_token}`,
                    },
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const fullName = data.map((item: {firstName: string, lastName: string}) => [item.firstName, item.lastName]);
                const name = fullName.map((item: string[]) => item.join(" "));

                setAdmins(name);
            } catch (error) {
                console.error('Error fetching admins in agency:', error);
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
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const dateData = data.map((item: {dateData: string}) => item.dateData);
                const gasData = data.map((item: {formulaGas: string}) => item.formulaGas);

                setDataAgency(dateData);
                setDataGas(gasData);
            } catch (error) {
                console.error('Error fetching data in agency:', error);
            }
        };

        fetchAdminsInAgency();
        fetchDataInAgency();
    }, []);

    return (
        <>
            <GlobalStyles />
            <Container>
                <Navigation />

                <UserInfo>
                    {user ? (
                        <><Title>{user.name}</Title><City>{user.cityAgency.toUpperCase()}</City></>
                    ) : (
                        <p>Loading...</p>
                    )}
                </UserInfo>

                {role === 'technician' ? (
                    <Form onSubmit={handleSubmit}>
                        <Elements>
                            <InputComponent type="text" name="address" placeholder={t("Address")} value={address}
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
                                    placeholder={t("Gas")}
                                />

                                <Select
                                    name="sector"
                                    value={sector}
                                    data={[
                                        { text: t('Sectors'), value: '', disabled: true },
                                        ...sectors.map((gasType, index) => {
                                            let displayValue = t(gasType);
                                            return { text: displayValue, value: index };
                                        })
                                    ]}
                                    touchUi={false}
                                    inputStyle={"outline selectorData" as any}
                                    placeholder={t("Sector")}
                                    dropdown={false}
                                    cssClass="selectorD"
                                    onChange={(event) => setSector(event.value)}
                                />

                            </Selects>
                        </Elements>
                        <Submit>
                            <input type="submit" value={t("Add")}/>
                        </Submit>

                    </Form>
                ) : (
                    <Form onSubmit={handleSubmitReport}>
                        <Elements>
                            <InputComponent
                                type="text"
                                name="titleReport"
                                placeholder={index === null ? t("Need to select data...") : t("Enter") + " " + dataGas[index] + " " + t("Report")}
                                value={titleReport}
                                onChange={e => setTitleReport(e.target.value)}
                                disabled={index === null}
                            />
                            <Selects>
                                <Select
                                    data={[{ text: t('Data'), value: '', disabled: true }, ...dataAgency]}
                                    inputStyle={"outline selectorData" as any}
                                    touchUi={false}
                                    dropdown={false}
                                    labelStyle="stacked"
                                    placeholder={t("Data")}
                                    onChange={(event) => {
                                        const selectedValue = event.value;
                                        const selectedIndex = dataAgency.findIndex(item => item === selectedValue);
                                        setIndex(selectedIndex);
                                        setData(selectedValue);
                                    }}
                                    cssClass="selectorD"
                                />
                                <Select
                                    data={[{ text: t('Co-writers'), value: '', disabled: true }, ...admins.map(admin => removeAccents(admin))]}
                                    selectMultiple={true}
                                    touchUi={false}
                                    inputStyle={"outline selector" as any}
                                    labelStyle={"stacked labelStyle" as any}
                                    placeholder={t("Co-writers")}
                                    dropdown={false}
                                    cssClass="selectorD"
                                    onChange={(event) => setSelectedCoWriters(event.value)}
                                />
                            </Selects>
                        </Elements>
                        <Submit>
                            <input type="submit" value={t("Add")}/>
                        </Submit>
                    </Form>
                )}

                {<Success className={isVisible ? 'fadeOut' : ''}>{successMessage}</Success>}

                <Reports>
                    {reports.map((report, index) => (
                        <Component key={index}>
                            <TruncatedText>{removeAccents(report.title)}</TruncatedText>
                            <p>{removeAccents(report.date)}</p>
                        </Component>
                    ))}

                    {sensors.map((sensor, index) => (
                        <Component>
                            <a href={`/sensor/${sensor.id}`} key={index} style={{textDecoration: 'none'}}>
                                <TruncatedText>{sensor.city}</TruncatedText>
                                <p>{t(sensor.name)}</p>
                            </a>
                        </Component>
                    ))}
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

// Global styles
const GlobalStyles = createGlobalStyle`
    .inputComponent1,
    .inputComponent2,
    .inputComponent3,
    .selector,
    .selectorData {
        border-width: 1.5px !important;
        border-color: #dcdcdc !important;
        margin: 0 !important;
        font-family: 'FoundersGrotesk-Regular', sans-serif !important;
    }
    // ... rest of the styles
`;

// Layout components
const Container = styled.div`
    height: 100%;
    background-color: #fffffe;
    display: flex;
    justify-content: center;
    flex-direction: column;
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

// Form components
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
const InputComponent = styled.input`
    padding: 1rem;
    height: 2.9rem;
    border: 1.5px solid #dcdcdc;
    border-radius: 7px;
    margin: 0;
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
const Submit = styled.div`
    input {
        margin: 1rem 0;
        padding: .72rem 1.7rem;
        border-radius: 7px;
        border: #dcdcdc 1.5px solid;
        background-color: '#f9f9f9';
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

// Report components
const Reports = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /*width: 100%;*/
    margin: 30px;
    margin-top: 60px;

    @media (min-width: 900px) {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
    }
`
const Component = styled.div`
    background-color: #f9f9f9;
    border: #dcdcdc 1.5px solid;
    border-radius: 10px;

    padding: 20px;
    margin-bottom: 30px;

    @media (min-width: 900px) {
        width: calc(53.5% - 60px);
    }


    @media (max-width: 900px) {
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

// User info components
const UserInfo = styled.div`
    margin: 110px 30px 30px;
    font-family: 'FoundersGrotesk-Regular', sans-serif;

    @media (max-width: 450px) {
        margin: 110px 20px 30px;
    }
`;
const Title = styled.p`
    font-size: 2rem;
    color: #0f0e17;
    font-family: 'FoundersGrotesk-Medium', sans-serif;
`;
const City = styled.p`
    font-size: 1.2rem;
    color: #2e2f3e;
    font-family: 'FoundersGrotesk-Regular', sans-serif;
`;

// Other components
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
const Success = styled.p`
    color: #0f0e17;
    opacity: 0;
    font-family: 'FoundersGrotesk-Regular', sans-serif;
    text-align: center;
`
const Elements = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
    justify-content: center;

    @media (max-width: 450px) {
        flex-direction: column;
    }
`
const Selects = styled.div`
    display: flex;
    gap: 1rem;
`
const Redirection = styled.a`
    text-decoration: none;
`
