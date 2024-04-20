import React, { useState, useLayoutEffect, useRef, useEffect, useCallback } from 'react';
import ReactDOM from "react-dom/client";
import '../../css/app.css';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import styled from 'styled-components';

const App: React.FC = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        const browserLang = navigator.language.split('-')[0];
        i18n.changeLanguage(browserLang);
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    password: password,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(data.access_token)
            localStorage.setItem('access_token', data.access_token);
            window.location.href = data.redirect_url;
        } catch (error) {
            console.error('An error occurred while logging in:', error);
        }
    }

    return (
        <Container>
            <a href="/">
                <AllTitle>
                    <Title>AIR DATA HUB</Title>
                    <Title2>{t('FROM DATA-X')}</Title2>
                </AllTitle>
            </a>

            <Form onSubmit={handleSubmit}>
                <Value>
                    <Label>
                        Email
                    </Label>
                    <Input type="text" value={email} onChange={e => setEmail(e.target.value)}/>
                </Value>
                <Value>
                    <Label>
                        Password
                    </Label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                </Value>
                <SignUp type="submit" value="Log in"/>
                <Login>
                    <label>
                        Don't have an account?&nbsp;
                    </label>
                    <Link href="/signup">Sign up</Link>
                </Login>

            </Form>
        </Container>
    );
}

const renderApp = () => {
    const root = document.getElementById("login");
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
    flex-direction: column;
    position: absolute;
    z-index: 1;
`

const Title = styled.h1`
    font-size: 2.5rem;
    font-family: "Montserrat", sans-serif;
    font-weight: 800;
    color: #0b0b19;
    padding-left: 30px;
    padding-top: 30px;
    white-space: nowrap;

    @media (max-width: 450px) {
        font-size: 7vw;
    }
`

const Title2 = styled.h2`
    font-size: 1rem;
    font-family: "Montserrat", sans-serif;
    font-weight: 500;
    color: #0b0b19;
    padding-left: 30px;

    @media (max-width: 450px) {
        font-size: 3vw;
    }
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
    padding: 0.5rem;
    border: 1px solid #8e8e8e;
    border-radius: 7px;
    width: 16rem;
    font-family: 'Aileron-Regular', sans-serif;
`

const SignUp = styled.input`
    margins: 1rem;
    padding: 0.5rem;
    border: none;
    border-radius: 7px;
    width: 16rem;
    font-family: 'Aileron-Regular', sans-serif;
    transition: background-color 0.3s, color 0.3s;

    &:hover {
        cursor: pointer;
        outline: none;
        background-color: rgb(11, 11, 25);
        color: #eeeeee;
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
`


document.addEventListener('DOMContentLoaded', renderApp);
