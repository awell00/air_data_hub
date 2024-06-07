<?php

// Define a configuration array for admin settings
return [
    // Get the admin email from the environment variables
    'email' => env('VITE_ADMIN_EMAIL'),

    // Get the admin verification setting from the environment variables
    'verification' => env('VITE_ADMIN_VERIFICATION'),

    // Get the API token from the environment variables
    'token' => env('VITE_API_TOKEN')
];
