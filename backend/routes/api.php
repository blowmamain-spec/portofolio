<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public API routes
|--------------------------------------------------------------------------
| Consumed by the React frontend. No auth required for read-only content.
| Resource controllers (Projects, BlogPosts, ...) land here in Phase 1-2
| of the learning roadmap — see docs/ROADMAP.md.
*/

Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'portofolio-api',
        'time' => now()->toIso8601String(),
    ]);
});

/*
|--------------------------------------------------------------------------
| Authenticated routes
|--------------------------------------------------------------------------
| Admin-only endpoints (create/update/delete content) will be added here
| behind auth:sanctum once Phase 3 (Auth & REST API) is implemented.
*/

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
