<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('public');
});

Route::get('/login', function () {
    return view('login');
});

Route::get('/signup', function () {
    return view('signup');
});

Route::get('/info', function () {
    return view('info');
});

Route::get('/management', function () {
    return view('management');
});

Route::get('/sensor/{id}', function ($id) {

    $sensor = DB::select('
        select Sensors.longSensor, Sensors.latSensor, Gases.nameGas, Personnel.firstName, Personnel.lastName
        from Sensors
        inner join Gases on Sensors.idGas = Gases.idGas
        inner join Personnel on Sensors.idPersonnel = Personnel.idPersonnel
        where Sensors.idSensor = :id;
    ', ['id' => $id]);
    return view('sensor', ['sensor' => $sensor[0]]);
});
