<?php

// Namespace declaration
namespace App\Http\Controllers;

// Importing necessary classes
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// GazController class extending the base Controller class
class GazController extends Controller
{
    // Method to get gas data
    public function getGazData()
    {
        // Execute a complex SQL query to get the gas data
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

        // Return the gas data as a JSON response
        return response()->json($gaz);
    }

    // Method to get gas types
    public function gasTypes()
    {
        // Execute a SQL query to get all gas types
        $gaz = DB::select('SELECT * FROM Gases');

        // Return the gas types as a JSON response
        return response()->json($gaz);
    }

    // Method to get the number of sensors
    public function numberOfSensors()
    {
        // Execute a SQL query to count the number of sensors
        $sensors = DB::select('SELECT COUNT(*) as count FROM Sensors');

        // Return the number of sensors as a JSON response
        return response()->json($sensors);
    }

    // Method to get sectors
    public function getSectors(Request $request) {
        // Execute a SQL query to get all sectors
        $sectors = DB::select("SELECT * FROM ActivitySectors;");

        // Return the sectors as a JSON response
        return response()->json($sectors);
    }
}
