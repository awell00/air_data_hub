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

type InputProps = {
    isEmailValid?: boolean;
    isPasswordValid?: boolean;
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
    const [isEmailValid, setEmailValid] = useState<boolean>(true);
    const [isPasswordValid, setPasswordValid] = useState<boolean>(true);

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

            setEmailValid(true);
            setPasswordValid(true);

            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(parsedBody),
            });

            const data = await response.json();

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}, message: ${data.message}`;

                // Check if the error is related to the email or password
                if (data.errors && data.errors.email) {
                    errorMessage += ', email: ' + data.errors.email[0];
                    setEmailValid(false);
                }
                if (data.errors && data.errors.password) {
                    errorMessage += ', password: ' + data.errors.password[0];
                    setPasswordValid(false);
                }

                throw new Error(errorMessage);
            } else {
                setEmailValid(true);
                setPasswordValid(true);
                localStorage.setItem('access_token', data.access_token);
                window.location.href = data.redirect_url;
            }

        } catch (error) {
            const err = error as Error;

            console.error('An error occurred while logging in:', err);
        }
    };

    // Form Input Component
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
                    <Input type="email" value={email} onChange={e => {setEmail(e.target.value); setEmailValid(true);}} isEmailValid={isEmailValid}/>
                </Value>
                <Value>
                    <Label>
                        {t("Password")}
                    </Label>
                    <Input type="password" value={password} onChange={e => {setPassword(e.target.value); setPasswordValid(true);}} isPasswordValid={isPasswordValid}/>
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
    overflow: hidden;
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
    align-items: center;
    width: 100%;
    padding: 20px 30px;
    position: fixed;
    top: 0;
    background-color: #fffffe;
`

// Text Components
const Title = styled.h1`
    font-family: "FoundersGrotesk-Bold", sans-serif;
    color: #0f0e17;
    font-size: 1.4rem;
    margin-top: 8px;
    white-space: nowrap;
`;

const Label = styled.label`
    font-family: 'FoundersGrotesk-Medium', sans-serif;
    font-size: 1rem;
    color: #0f0e17;
`;

// Input Components
const Value = styled.div`
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
`;

const Input = styled.input<InputProps>`
    margin-top: 0.5rem;
    padding: 1rem;
    border: ${props => props.isEmailValid === false || props.isPasswordValid === false ? '1.5px solid #f25f4c' : '1.5px solid #dcdcdc'};
    border-radius: 7px;
    width: 25rem;
    font-size: 1rem;
    font-family: 'FoundersGrotesk-Regular', sans-serif;

    @media (max-width: 450px) {
        width: 89vw;
    }

    &:focus {
        outline: none;
        font-size: 1rem;
    }
`;

// Button Components
const LoginButton = styled.div<{ isFormComplete: boolean }>`
    input {
        margin: 1rem;
        padding: 1rem;
        border-radius: 7px;
        width: 25rem;
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

        @media (max-width: 450px) {
            width: 89vw;
        }
    }
`;

// Link Components
const Signup = styled.div`
    font-family: 'FoundersGrotesk-Regular', sans-serif;
    color: #0f0e17;
    font-size: 0.9rem;
    margin-top: 1rem;
`;

const Link = styled.a`
    color: #0f0e17;
    margin-left: 0.5rem;
    font-family: 'FoundersGrotesk-Regular', sans-serif;
    font-size: 0.9rem;
    transition: font-weight 0.2s;

    &:hover {
        font-weight: bold;
    }
`;

