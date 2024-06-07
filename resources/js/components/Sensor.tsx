// React related imports
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from "react-dom/client";

// Third-party libraries
import styled, { createGlobalStyle } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Chart } from 'chart.js/auto';
import { setOptions, localeFr } from '@mobiscroll/react';

// Utility functions
import { removeAccents, useLanguage } from '../utils/Auth';

// Components
import { Navigation } from '../utils/Nav';

// CSS
import '@mobiscroll/react/dist/css/mobiscroll.min.css';

// Libraries for mapping
import Radar from 'radar-sdk-js';

// Type aliases
type GasType = 'NH3' | 'CO2b' | 'PFC' | 'CO2nb' | 'CH4' | 'HFC' | 'N2O' | 'SF6';

// Zod schemas
import { z } from 'zod';

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

// Interfaces
interface ChartDataItem {
    ppmValue: number;
    dateData: string;
}

interface ReportItem {
    titleReport: string;
    dateReport: string;
}

interface Personnel {
    firstName: string;
    lastName: string;
    longSensor: number;
    latSensor: number;
    cityAgency: string;
    adressSensor: string;
}

setOptions({
    locale: localeFr,
    theme: 'ios',
    themeVariant: 'light'
});

// Initialization API
Radar.initialize(import.meta.env.VITE_RADAR);

const App: React.FC = () => {
    // React hooks
    const { t } = useTranslation();
    const [reports, setReports] = useState<ReportItem[]>([]);
    const [personnel, setPersonnel] = useState<Personnel | null>(null);
    const chartRef = useRef<HTMLCanvasElement | null>(null);

    // DOM element retrieval
    const sensorElement = document.getElementById('sensor');

    // Variable declaration
    let sensor: { nameGas: string; idSensor: number,  firstName: string; lastName: string; longSensor: number; latSensor: number, cityAgency: string, formulaGas: string} | null = null;
    const chartInstance = useRef<Chart | null>(null);

    useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            if (sensorElement && sensorElement.dataset.sensor) {
                // Parse the sensor data from the sensorElement dataset
                sensor = JSON.parse(sensorElement.dataset.sensor);

                let city = '';
                let adressValue = '';

                try {
                    // Use Radar's reverseGeocode function to get the address from the sensor's latitude and longitude
                    // @ts-ignore
                    const result = await Radar.reverseGeocode({ latitude: sensor.latSensor, longitude: sensor.longSensor });
                    const { addresses } = result;

                    city = addresses[0]?.city || '';

                    // Get the formatted address from the address
                    let formattedAddress = addresses[0]?.formattedAddress || '';

                    // Split the formatted address into parts
                    let addressParts = formattedAddress.split(',');

                    // If there are at least two parts, use the first part as the address value
                    // Otherwise, use the whole formatted address as the address value
                    if (addressParts.length >= 2) {
                        adressValue = addressParts[0].trim();
                    } else {
                        adressValue = formattedAddress;
                    }
                } catch (err) {
                    console.error('Error getting address:', err);
                }

                if (!sensor) {
                    throw new Error('Sensor data is missing');
                }

                // Create an object with the sensor values
                const sensorValues = {
                    firstName: sensor.firstName,
                    lastName: sensor.lastName,
                    longSensor: sensor.longSensor,
                    latSensor: sensor.latSensor,
                    cityAgency: city.toUpperCase(),
                    adressSensor: adressValue,
                    formulaGas: sensor.formulaGas,
                };

                setPersonnel(sensorValues);

                // Define an asynchronous function to fetch reports
                const fetchReports = async () => {
                    // Send a GET request to the reports API endpoint
                    // @ts-ignore
                    const response = await fetch(import.meta.env.VITE_APP_URL + `/api/reports-in-sensor/${sensor.idSensor}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                        },
                    });

                    // If the response is not ok, throw an error
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    // Parse the response data as JSON
                    const data = await response.json();

                    // Map the data to an array of report values
                    const reportsValue = data.map((item: { titleReport: string; dateReport: string }) => {
                        return {
                            titleReport: item.titleReport,
                            dateReport: item.dateReport,
                        };
                    }, []);

                    // Update the reports state with the report values
                    setReports(reportsValue);
                };

                // Call the fetchReports function
                await fetchReports();
            }
        };

        fetchData();
    }, [ sensorElement ]);


    useEffect(() => {
        // Check if sensorElement exists and if it has dataset values
        if (sensorElement && sensorElement.dataset.values) {
            // Parse the values from the sensorElement dataset
            const values = JSON.parse(sensorElement.dataset.values);

            // Map the values to an array of chart values, formatting the date data
            const chartValues = values.map((item: { ppmValue: number; dateData: string}) => {
                const date = new Date(item.dateData);

                // Get the month and year from the date
                const month = date.getMonth() + 1; // getMonth returns a zero-based month, so add 1
                const year = date.getFullYear();

                // Format the month and year into a string
                const formattedDate = `${month}-${year}`;

                return {ppmValue: item.ppmValue, dateData: formattedDate};
            });

            // Check if chartRef.current exists
            if (chartRef.current) {
                // Create a new Chart instance with the chart values
                chartInstance.current = new Chart(chartRef.current, {
                    type: 'line',
                    data: {
                        labels: chartValues.map((item: { dateData: string; }) => item.dateData),
                        datasets: [{
                            label: t('PPM Value for') + ' ' + (sensor ? t(sensor.nameGas) : 'unknown gas'),
                            data: chartValues.map((item: { ppmValue: number; }) => item.ppmValue),
                            borderColor: 'black',
                            fill: false,
                            tension: 0.1
                        }]
                    },
                    options: {
                        plugins: {
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        let label = context.dataset.label || '';
                                        if (label) {
                                            label += ': ';
                                        }
                                        label += Number(context.parsed.y).toFixed(7);
                                        return label;
                                    }
                                }
                            }
                        }
                    }
                });
            }

            // Return a cleanup function that destroys the Chart instance
            return () => {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                    chartInstance.current = null;
                }
            };
        }
    }, [sensorElement]);

    return (
        <>
            <GlobalStyles />
            <Container>
                <Navigation/>
                <UserInfo>
                    <Title>{personnel?.cityAgency}</Title>
                    <City>{personnel?.adressSensor}</City>
                </UserInfo>

                <Div>
                    <ChartDiv>
                        <Canvas ref={chartRef}/>
                    </ChartDiv>
                </Div>

                <Reports>
                {
                        reports.map((report, index) => (
                            <Component key={index}>
                                <TruncatedText>{removeAccents(report.titleReport)}</TruncatedText>
                                <p>{removeAccents(report.dateReport)}</p>
                            </Component>
                        ))
                }
                </Reports>

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

// Global styles
const GlobalStyles = createGlobalStyle``

// Layout components
const Container = styled.div`
    height: 100%;
    background-color: #fffffe;
    display: flex;
    justify-content: center;
    flex-direction: column;
`
const Div = styled.div`
    display: flex;
    flex-direction: row;
    font-family: 'FoundersGrotesk-Regular', sans-serif;
    justify-content: center;
    align-items: center;
    margin: 0 auto;
    margin-top: 10px;
    width: 100%;
    height: 100%;
    padding: 10px;
    padding-top: 10px;
    padding-bottom: 10px;
    padding-left: 10px;
    padding-right: 10px;
`;

// Report components
const Reports = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
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
        width: 93vw;
    }

    @media (max-width: 768px) {
        width: 88vw;
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
    margin: 110px 30px 0;
    font-family: 'FoundersGrotesk-Regular', sans-serif;

    @media (max-width: 450px) {
        margin: 110px 20px 0;
    }
`;
const Title = styled.p`
    font-size: 1.9rem;
    color: #0f0e17;
    font-family: 'FoundersGrotesk-Medium', sans-serif;
`;
const City = styled.p`
    font-size: 1.1rem;
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
const Canvas = styled.canvas`
    background-color: #f9f9f9;
    border: #dcdcdc 1.5px solid;
    border-radius: 7px;
    padding: 10px;
`;
const ChartDiv = styled.div`
    width: 50%;
    height: 50%;
    margin: 0 auto;
    margin-top:  30px;

    @media (max-width: 1024px){
        width: 95%;
    }
`;
const Personnel = styled.div``;
