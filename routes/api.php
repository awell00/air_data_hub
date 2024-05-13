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
    Route::get('/reports-in-sensor/{idSensor}', [UserController::class, 'getReportSensor']);
    Route::get('/sectors', [GazController::class, 'getSectors']);
});

Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::post('/signup', [AuthController::class, 'signup']);

Route::group(['middleware' => ['auth:api', 'App\Http\Middleware\IsAdmin:admin']], function () {
    Route::post('/add-role', [AdminController::class, 'addRole']);
});

Route::group(['middleware' => ['auth:api', 'App\Http\Middleware\isManager:manager']], function () {
    Route::get('/personnel', [ManagementController::class, 'getPersonnel']);
    Route::post('/add-personnel', [ManagementController::class, 'addPersonnel']);
    Route::get('/sensors-in-agency', [ManagementController::class, 'getSensorsAgency']);
});

Route::group(['middleware' => 'auth:api'], function () {
    Route::get('/info', [UserController::class, 'getInfo']);
    Route::get('/report', [UserController::class, 'getReport']);
    Route::post('/add-sensor', [UserController::class, 'addSensor']);
    Route::get('/sensors', [UserController::class, 'getSensors']);
    Route::get('/data-in-agency', [UserController::class, 'getDataInSameAgency']);
    Route::get('/writers-in-agency', [UserController::class, 'getWritersInSameAgency']);
});

Route::get('/user', function (Request $request) {
    return $request->user();
});
