<?php

use Illuminate\Support\Facades\Route;

// This app is an API-only backend consumed by the separate React frontend
// (see /frontend). The public site lives at the root domain; this service
// answers at api.<domain> — see docs/ARCHITECTURE.md.
Route::get('/', function () {
    return response()->json([
        'service' => 'portofolio-api',
        'docs' => 'See /api/health and docs/ARCHITECTURE.md in the repo.',
    ]);
});
