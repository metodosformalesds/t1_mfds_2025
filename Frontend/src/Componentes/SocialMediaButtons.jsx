import React from 'react';
import { motion } from "framer-motion";

// --- CONFIGURACIÓN DE COGNITO ---
const COGNITO_DOMAIN = 'https://us-east-11ugkx5pdk.auth.us-east-1.amazoncognito.com'; 
const CLIENT_ID = '2p7dqbgfdm35u054lp5dld9d9m';
const REDIRECT_URI = 'https://frontend.d34s9corpodswj.amplifyapp.com/';
const SCOPES = 'openid%20profile%20email'; 

const FACEBOOK_PROVIDER = 'Facebook'; 
const GOOGLE_PROVIDER = 'Google'; 

const createProviderUrl = (providerName) => {
    return `${COGNITO_DOMAIN}/oauth2/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${SCOPES}&redirect_uri=${REDIRECT_URI}&identity_provider=${providerName}`;
};

const itemVariants = {
    hidden: { 
        opacity: 0, 
        y: 20 
    },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.5,
            ease: "easeOut"
        }
    }
};

const SocialLoginButtons = () => {
    return (
        <motion.div 
            className="space-y-3"
            variants={itemVariants}
        >
            {/* Botón de Google */}
            <motion.a 
                href={createProviderUrl(GOOGLE_PROVIDER)}
                className="flex w-full items-center justify-center border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition duration-150"
                whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.98 }}
            >
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.21z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continua con Google
            </motion.a>

            {/* Botón de Facebook */}
            <motion.a 
                href={createProviderUrl(FACEBOOK_PROVIDER)}
                className="flex w-full items-center justify-center border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition duration-150"
                whileHover={{ y: -2, boxShadow: "0 5px 15px rgba(0,0,0,0.1)" }}
                whileTap={{ scale: 0.98 }}
            >
                <svg className="mr-2 h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036c-2.648 0-2.924 1.611-2.924 4.055v2.056h3.984l-.599 3.667h-3.385L15.425 24C12.8 24 9.101 24 9.101 23.691Z"/>
                </svg>
                Continua con Facebook
            </motion.a>
        </motion.div>
    );
};

export default SocialLoginButtons;