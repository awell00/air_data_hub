import React, { useState, useLayoutEffect, useRef, useEffect, useCallback } from 'react';
import ReactDOM from "react-dom/client";
import '../../css/app.css';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import styled from 'styled-components';

const App: React.FC = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [isAdmin, setIsAdmin] = useState(('user'));

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
                    name: username,
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
        <div>
            <form onSubmit={handleSubmit}>
                <label>
                    Email:
                    <input type="text" value={email} onChange={e => setEmail(e.target.value)}/>
                </label>
                <label>
                    Username:
                    <input type="text" value={username} onChange={e => setUsername(e.target.value)}/>
                </label>
                <label>
                    Password:
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)}/>
                </label>
                <input type="submit" value="Log in"/>
                <a href="/login">Log in</a>
            </form>
        </div>
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

const Container = styled.div`
    position: relative;
    background: rgba(11, 11, 25);
    height: 100vh;
`

document.addEventListener('DOMContentLoaded', renderApp);
