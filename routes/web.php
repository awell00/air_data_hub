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
        select Sensors.longSensor, Sensors.latSensor, Gases.nameGas, Gases.formulaGas, Personnel.firstName, Personnel.lastName, Sensors.idSensor, Agences.longAgence, Agences.latAgence
        from Sensors
        inner join Gases on Sensors.idGas = Gases.idGas
        inner join Personnel on Sensors.idPersonnel = Personnel.idPersonnel
        inner join Agences on Personnel.idAgence = Agences.idAgence
        where Sensors.idSensor = :id;
    ', ['id' => $id]);

    $values = DB::select('
        select Data.ppmValue, Reports.titleReport, Reports.dateReport, Data.dateData
        from Data
        inner join Contain on Data.idData = Contain.idData
        inner join Reports on Contain.idReport = Reports.idReport
        where Data.idSensor = :id;
    ', ['id' => $id]);
    return view('sensor', ['sensor' => $sensor[0], 'values' => $values]);
});
