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
                    "Wastewater Treatment": "Wastewater Treatment",
                    "Waste Management": "Waste Management",
                    "Transport": "Transport",
                    "Mining Sector": "Mining Sector",
                    "Manufacturing Industry": "Manufacturing Industry",
                    "Energy Production": "Energy Production",
                    "Building and Construction": "Building and Construction",
                    "Agriculture": "Agriculture",
                    "Sectors": "Sectors",
                    "Methane": "Methane",
                    "Non-Bio Carbon Dioxide": "Non-Bio Carbon Dioxide",
                    "Bio Carbon Dioxide": "Bio Carbon Dioxide",
                    "Hydrofluorocarbons": "Hydrofluorocarbons",
                    "Nitrous Oxide": "Nitrous Oxide",
                    "Ammonia": "Ammonia",
                    "Perfluorocarbons": "Perfluorocarbons",
                    "Sulfur Hexafluoride": "Sulfur Hexafluoride",
                    "PPM Value for": "PPM Value for",
                    "Verification Code": "Verification Code",
                    "Start Date": "Start Date",
                    "technician": "technician",
                    "writer": "writer",
                    "Post": "Post",
                    "Birth Date": "Birth Date",
                    "Writer": "Writer",
                    "Technician": "Technician",
                    "Manager": "Manager",
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
                    "Wastewater Treatment": "Traitement des eaux usees",
                    "Waste Management": "Gestion des dechets",
                    "Transport": "Transport",
                    "Mining Sector": "Secteur minier",
                    "Manufacturing Industry": "Industrie manufacturiere",
                    "Energy Production": "Production d'energie",
                    "Building and Construction": "Batiment et construction",
                    "Agriculture": "Agriculture",
                    "Sectors": "Secteurs",
                    "Methane": "Methane",
                    "Non-Bio Carbon Dioxide": "Dioxyde de carbone non biologique",
                    "Bio Carbon Dioxide": "Dioxyde de carbone biologique",
                    "Hydrofluorocarbons": "Hydrofluorocarbures",
                    "Nitrous Oxide": "Protoxyde d'azote",
                    "Ammonia": "Ammoniac",
                    "Perfluorocarbons": "Perfluorocarbures",
                    "Sulfur Hexafluoride": "Hexafluorure de soufre",
                    "PPM Value for": "Valeur PPM pour",
                    "Verification Code": "Code de verification",
                    "Start Date": "Date de debut",
                    "technician": "technicien",
                    "writer": "redacteur",
                    "Post": "Poste",
                    "Birth Date": "Date de naissance",
                    "Writer": "Redacteur",
                    "Technician": "Technicien",
                    "Manager": "Manager",
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
