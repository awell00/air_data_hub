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
    isFirstNameValid?: boolean;
    isLastNameValid?: boolean;
};

const SignupRequestBodySchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  password: z.string(),
  role: z.enum(['admin', 'user']),
});

const App: React.FC = () => {

    // User related state variables
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isAdmin, setIsAdmin] = useState('user');
    const [isFormComplete, setFormComplete] = useState(false);
    const [isFirstNameValid, setFirstNameValid] = useState(true);
    const [isLastNameValid, setLastNameValid] = useState(true);

    // Translation related state variables
    const { t } = useTranslation();

    // UI related state variables
    const [title, setTitle] = useState("AIR DATA HUB");

    // Import Functions
    useLanguage();

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

    // This function handles the form submission
    const handleSubmit = async (event: React.FormEvent) => {
        // Prevent the default form submission behavior
        event.preventDefault();

        // Check if the email belongs to an admin user
        const role = email === import.meta.env.VITE_ADMIN_EMAIL ? 'admin' : 'user';
        console.log(role === 'admin' ? "Admin user" : "Regular user");

        // Set the user role in the state
        setIsAdmin(role);

        try {
            // Prepare the request body
            const requestBody = {
                firstName,
                lastName,
                email,
                password,
                role
            };

            const parsedBody = SignupRequestBodySchema.parse(requestBody);

            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(parsedBody),
            });

            const data = await response.json();

            // If the request is successful, redirect the user to the login page
            if (response.ok) {
                setFirstNameValid(true);
                setLastNameValid(true);
                window.location.href = '/login';
            } else {
                if(data.errors.personnel) {
                    setFirstNameValid(false);
                    setLastNameValid(false);
                }
            }
        } catch (error) {
            const err = error as Error;
            console.error('Error:', error);
        }
    }

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
                    <Title>{title}</Title>
                </Nav>
            </a>

            <Form onSubmit={handleSubmit}>
                <Name>
                    <Value>
                        <Label>
                            {t("First Name")}
                        </Label>
                        <InputName type="text" value={firstName} onChange={e => { setFirstName(e.target.value); setFirstNameValid(true);}} isFirstNameValid={isFirstNameValid} />
                    </Value>
                    <Value>
                        <Label>
                            {t("Last Name")}
                        </Label>
                        <InputName type="text" value={lastName} onChange={e => { setLastName(e.target.value); setLastNameValid(true); }} isLastNameValid={isLastNameValid} />
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
                        {t("Password")}
                    </Label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                </Value>

                <SignUpButtton isFormComplete={isFormComplete}>
                    <input type="submit" value={t("Sign up")} />
                </SignUpButtton>
                <Login>
                    <label>
                        {t("Already have an account?")}
                    </label>
                    <Link href="/login">{t("Log in")}</Link>
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
    background-color: #fff;
`

const Name = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 25rem;
    margin-bottom: 1rem;

    @media (max-width: 450px) {
        width: 89vw;
    }
`;

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
    color: #0f0e17;
    font-size: 1rem;
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
    border: ${props => props.isFirstNameValid === false || props.isLastNameValid === false ? '1.5px solid #f25f4c' : '1.5px solid #dcdcdc'};
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


const InputName = styled(Input)`
    width: 12rem;

    @media (max-width: 450px) {
        width: 43vw;
    }
`;

// Button Components
const SignUpButtton = styled.div<{ isFormComplete: boolean }>`
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
const Login = styled.div`
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
    transition: color 0.2s;

    &:hover {
        font-weight: bold;
    }
`;
