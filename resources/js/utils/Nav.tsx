import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useLanguage } from '../utils/Auth';
import { useTranslation } from 'react-i18next';

export const Navigation = () => {
    const [title, setTitle] = React.useState("AIR DATA HUB");
    const [redirection, setRedirection] = React.useState("");
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

    useEffect(() => {
        const fetchUser = async () => {
            const access_token = localStorage.getItem('access_token');
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

            if(access_token == null) {
                setRedirection("/login")
            } else {
                if (data.role === 'manager') {
                    setRedirection("/management");
                } else {
                    setRedirection("/info");
                }
            }
        };

        fetchUser();

    }, []);

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.reload();
    };

    const handleLogin = () => {
        window.location.href = "/login";
    };

    const handleProfile = () => {
        window.location.href = redirection;
    };

    const accessToken = localStorage.getItem('access_token');

    return (
        <Nav>
            <Redirection href="/">
                <Title>{title}</Title>
            </Redirection>
            {accessToken ? (
                /^\/sensor\/\d+$/.test(window.location.pathname) ? (
                    <Profile onClick={handleProfile}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M12 3C9.56586 3 7.59259 4.95716 7.59259 7.37143C7.59259 9.7857 9.56586 11.7429 12 11.7429C14.4341 11.7429 16.4074 9.7857 16.4074 7.37143C16.4074 4.95716 14.4341 3 12 3Z"
                                fill="#0F0E17"/>
                            <path
                                d="M14.601 13.6877C12.8779 13.4149 11.1221 13.4149 9.39904 13.6877L9.21435 13.7169C6.78647 14.1012 5 16.1783 5 18.6168C5 19.933 6.07576 21 7.40278 21H16.5972C17.9242 21 19 19.933 19 18.6168C19 16.1783 17.2135 14.1012 14.7857 13.7169L14.601 13.6877Z"
                                fill="#0F0E17"/>
                        </svg>
                    </Profile>
                ) : (
                    <LogoutButton onClick={handleLogout}>{t("Log out")}</LogoutButton>
                )
            ) : (
                <LogoutButton onClick={handleLogin}>{t("Log in")}</LogoutButton>
            )}
        </Nav>
    );
};

const Nav = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    border-bottom: #f9f9f9 2px solid;
    position: fixed;
    top: 0;
    background-color: #fffffe;
    z-index: 1000;

    @media (min-width: 450px) {
        padding: 20px 30px;
    }

    @media (max-width: 450px) {
        padding: 20px 20px;
    }
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

const Profile = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: #f9f9f9;
    border: #dcdcdc 1.5px solid;
    cursor: pointer;

    svg {
        width: 20px;
        height: 20px;
    }
`;
