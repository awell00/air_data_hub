<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;

Route::get('/example', function () {
    $properties = DB::select('SELECT * FROM properties');

    return response()->json($properties);
});

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
