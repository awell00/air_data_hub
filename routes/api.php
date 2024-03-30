<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/example', function () {
    return response()->json([
        'test' => 'John Doe',
        'email' => 'john@example.com'
    ]);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
