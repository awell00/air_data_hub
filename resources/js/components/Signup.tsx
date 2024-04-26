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

            // If the request is successful, redirect the user to the login page
            if (response.ok) {
                window.location.href = '/login';
            } else {
                console.error('Error:', response.statusText);
            }
        } catch (error) {
            // Log any error that occurs during the fetch operation
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
                        <InputName type="text" value={firstName} onChange={e => setFirstName(e.target.value)}/>
                    </Value>
                    <Value>
                        <Label>
                            {t("Last Name")}
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
    width: 100%;
    position: absolute;
    z-index: 1;
    padding: 30px;
`;

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
const Login = styled.div`
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
