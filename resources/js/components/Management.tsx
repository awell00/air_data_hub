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

    const resetForm = () => {
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
    }, []);

    return (
        <>
            <GlobalStyles />
            <Container>
                <Navigation />

                <UserInfo>
                    {user ? (
                        <p>{t("Welcome")}, {removeAccents(user.name)}!</p>
                    ) : (
                        <p>Loading...</p>
                    )}
                </UserInfo>

                <Form>
                    <Elements>
                        <InputComponent
                            type="text"
                            name="firstName"
                            placeholder="First name"
                   /*         value={}*/
          /*                  onChange={e => setTitleReport(e.target.value)}*/
                        />

                        <InputComponent
                            type="text"
                            name="lastName"
                            placeholder="Last name"
                            /*         value={}*/
                            /*                  onChange={e => setTitleReport(e.target.value)}*/
                        />

                        <Datepicker
                            placeholder="Select date"
                            touchUi={false}
                            inputStyle={"outline selectorData" as any}
                            cssClass="selectorD"
                        />

                        <InputComponent
                            type="text"
                            name="adress"
                            placeholder="Adress"
                            /*         value={}*/
                            /*                  onChange={e => setTitleReport(e.target.value)}*/
                        />

                        <Selects>
                            <Select
             /*                   data={[{ text: t('Data'), value: '', disabled: true }, ...dataAgency]}*/
                                inputStyle={"outline selectorData" as any}
                                touchUi={false}
                                dropdown={false}
                                labelStyle="stacked"
                                placeholder={t("Post")}
                         /*       onChange={(event) => {
                                    const selectedValue = event.value;
                                    const selectedIndex = dataAgency.findIndex(item => item === selectedValue);
                                    setIndex(selectedIndex);
                                    setData(selectedValue);
                                }}*/
                                cssClass="selectorD"
                            />
                        </Selects>
                    </Elements>
                    <Submit>
                        <input type="submit" value={t("Add")}/>
                    </Submit>
                </Form>

                <InnerDiv>
                    <Input
                        inputStyle={"outline inputComponent1" as any}
                        type="text"
                        name="titleReport"
                        placeholder="First name"
          /*              onChange={(e: {
                            target: { value: React.SetStateAction<string>; };
                        }) => setTitleReport(e.target.value)}
                        disabled={index === null}*/
                    />
                    <Select
                      /*  data={[{ text: t('Data'), value: '', disabled: true }, ...dataAgency]}*/
                        inputStyle={"outline inputComponent2" as any}
                        touchUi={false}
                        dropdown={false}
                        placeholder="Select Data..."
                /*        onChange={(event) => {
                            const selectedValue = event.value;
                            const selectedIndex = dataAgency.findIndex(item => item === selectedValue);
                            setIndex(selectedIndex);
                            setData(selectedValue);
                        }}*/
                        cssClass="selectorD"
                    />
                    <Select
                /*        data={[{ text: t('Co-Writers'), value: '', disabled: true },...admins.map(admin => removeAccents(admin))]}*/
                        inputStyle={"outline inputComponent3" as any}
                        touchUi={false}
                        dropdown={false}
                        placeholder="Select Co-Writers..."
                        selectMultiple={true}
                        labelStyle="stacked"
                        cssClass="selectorD"
                      /*  onChange={(event) => setSelectedCoWriters(event.value)}*/
                    />
                    <Submit>
                        <input type="submit" value={t("Add")}/>
                    </Submit>
                </InnerDiv>

                <Personnel>
                    {personnel.map((person, index) => (
                        <Component key={index}>
                            <Top>
                                <Name>
                                    <p> {person.firstName} </p>
                                    <p> {person.lastName.toUpperCase()} </p>
                                </Name>
                                <div>
                                    <Post role={person.namePost}> {person.namePost} </Post>
                                </div>
                            </Top>


                            <Info>
                                <p> Start Date : {person.startDate} </p>
                                <div>
                                    <span>Verification Code : </span>
                                    <span
                                        style={{
                                            color: '#0f0e17',
                                            backgroundColor: '#0f0e17',
                                            borderRadius: '5px',
                                            cursor: 'pointer',
                                            transition: 'background-color 0.15s ease-in-out'
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.backgroundColor = '#f9f9f9'
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.backgroundColor = '#0f0e17'
                                        }}
                                    >
                                    {person.verificationCode}
                                </span>
                                </div>
                            </Info>
                        </Component>
                    ))}
                </Personnel>
                {/*    {role === 'technician' && (
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
                                            console.log(gasType)
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
                                        {text: 'Sector 1', value: 1},
                                        {text: 'Sector 2', value: 2},
                                        {text: 'Sector 3', value: 3},
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
                )}

                {role === 'writer' && (
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

                {role === 'writer' && (
                    <InnerDiv>
                        <Input
                            inputStyle={"outline inputComponent1" as any}
                            type="text"
                            name="titleReport"
                            placeholder={index === null ? t("Need to select Data...") : t("Enter") + " " + dataGas[index] + " " + t("Report")}
                            onChange={(e: {
                                target: { value: React.SetStateAction<string>; };
                            }) => setTitleReport(e.target.value)}
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
                                const selectedIndex = dataAgency.findIndex(item => item === selectedValue);
                                setIndex(selectedIndex);
                                setData(selectedValue);
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
                        <Submit>
                            <input type="submit" value={t("Add")}/>
                        </Submit>
                    </InnerDiv>
                )}

                {role === 'technician' && (
                    <form onSubmit={handleSubmit}>
                        <InnerDiv>
                            <Input
                                value={address}
                                inputStyle={"outline inputComponent1" as any}
                                type="text"
                                name="titleReport"
                                placeholder="Address"
                                onChange={(e: {
                                    target: { value: React.SetStateAction<string>; };
                                }) => setAddress(e.target.value)}
                            />
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
                                inputStyle={"outline inputComponent2" as any}
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
                                inputStyle={"outline inputComponent3" as any}
                                placeholder="Sector"
                                dropdown={false}
                                cssClass="selectorD"
                                onChange={(event) => setSector(event.value)}
                            />
                            <Submit>
                                <input type="submit" value={t("Add")}/>
                            </Submit>
                        </InnerDiv>
                    </form>
                )}

                {<Success className={isVisible ? 'fadeOut' : ''}>{successMessage}</Success>}


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
                </Reports>*/}
            </Container>
        </>
    );
}

const renderApp = () => {
    const root = document.getElementById("management");
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

    .inputComponent1,
    .inputComponent2,
    .inputComponent3 {
        width: 25rem !important;

        @media (max-width: 450px) {
            width: 89vw !important;
        }
    }

    .inputComponent1 {
        border-bottom: none !important;
        border-radius: 7px 7px 0 0 !important;
    }

    .inputComponent2 {
        border-bottom: none !important;
        border-radius: 0 !important;
    }

    .inputComponent3 {
        border-radius: 0 0 7px 7px !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
    }

    .selector,
    .selectorData {
        display: block !important;
        border-radius: 7px !important;
        background-color: #fffffe !important;
        font-size: 1rem !important;
        color: #020204 !important;
        max-height: 10rem !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;

        :hover {
            cursor: pointer;
        }
    }

    .selector {
        max-width: 10rem !important;
    }

    .selectorData {
        width: 7rem !important;
        height: 2.9rem !important;
        max-width: 7rem !important;
    }

    .mbsc-ios.mbsc-textfield-wrapper-box,
    .mbsc-ios.mbsc-textfield-wrapper-outline {
        margin: 0;
    }

    @keyframes fadeOut {
        0% { opacity: 0; }
        5% { opacity: 1}
        60% { opacity: 1; }
        100% { opacity: 0; }
    }

    .fadeOut {
        animation-name: fadeOut;
        animation-duration: 5s;
        animation-fill-mode: forwards;
    }
`;

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

const Personnel = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    margin: 30px;
    font-family: 'FoundersGrotesk-Regular', sans-serif;

    @media (max-width: 1360px) {
        justify-content: center;
        align-items: center;
        flex-direction: column;
        margin: 25px;
    }

    @media (max-width: 374px) {
        align-items: center;
        flex-direction: column;
        margin: 20px;
    }

    @media (max-width: 290px) {
        align-items: center;
        flex-direction: column;
        margin: 18px;
    }
`;

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


const Top = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    @media (max-width: 374px) {
        flex-direction: column-reverse;
        gap: 10px;
    }
`;

const Name = styled.div`
    display: flex;
    gap: 5px;
    font-family: 'FoundersGrotesk-Medium', sans-serif;
    font-size: 1.1rem;
`;

const Info = styled.div`
    display: flex;
    flex-direction: column;
    gap: 5px;
    font-size: 1rem;
`;

const Component = styled.div`
    background-color: #f9f9f9;
    border: #dcdcdc 1.5px solid;
    border-radius: 10px;

    padding: 15px;
    width: 650px;
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    @media (max-width: 450px) {
        width: 88.5vw;
    }

    @media (max-width: 374px) {
        width: 87vw;
    }
`;

const Post = styled.div<{ role: string }>`
    display: inline-flex;
    padding: 7px 15px;
    padding-top: 6px;
    border-radius: 7px ;
    border: 1.5px solid ${props => props.role === 'technician' ? '#1679AB' : props.role === 'writer' ? '#C73659' : '#0f0e17'};
    background-color: ${props => props.role === 'technician' ? 'rgba(22,121,171,0.07)' : props.role === 'writer' ? 'rgba(199,54,89,0.07)' : '#0f0e17'};
    color: ${props => props.role === 'technician' ? '#1679AB' : props.role === 'writer' ? '#C73659' : '#0f0e17'};
    font-size: .9rem;
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

const InputComponent = styled.input`
    padding: 1rem;
    height: 2.9rem;
    border: 1.5px solid #dcdcdc;
    border-radius: 7px;
    margin: 0;
    width: 8rem;
    font-size: 1rem;
    font-family: 'FoundersGrotesk-Regular', sans-serif;
    color: #0f0e17;

    @media (max-width: 640px) {
        width: 15vw;
    }

    @media (max-width: 1000px) {
        width: 15vw;
    }

    ::placeholder {
        color: #a7a9be;
    }

    &:focus {
        outline: none;
        font-size: 1rem;
    }
`;

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