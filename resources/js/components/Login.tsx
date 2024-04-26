// React related imports
import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

// Libraries for data validation
import { z } from 'zod';

// Internationalization
import { useLanguage } from '../utils/Auth';

// Relative imports
import '../../css/app.css';

// Types and interfaces
type FormInputProps = {
    label: string;
    type: string;
    value: string;
    setValue: (value: string) => void;
};

const LoginRequestBodySchema = z.object({
    email: z.string().email(),
    password: z.string(),
});

const App: React.FC = () => {

    // User related state variables
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isFormComplete, setFormComplete] = useState(false);

    // Translation related state variables
    const { t } = useTranslation();

    // UI related state variables
    const [title, setTitle] = useState("AIR DATA HUB");

    // Import Functions
    useLanguage();

    // This useEffect hook is used to check if both the email and password fields are filled out.
    useEffect(() => {
        if (email && password) {
            setFormComplete(true);
        }
        else {
            setFormComplete(false);
        }
    }, [email, password]);

    // This useEffect hook is used to handle the window resize event.
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

    const handleSubmit = async (event: React.FormEvent) => {
        // Prevent the default form submission behavior
        event.preventDefault();

        try {
            const requestBody = {
                email,
                password,
            };

            const parsedBody = LoginRequestBodySchema.parse(requestBody);

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(parsedBody),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // If the request is successful, redirect the user to the login page
            if (response.ok) {
                localStorage.setItem('access_token', data.access_token);
                window.location.href = data.redirect_url;
            } else {
                console.error('Error:', response.statusText);
            }

        } catch (error) {
            // Log any error that occurs during the fetch operation
            console.error('An error occurred while logging in:', error);
        }
    };

    // Form Input Component
    const FormInput: React.FC<FormInputProps> = ({ label, type, value, setValue }) => (
        <Value>
            <Label>{label}</Label>
            <Input type={type} value={value} onChange={({ target: { value } }) => setValue(value)} />
        </Value>
    );

    return (
        <Container>
            <a href="/">
                <Nav>
                    <Title >{title}</Title>
                </Nav>
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

document.addEventListener('DOMContentLoaded', renderApp);

// Layout Components
const Container = styled.div`
    position: relative;
    height: 100vh;
`;

const Form = styled.form`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100vh;
`;

const Nav = styled.div`
    display: flex;
    justify-content: space-between;
    width: 100%;
    position: absolute;
    z-index: 1;
    padding: 30px;
`;

// Text Components
const Title = styled.h1`
    font-family: "Montserrat", sans-serif;
    font-weight: 800;
    color: #0b0b19;
    font-size: 1.2rem;
    margin-top: 8px;
    white-space: nowrap;
`;

const Label = styled.label`
    font-family: 'Aileron-SemiBold', sans-serif;
    font-size: 0.9rem;
`;

// Input Components
const Value = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
`;

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
`;

// Button Components
const LoginButton = styled.div<{ isFormComplete: boolean }>`
    input {
        margin: 1rem;
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

// Link Components
const Signup = styled.div`
    font-family: 'Aileron-Regular', sans-serif;
    font-size: 0.8rem;
    margin-top: 1rem;
`;

const Link = styled.a`
    color: rgb(11, 11, 25);
    margin-left: 0.5rem;
    font-family: 'Aileron-Regular', sans-serif;
    font-size: 0.8rem;
    transition: color 0.2s;

    &:hover {
        font-weight: bold;
    }
`;

