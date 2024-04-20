<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GazController extends Controller
{
    public function getGazData()
    {
        $gaz = DB::select('
SELECT
    Data.ppmValue,
    Gases.formulaGas,
    Sensors.latSensor,
    Sensors.longSensor,
    Data.idSensor,
    MaxValues.max_ppmValue
FROM
    (
        SELECT idSensor,
               (SELECT ppmValue FROM Data WHERE idSensor = D.idSensor ORDER BY RAND() LIMIT 1) as ppmValue
        FROM Data as D
        GROUP BY idSensor
    ) as Data
        INNER JOIN Sensors ON Data.idSensor = Sensors.idSensor
        INNER JOIN Gases ON Sensors.idGas = Gases.idGas
        INNER JOIN (
        SELECT
            MAX(Data.ppmValue) as max_ppmValue,
            Gases.idGas
        FROM
            Data
                INNER JOIN Sensors ON Data.idSensor = Sensors.idSensor
                INNER JOIN Gases ON Sensors.idGas = Gases.idGas
        GROUP BY
            Gases.idGas
    ) as MaxValues ON Gases.idGas = MaxValues.idGas;');
        return response()->json($gaz);
    }

    public function gasTypes()
    {
        $gaz = DB::select('SELECT * FROM Gases');
        return response()->json($gaz);
    }
}
