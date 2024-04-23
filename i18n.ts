import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const browserLang = navigator.language.split('-')[0];

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    "FROM DATA-X": "FROM DATA-X",
                    "Log in": "Log in",
                    "Search a City...": "Search a City...",
                    "Gases": "Gases",
                }
            },
            fr: {
                translation: {
                    "FROM DATA-X": "PAR DATA-X",
                    "Log in": "Connexion",
                    "Search for a city...": "Rechercher une ville...",
                    "Gases": "Gaz",
                }
            }
        },
        lng: browserLang,
        fallbackLng: "en",
        interpolation: {
            escapeValue: false
        }
    });

export default i18n;
