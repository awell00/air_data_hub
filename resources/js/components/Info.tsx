import React, { useState, useEffect } from 'react';
import ReactDOM from "react-dom/client";
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import i18n from '../../../i18n';

interface User {
    name: string;
}

const App: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);
    const { t } = useTranslation();

    useEffect(() => {
        const browserLang = navigator.language.split('-')[0];
        i18n.changeLanguage(browserLang);
    }, []);


    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.reload();
    };

    useEffect(() => {
        const fetchUser = async () => {
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
            setUser(data);
        };

        fetchUser();
    }, []);

    return (
        <Container>
            <a href="/">
                <AllTitle>
                    <Title>AIR DATA HUB</Title>
                    <Title2>{t('FROM DATA-X')}</Title2>
                </AllTitle>
            </a>

            <UserInfo>
                {user ? (
                    <p>Welcome, {user.name}!</p>
                ) : (
                    <p>Loading...</p>
                )}
            </UserInfo>

            <LogoutButton onClick={handleLogout}>Logout</LogoutButton>
        </Container>
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

const AllTitle = styled.div`
    display: flex;
    flex-direction: column;
    position: absolute;
    z-index: 1;
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

const Container = styled.div`
    position: relative;
    height: 100vh;
    overflow: hidden;
`

const UserInfo = styled.div`
    font-size: 1.5rem;
    margin-bottom: 2rem;
    font-family: 'Montserrat', sans-serif;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
`;

const LogoutButton = styled.button`
    padding: 1rem;
    border: none;
    border-radius: 7px;
    background-color: rgb(218, 218, 218);
    color: #0b0b19;
    font-family: 'Aileron-Regular', sans-serif;
    transition: background-color 0.3s, color 0.3s;
    font-size: 1rem;
    position: fixed; // Added to make the button stay in a fixed position
    top: 30px; // Added to position the button at the bottom of the viewport
    right: 30px; // Added to position the button at the right of the viewport

    &:hover {
        cursor: pointer;
        outline: none;
        background-color: rgb(11, 11, 25);
        color: #eeeeee;
    }
`;
