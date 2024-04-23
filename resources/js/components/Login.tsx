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
    const [isFormComplete, setFormComplete] = useState(false);
    const [title, setTitle] = useState("AIR DATA HUB");

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

    useEffect(() => {
        if (email !== '' && password !== '') {
            setFormComplete(true);
        } else {
            setFormComplete(false);
        }
    }, [email, password]);

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 450) {
                setTitle("ADH");
            } else {
                setTitle("AIR DATA HUB");
            }
        };

        window.addEventListener('resize', handleResize);
        handleResize(); // Call the function initially to set the title based on the initial window size

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return (
        <Container>
            <a href="/">
                <AllTitle>
                    <Title >{title}</Title>
                </AllTitle>
            </a>

            <Form onSubmit={handleSubmit}>
                <Value>
                    <Label>
                        Email
                    </Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)}/>
                </Value>
                <Value>
                    <Label>
                        {t("Password")}
                    </Label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                </Value>
                <LoginButton isFormComplete={isFormComplete}>
                    <input type="submit" value={t("Log in")} />
                </LoginButton>
                <Signup>
                    <label>
                        {t("Don't have an account?")}
                    </label>
                    <Link href="/signup">{t("Sign up")}</Link>
                </Signup>

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
    justify-content: space-between;

    width: 100%;
    position: absolute;
    z-index: 1;
    padding: 30px;
`

const Title = styled.h1`
    font-size: 1.2rem;
    margin-top: 8px;
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

const LoginButton = styled.div<{ isFormComplete: boolean }>`
    input {
        margins: 1rem;
        padding: 1rem;
        border: none;
        border-radius: 7px;
        width: 25rem;
        background-color: ${props => props.isFormComplete ? 'rgb(11, 11, 25)' : 'rgb(218, 218, 218)'};
        color: ${props => props.isFormComplete ? '#eeeeee' : '#0b0b19'};
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
    }
`;

const Signup = styled.div`
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
