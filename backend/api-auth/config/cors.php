<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'login', 'logout'], // Ajoutez ici les chemins nécessaires
    'allowed_methods' => ['*'], // Autorisez toutes les méthodes (GET, POST, etc.)
    'allowed_origins' => ['http://localhost:4200'], // Origine de votre app Angular
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'], // Tous les headers
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => true, // Si vous utilisez des cookies/session
];
