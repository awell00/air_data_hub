import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../utils/Auth';
import { useTranslation } from 'react-i18next';

const Nav = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 20px 30px;
    border-bottom: #f9f9f9 2px solid;
    position: fixed;
    top: 0;
    background-color: #fffffe;
    z-index: 1000;
`

const Title = styled.h1`
    font-family: "FoundersGrotesk-Bold", sans-serif;
    color: #0f0e17;
    font-size: 1.4rem;
    white-space: nowrap;
`;

const LogoutButton = styled.button`
    padding: 10px 20px;
    background-color: #f9f9f9;
    color: #0f0e17;
    border: #dcdcdc 1.5px solid;
    font-family: 'FoundersGrotesk-Medium', sans-serif;
    border-radius: 20px;
    font-size: 1rem;
    cursor: pointer;
    text-decoration: none;

    transition: background 0.3s, color 0.3s;

    &:hover {
        cursor: pointer;
        background: #dcdcdc;
        color: #0f0e17;
    }
`

const Redirection = styled.a`
    text-decoration: none;
`;

export const Navigation = () => {
    const [title, setTitle] = React.useState("AIR DATA HUB");
    const { t } = useTranslation();

    useLanguage();

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

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.reload();
    };

    const handleLogin = () => {
        window.location.href = "/login";
    };

    const accessToken = localStorage.getItem('access_token');

    return (
        <Nav>
            <Redirection href="/">
                <Title>{title}</Title>
            </Redirection>
            {accessToken ? (
                <LogoutButton onClick={handleLogout}>{t("Log out")}</LogoutButton>
            ) : (
                <LogoutButton onClick={handleLogin}>{t("Log in")}</LogoutButton>
            )}
        </Nav>
    );
};
