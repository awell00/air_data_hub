import React, { useState, useLayoutEffect, useRef, useEffect, useCallback } from 'react';
import ReactDOM from "react-dom/client";
import '../../css/app.css';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';
import styled from 'styled-components';

interface User {
    name: string;
    // Include other properties of the user object here
}

const App: React.FC = () => {

    const [user, setUser] = useState<User | null>(null);

    const handleLogout = () => {
        // Remove the access token from local storage
        localStorage.removeItem('access_token');
        window.location.reload();
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
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
                console.log(data)
                setUser(data);
            } catch (error) {
                console.error('Fetch failed:', error);
            }
        };

        fetchUser();
    }, []);

    return (
        <div>
            {user ? (
                <p>Welcome, {user.name}!</p>
            ) : (
                <p>Loading...</p>
            )}

            <button onClick={handleLogout}>Logout</button>
        </div>
    );
}

const renderApp = () => {
    const root = document.getElementById("info");
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
