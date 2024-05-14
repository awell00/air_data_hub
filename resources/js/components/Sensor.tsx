import React, { useState, useEffect, useRef} from 'react';
import ReactDOM from "react-dom/client";
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import {removeAccents} from '../utils/Auth';
import '@mobiscroll/react/dist/css/mobiscroll.min.css';
import { Select, Input, setOptions, localeFr, Datepicker } from '@mobiscroll/react';
import { createGlobalStyle } from 'styled-components';
import { Navigation } from '../utils/Nav';
import {Chart} from 'chart.js/auto';
import {useLanguage} from '../utils/Auth';

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


// Initialization API
Radar.initialize(import.meta.env.VITE_RADAR);

const App: React.FC = () => {
    const [reports, setReports] = useState<ReportItem[]>([])
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const [personnel, setPersonnel] = useState<Personnel | null>(null);
    const { t } = useTranslation();

    const sensorElement = document.getElementById('sensor');
    let sensor: { nameGas: string; idSensor: number,  firstName: string; lastName: string; longSensor: number; latSensor: number, cityAgency: string, formulaGas: string} | null = null;

    useLanguage();

    useEffect(() => {
        const fetchData = async () => {
            if (sensorElement && sensorElement.dataset.sensor) {
                sensor = JSON.parse(sensorElement.dataset.sensor);

                let city = '';
                let adressValue = '';
                try {
                    // @ts-ignore
                    const result = await Radar.reverseGeocode({ latitude: sensor.latSensor, longitude: sensor.longSensor });
                    const { addresses } = result;
                    city = addresses[0]?.city || '';
                    let formattedAddress = addresses[0]?.formattedAddress || '';
                    let addressParts = formattedAddress.split(',');
                    if (addressParts.length >= 2) {
                        adressValue = addressParts[0].trim();
                    } else {
                        adressValue = formattedAddress;
                    }
                } catch (err) {
                    // handle error
                }

                if (!sensor) {
                    throw new Error('Sensor data is missing');
                }

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

                const fetchReports = async () => {
                    // @ts-ignore
                    const response = await fetch(import.meta.env.VITE_APP_URL + `/api/reports-in-sensor/${sensor.idSensor}`, {
                        method: 'GET',
                        headers: {
                            'Authorization': `Bearer ${import.meta.env.VITE_API_TOKEN}`,
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    const reportsValue = data.map((item: { titleReport: string; dateReport: string }) => {
                        return {
                            titleReport: item.titleReport,
                            dateReport: item.dateReport,
                        };
                    }, []);

                    setReports(reportsValue);

                };

                await fetchReports()
            }
        };

        fetchData();
    }, [ sensorElement ]);


    useEffect(() => {
        if (sensorElement && sensorElement.dataset.values) {
            const values = JSON.parse(sensorElement.dataset.values);
            const chartValues = values.map((item: { ppmValue: number; dateData: string}) => {
                const date = new Date(item.dateData);

                // Get the month and year
                const month = date.getMonth() + 1; // getMonth returns a zero-based month, so add 1
                const year = date.getFullYear();

                // Format the month and year into a string
                const formattedDate = `${month}-${year}`;

                return {ppmValue: item.ppmValue, dateData: formattedDate};
            });

            if (chartRef.current) {
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

            return () => {
                if (chartInstance.current) {
                    chartInstance.current.destroy();
                    chartInstance.current = null;
                }
            };
        }
    }, [sensorElement]);


    const chartInstance = useRef<Chart | null>(null);

    useEffect(() => {
        console.log("report" + reports)
    }, []);

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

const GlobalStyles = createGlobalStyle`

`

const Container = styled.div`
    height: 100%;
    background-color: #fffffe;
    display: flex;
    justify-content: center;
    flex-direction: column;
`

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
        width: 93vw;
    }

    @media (max-width: 768px) {
        width: 88vw;
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

const Personnel = styled.div`

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

const UserInfo = styled.div`
    margin: 110px 30px 0;
    font-family: 'FoundersGrotesk-Regular', sans-serif;

    @media (max-width: 450px) {
        margin: 110px 20px 0;
    }
`;
