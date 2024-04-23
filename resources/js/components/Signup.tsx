import React, { useState, useLayoutEffect, useRef, useEffect, useCallback } from 'react';
import ReactDOM from "react-dom/client";
import '../../css/app.css';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import styled from 'styled-components';

const App: React.FC = () => {

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(('user'));
    const { t } = useTranslation();

    useEffect(() => {
        const browserLang = navigator.language.split('-')[0];
        i18n.changeLanguage(browserLang);
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        // Check if the email is for an admin user
        if (email === 'awellpro@gmail.com') {
            console.log("Admin user");
            setIsAdmin('admin');
        } else {
            console.log("Regular user");
            setIsAdmin('user');
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    password: password,
                    role: isAdmin,
                }),
            });

            window.location.href = '/login';

        } catch (error) {
            console.error('Error:', error);
        }
    }


    return (
        <Container>
            <a href="/">
                <AllTitle>
                    <Title>AIR DATA HUB</Title>
                </AllTitle>
            </a>

            <Form onSubmit={handleSubmit}>
                <Name>
                    <Value>
                        <Label>
                            First Name
                        </Label>
                        <InputName type="text" value={firstName} onChange={e => setFirstName(e.target.value)}/>
                    </Value>
                    <Value>
                        <Label>
                            Last Name
                        </Label>
                        <InputName type="text" value={lastName} onChange={e => setLastName(e.target.value)}/>
                    </Value>
                </Name>
                <Value>
                    <Label>
                        Email
                    </Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)}/>
                </Value>
                <Value>
                    <Label>
                        Password
                    </Label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                </Value>
                <SignUp type="submit" value="Sign up"/>
                <Login>
                    <label>
                        Already have an account ?
                    </label>
                    <Link href="/login">Log in</Link>
                </Login>

            </Form>
        </Container>
    );
}

const renderApp = () => {
    const root = document.getElementById("signup");
    if (root) {
        const rootContainer = ReactDOM.createRoot(root);
        rootContainer.render(
            <React.StrictMode>
                <App/>
            </React.StrictMode>
        );
    }
}

const AllTitle = styled.div`
    display: flex;
    justify-content: space-between;

    width: 100%;
    position: absolute;
    z-index: 1;
    padding: 30px;
`

const Name = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 25rem;
    margin-bottom: 1rem;

    @media (max-width: 450px) {
        width: 89vw;
    /*    flex-direction: column;*/
    }
`

const Title = styled.h1`
    font-size: 1.2rem;
    font-family: "Montserrat", sans-serif;
    font-weight: 800;
    color: #0b0b19;
    white-space: nowrap;
`

const Form = styled.form`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
`

const Value = styled.div`
    display: flex;
    margin-bottom: 1rem;
    flex-direction: column;
`

const Label = styled.label`
    font-family: 'Aileron-SemiBold', sans-serif;
    font-size: 0.9rem;
`

const Input = styled.input`
    margin-top: 0.5rem;
    padding: 1rem;
    border: 1px solid #8e8e8e;
    border-radius: 7px;
    width: 25rem;
    font-size: 0.9rem;
    font-family: 'Aileron-Regular', sans-serif;

    @media (max-width: 450px) {
        width: 89vw;
    }
`

const InputName = styled.input`
    margin-top: 0.5rem;
    padding: 1rem;
    border: 1px solid #8e8e8e;
    border-radius: 7px;
    width: 12rem;
    font-size: 1rem;
    font-family: 'Aileron-Regular', sans-serif;

    @media (max-width: 450px) {
        width: 43vw;
    }
`


const SignUp = styled.input`
    margins: 1rem;
    padding: 1rem;
    border: none;
    border-radius: 7px;
    width: 25rem;
    background-color: rgb(218, 218, 218);
    font-family: 'Aileron-Regular', sans-serif;
    transition: background-color 0.3s, color 0.3s;
    font-size: 1rem;

    &:hover {
        cursor: pointer;
        outline: none;
        background-color: rgb(11, 11, 25);
        color: #eeeeee;
    }

    @media (max-width: 450px) {
        width: 89vw;
    }
`

const Login = styled.div`
    font-family: 'Aileron-Regular', sans-serif;
    font-size: 0.8rem;
    margin-top: 1rem;

`

const Link = styled.a`
    color: rgb(11, 11, 25);
    margin-left: 0.5rem;
    font-family: 'Aileron-Regular', sans-serif;
    font-size: 0.8rem;
    transition: color 0.2s;

    &:hover {
        font-weight: bold;
    }
`

const Container = styled.div`
    position: relative;
    height: 100vh;
    overflow: hidden;
`

document.addEventListener('DOMContentLoaded', renderApp);
