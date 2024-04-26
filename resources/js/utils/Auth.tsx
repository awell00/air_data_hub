// React related imports
import { useEffect } from 'react';

// Libraries for internationalization
import i18n from '../../../i18n';

export const useLanguage = () => {
    // This useEffect hook is used to set the language of the application based on the user's browser language.
    // It runs once when the component is mounted.
    useEffect(() => {
        try {
            // Get the language from the browser
            const browserLang = navigator.language.split('-')[0];
            // Change the language of the application to match the browser's language
            i18n.changeLanguage(browserLang)
                .then(() => console.log(`Language set to ${browserLang}`))
                .catch((error) => console.error(`Error setting language to ${browserLang}:`, error));
        } catch (error) {
            console.error('Error getting browser language:', error);
        }
    }, []);
}

