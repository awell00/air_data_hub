<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Models\User;

use App\Http\Controllers\GazController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\ManagementController;

Route::group(['middleware' => 'App\Http\Middleware\CheckApiToken'], function () {
    Route::get('/gasTypes', [GazController::class, 'gasTypes']);
    Route::get('/gaz', [GazController::class, 'getGazData']);
    Route::get('/numberOfSensors', [GazController::class, 'numberOfSensors']);
});

Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::post('/signup', [AuthController::class, 'signup']);

Route::group(['middleware' => ['auth:api', 'App\Http\Middleware\IsAdmin:admin']], function () {
    Route::post('/add-role', [AdminController::class, 'addRole']);
});

Route::group(['middleware' => ['auth:api', 'App\Http\Middleware\isManager:manager']], function () {
    Route::get('/personnel', [ManagementController::class, 'getPersonnel']);
    Route::post('/add-personnel', [ManagementController::class, 'addPersonnel']);
});

Route::group(['middleware' => 'auth:api'], function () {
    Route::get('/info', [UserController::class, 'getInfo']);
    Route::get('/report', [UserController::class, 'getReport']);
    Route::get('/sensors', [UserController::class, 'getSensors']);
    Route::post('/add-sensor', [UserController::class, 'addSensor']);
    Route::get('/data-in-agency', [UserController::class, 'getDataInSameAgency']);
    Route::get('/writers-in-agency', [UserController::class, 'getWritersInSameAgency']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
});
