import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const browserLang = navigator.language.split('-')[0];

i18n
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: {
                    "Log in": "Log in",
                    "Search a City...": "Search a City...",
                    "Gases": "Gases",
                    "Password": "Password",
                    "Forgot your password?": "Forgot your password?",
                    "Don't have an account?": "Don't have an account?",
                    "Sign up": "Sign up",
                    "First Name": "First Name",
                    "Log out": "Log out",
                    "Welcome": "Welcome",
                    "Last Name": "Last Name",
                    "Already have an account ?": "Already have an account?",
                    "Add": "Add",
                    "Address": "Adress",
                    "Gas": "Gas",
                    "Sector": "Sector",
                    "Select data": "Select Date",
                    "Report": "Report",
                    "Enter": "Enter",
                    "Need to select data..." : "Need to select Data...",
                    "Data": "Data",
                    "Co-writerw": "Co-writer",
                    "Sensors": "Sensors",
                }
            },
            fr: {
                translation: {
                    "Log in": "Connexion",
                    "Search for a city...": "Rechercher une ville...",
                    "Gases": "Gaz",
                    "Password": "Mot de passe",
                    "Forgot your password?": "Mot de passe oublié?",
                    "Don't have an account?": "Vous n'avez pas de compte?",
                    "Sign up": "S'inscrire",
                    "Log out": "Deconnexion",
                    "First Name": "Prenom",
                    "Last Name": "Nom",
                    "Welcome": "Bienvenue",
                    "Already have an account?": "Vous avez déjà un compte?",
                    "Add": "Ajouter",
                    "Address": "Adresse",
                    "Gas": "Gaz",
                    "Sector": "Secteur",
                    "Select data": "Selectionner une date",
                    "Report": "Rapport",
                    "Enter": "Entrer",
                    "Need to select data..." : "Selectionner des donnees...",
                    "Data": "Donnees",
                    "Co-writers": "Co-auteurs",
                    "Sensors": "Capteurs",
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
