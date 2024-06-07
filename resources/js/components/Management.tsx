// Third-party libraries
import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import styled, { createGlobalStyle } from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Select, Input, setOptions, localeFr, Datepicker, MbscDatepickerChangeEvent } from '@mobiscroll/react';

// CSS imports
import '@mobiscroll/react/dist/css/mobiscroll.min.css';

// Local modules
import { Navigation } from '../utils/Nav';

// Libraries for mapping
import Radar from 'radar-sdk-js';

// Zod for validation
import { z } from 'zod';

// types.ts
export type GasType = 'NH3' | 'CO2b' | 'PFC' | 'CO2nb' | 'CH4' | 'HFC' | 'N2O' | 'SF6';

// interfaces.ts
export interface User {
    name: string;
    cityAgency: string;
}

export interface Report {
    title: string;
    date: string;
}

export interface Sensor {
    id: any;
    name: string;
    city: string;
}

export interface Personnel {
    firstName: string;
    lastName: string;
    startDate: string;
    namePost: string;
    verificationCode: number | string;
}

setOptions({
    locale: localeFr,
    theme: 'ios',
    themeVariant: 'light'
});

// Initialization API
Radar.initialize(import.meta.env.VITE_RADAR);

const App: React.FC = () => {
    // User related state variables
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState("");
    const access_token = localStorage.getItem('access_token');

    // Report and sensor state variables
    const [reports, setReports] = useState<Report[]>([]);
    const [sensors, setSensors] = useState<Sensor[]>([]);

    // Personnel state variables
    const [personnel, setPersonnel] = useState<Personnel[]>([]);

    // Form input state variables
    const [address, setAddress] = useState("");
    const [formulaGas, setFormulaGas] = useState("");
    const [sector, setSector] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [birthDate, setBirthDate] = useState("");
    const [idPost, setIdPost] = useState<number>();
    const [postValues, setPostValues] = useState([]);

    // Translation hook
    const { t } = useTranslation();

    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1; // getMonth() returns month from 0 to 11
    let day = today.getDate();

    let formattedMonth = month < 10 ? '0' + month : month.toString();
    let formattedDay = day < 10 ? '0' + day : day.toString();

    let startDate = `${year}-${formattedMonth}-${formattedDay}`;

    const [dayB, monthB, yearB] = birthDate.split("/");
    const sqlDate = `${yearB}-${monthB}-${dayB}`;

    const resetForm = () => {
        setAddress("");
        setFormulaGas("");
        setSector("");
    };

    useEffect(() => {
        const fetchUser = async () => {
            // Retrieve access token from local storage
            const access_token = localStorage.getItem('access_token');

            // If no access token, redirect to login page
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

            // If response is not ok, throw an error
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse the response data
            const data = await response.json();

            let city = '';

            try {
                // Reverse geocode the latitude and longitude to get city
                const result = await Radar.reverseGeocode({ latitude: data.latAgency, longitude: data.longAgency });
                const { addresses } = result;
                city = addresses[0]?.city || '';
            } catch (err) {
                console.error(err);
            }

            // Create user object
            const user = {
                name: data.name,
                cityAgency: city.toUpperCase(),
            };

            // Set user and role state
            setUser(user);
            setRole(data.role);
        };

        // Call fetchUser function
        fetchUser();
    }, []);

    useEffect(() => {
        const fetchUser = async () => {
            // Retrieve access token from local storage
            const access_token = localStorage.getItem('access_token');

            // If no access token, redirect to login page
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

            const personnelValue = data.map((item: { firstName: string; lastName: string, startDate: string, namePost: string, verificationCode: number}) => {
                return {
                    firstName: item.firstName,
                    lastName: item.lastName.toUpperCase(),
                    startDate: item.startDate,
                    namePost: item.namePost,
                    verificationCode: item.verificationCode
                };
            });

            // Set personnel state
            setPersonnel(personnelValue);
        };

        fetchUser();
    }, []);

    // Fetching reports data
    useEffect(() => {
        const fetchReports = async () => {
            // Retrieve access token from local storage
            const access_token = localStorage.getItem('access_token');

            // If no access token, redirect to login page
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

            // If response is not ok, throw an error
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Map the data to create reports objects
            const reportsValue = data.map((item: { titleReport: string; dateReport: string }) => ({ title: item.titleReport, date: item.dateReport }));

            // Set reports state
            setReports(reportsValue);
        };

        // Call fetchReports function
        fetchReports();
    }, []);

    // Fetching posts data
    useEffect(() => {
        const fetchPosts = async () => {
            // Retrieve access token from local storage
            const access_token = localStorage.getItem('access_token');

            const response = await fetch('/api/posts', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Map the data to create posts objects
            const postV = data.map((item: {namePost: string}) => {
                return item.namePost.charAt(0).toUpperCase() + item.namePost.slice(1);
            });

            // Set postValues state
            setPostValues(postV);
        }

        // Call fetchPosts function
        fetchPosts();
    }, []);

   // Function to fetch sensor data
    const fetchSensors = async () => {
        // Retrieve access token from local storage
        const access_token = localStorage.getItem('access_token');

        // If no access token, redirect to login page
        if (!access_token) {
            window.location.href = '/login';
            return;
        }

        const response = await fetch('/api/sensors-in-agency', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${access_token}`,
            },
        });

        // If response is not ok, throw an error
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the response data
        const data = await response.json();

        // Iterate over each sensor data
        for (const item of data) {
            let city = '';

            try {
                // Reverse geocode the latitude and longitude to get city
                const result = await Radar.reverseGeocode({ latitude: item.latSensor, longitude: item.longSensor });
                const { addresses } = result;
                let formattedAddress = addresses[0]?.formattedAddress || '';
                let addressParts = formattedAddress.split(',');
                if (addressParts.length >= 2) {
                    city = addressParts[0].trim() + ' | ' + addressParts[1].trim();
                } else {
                    city = formattedAddress;
                }
            } catch (err) {
                // Handle any errors
                console.error(err);
            }

            // Update the sensors state as soon as a sensor gets its address
            setSensors(prevSensors => [...prevSensors, { name: item.nameGas, city: city, id : item.idSensor }]);
        }
    };

    useEffect(() => {
        fetchSensors();
    }, []);

    // Function to handle form submission
    const handleSubmit = async (event: { preventDefault: () => void; }) => {
        // Prevent the form from being submitted in the default way, which would cause a page reload
        event.preventDefault();

        // Make a POST request to the '/api/add-personnel' endpoint
        const response = await fetch('/api/add-personnel', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`,
            },
            body: JSON.stringify({
                firstName: firstName,
                lastName: lastName,
                birthDate: sqlDate,
                address: address,
                idPost: idPost,
                startDate: startDate
            })
        });

        // If the response is not ok, throw an error
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        // Parse the response data
        const data = await response.json();

        // If the personnel was added successfully, reset the form and reload the page
        if (data.message === "Personnel added") {
            resetForm();
            window.location.reload();
        }

    };

    return (
        <>
            <GlobalStyles />
            <Container>
                <Navigation/>

                <UserInfo>
                    {user ? (
                        <><Title>{user.name}</Title><City>{user.cityAgency}</City></>
                    ) : (
                        <p>Loading...</p>
                    )}
                </UserInfo>

                <Form onSubmit={handleSubmit}>
                    <Elements>
                        <InputComponent
                            type="text"
                            name="firstName"
                            placeholder={t("First Name")}
                            onChange={e => setFirstName(e.target.value)}
                        />

                        <InputComponent
                            type="text"
                            name="lastName"
                            placeholder={t("Last Name")}
                            onChange={e => setLastName(e.target.value)}
                        />

                        <Datepicker
                            placeholder={t("Birth Date")}
                            touchUi={false}
                            inputStyle={"outline selectorData" as any}
                            cssClass="selectorD"
                            onChange={(args: MbscDatepickerChangeEvent) => {
                                if (args.valueText !== undefined) {
                                    setBirthDate(args.valueText);
                                }
                            }}
                        />

                        <InputComponent
                            type="text"
                            name="address"
                            placeholder={t("Address")}
                            onChange={e => setAddress(e.target.value)}
                        />

                        <Selects>
                            <Select
                                data={[
                                    {text: t('Posts'), value: '', disabled: true},
                                    ...postValues.map((post, index) => {
                                        let displayValue = t(post);
                                        // @ts-ignore
                                        let isDisabled = post.toLowerCase() === 'manager';
                                        return {text: displayValue, value: index + 1, disabled: isDisabled};
                                    })
                                ]}
                                inputStyle={"outline selectorData" as any}
                                touchUi={false}
                                dropdown={false}
                                labelStyle="stacked"
                                placeholder={t("Post")}
                                onChange={(event) => {
                                    const selectedValue = event.value;
                                    setIdPost(selectedValue);
                                }}
                                cssClass="selectorD"
                            />
                        </Selects>
                    </Elements>
                    <Submit>
                        <input type="submit" value={t("Add")}/>
                    </Submit>
                </Form>

                <form onSubmit={handleSubmit}>
                    <InnerDiv>
                        <Input
                            inputStyle={"outline inputComponent1" as any}
                            type="text"
                            placeholder={t("First Name")}
                            onChange={(e: {
                                target: { value: React.SetStateAction<string>; };
                            }) => setFirstName(e.target.value)}
                        />
                        <Input
                            inputStyle={"outline inputComponent2" as any}
                            type="text"
                            placeholder={t("Last Name")}
                            onChange={(e: {
                                target: { value: React.SetStateAction<string>; };
                            }) => setLastName(e.target.value)}
                        />
                        <Input
                            inputStyle={"outline inputComponent2" as any}
                            type="text"
                            placeholder="Address"
                            onChange={(e: {
                                target: { value: React.SetStateAction<string>; };
                            }) => setAddress(e.target.value)}
                        />
                        <Datepicker
                            placeholder={t("Birth Date")}
                            touchUi={false}
                            inputStyle={"outline inputComponent2" as any}
                            cssClass="selectorD"
                            onChange={(args: MbscDatepickerChangeEvent) => {
                                if (args.valueText !== undefined) {
                                    setBirthDate(args.valueText);
                                }
                            }}
                        />
                        <Select
                            data={[
                                {text: t('Posts'), value: '', disabled: true},
                                ...postValues.map((post, index) => {
                                    let displayValue = t(post);
                                    // @ts-ignore
                                    let isDisabled = post.toLowerCase() === 'manager';
                                    return {text: displayValue, value: index + 1, disabled: isDisabled};
                                })
                            ]}
                            inputStyle={"outline inputComponent3" as any}
                            touchUi={false}
                            dropdown={false}
                            labelStyle="stacked"
                            placeholder={t("Post")}
                            onChange={(event) => {
                                const selectedValue = event.value;
                                setIdPost(selectedValue);
                            }}
                            cssClass="selectorD"
                        />
                        <Submit>
                            <input type="submit" value={t("Add")}/>
                        </Submit>
                    </InnerDiv>
                </form>
                    <Personnel>
                        {personnel.map((person, index) => (
                            <Component key={index}>
                                <Top>
                                    <Name>
                                        <p> {person.firstName} </p>
                                        <p> {person.lastName.toUpperCase()} </p>
                                    </Name>
                                    <div>
                                        <Post role={person.namePost}> {t(person.namePost)} </Post>
                                    </div>
                                </Top>


                                <Info>
                                    <p> {t("Start Date")} : {person.startDate} </p>
                                    <div>
                                        <span>{t("Verification Code")} : </span>
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

                    <Sensors>
                        {
                            sensors.map((sensor, index) => (
                                <ComponentSensor key={index}>
                                    <a href={`/sensor/${sensor.id}`} key={index} style={{textDecoration: 'none'}}>
                                        <TruncatedText>{sensor.city}</TruncatedText>
                                        <p>{t(sensor.name)}</p>
                                    </a>
                                </ComponentSensor>
                            ))
                        }
                    </Sensors>

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

const UserInfo = styled.div`
    margin: 110px 30px 30px;
    font-family: 'FoundersGrotesk-Medium', sans-serif;
`;

const Personnel = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    font-family: 'FoundersGrotesk-Regular', sans-serif;
    border-bottom: #f9f9f9 3px solid;

    @media (max-width: 900px) {
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    @media (min-width: 900px) {
        margin: 30px;
    }

    @media (max-width: 374px) {
        align-items: center;
        flex-direction: column;
    }

`;

const InnerDiv = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    display: none;

    @media (max-width: 820px) {
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
    width: 93vw;
    margin-bottom: 30px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    @media (min-width: 900px) {
        width: calc(53.5% - 60px);
    }

    @media (max-width: 450px) {
        width: 89vw;
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

    @media (max-width: 820px) {
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

const ComponentSensor = styled.div`
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

    @media (max-width: 450px) {
        width: 89vw;
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

const Sensors = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    /*width: 100%;*/
    margin: 30px;

    @media (min-width: 900px) {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: space-between;
    }
`

const Submit = styled.div`
    input {
        margin: 1rem 0;
        padding: .72rem 1.7rem;
        border-radius: 7px;
        border: #dcdcdc 1.5px solid;
        background-color: #f9f9f9;
        color: #0f0e17;
        font-family: 'FoundersGrotesk-Medium', sans-serif;
        transition: background-color 0.3s, color 0.3s;
        font-size: 1.1rem;

        &:hover {
            cursor: pointer;
            outline: none;
            background-color: #dcdcdc;
        }

        @media (max-width: 820px) {
            width: 25rem;
        }

        @media (max-width: 450px) {
            width: 89vw;
        }
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

