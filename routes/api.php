<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Models\User;

use App\Http\Controllers\GazController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;

Route::group(['middleware' => 'App\Http\Middleware\CheckApiToken'], function () {
    Route::get('/gasTypes', [GazController::class, 'gasTypes']);
    Route::get('/gaz', [GazController::class, 'getGazData']);
});

Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::post('/signup', [AuthController::class, 'signup']);

Route::group(['middleware' => ['auth:api', 'App\Http\Middleware\IsAdmin:admin']], function () {
    Route::post('/add-role', [AdminController::class, 'addRole']);
});

Route::group(['middleware' => 'auth:api'], function () {
    Route::get('/info', [UserController::class, 'getInfo']);
    Route::get('/report', [UserController::class, 'getReport']);
    Route::get('/sensors', [UserController::class, 'getSensors']);
    Route::post('/add-sensor', [UserController::class, 'addSensor']);
    Route::get('/data-in-agency', [UserController::class, 'getDataInSameAgency']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
});
