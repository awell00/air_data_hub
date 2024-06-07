<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    // Method to get user information
    public function getInfo(Request $request)
    {
        // Check if the user is authenticated
        if ($request->user()) {
            // Get the user's full name and role
            $fullName = $request->user()->firstName . ' ' . strtoupper($request->user()->lastName);
            $role = $request->user()->role;

            // Execute a SQL query to get the agency's longitude and latitude
            $agency = DB::select('
                SELECT Agences.longAgence, Agences.latAgence
                FROM Personnel
                    INNER JOIN Agences ON Personnel.idAgence = Agences.idAgence
                WHERE Personnel.firstName = :firstName AND Personnel.lastName = :lastName;
            ', ['firstName' => $request->user()->firstName, 'lastName' => $request->user()->lastName]);

            // Return the user's information as a JSON response
            return response()->json(['name' => $fullName, 'role' => $role, 'latAgency' => $agency[0]->latAgence, 'longAgency' => $agency[0]->longAgence]);
        } else {
            // If the user is not authenticated, return an error response
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    // Method to get the report
    public function getReport(Request $request) {
        // Check if the user is authenticated
        if ($request->user()) {
            // Get the user's first and last name
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;

            // Execute a SQL query to get the report
            $report = DB::select('
                SELECT Reports.titleReport, Reports.dateReport
                FROM Reports
                    INNER JOIN Do ON Reports.idReport = Do.idReport
                    INNER JOIN Personnel ON Do.idPersonnel = Personnel.idPersonnel
                WHERE Personnel.lastName = :lastName AND Personnel.firstName = :firstName;
            ', ['lastName' => $lastName, 'firstName' => $firstName]);

            // Return the report as a JSON response
            return response()->json($report);
        } else {
            // If the user is not authenticated, return an error response
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    // Method to get the sensors
    public function getSensors(Request $request) {
        // Check if the user is authenticated
        if ($request->user()) {
            // Get the user's first and last name
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;

            // Execute a SQL query to get the sensors
            $report = DB::select("
                SELECT Sensors.latSensor, Sensors.longSensor, Gases.nameGas, Sensors.idSensor
                FROM Sensors
                    INNER JOIN Gases ON Sensors.idGas = Gases.idGas
                    INNER JOIN Personnel ON Sensors.idPersonnel = Personnel.idPersonnel
                WHERE Personnel.lastName = :lastName AND Personnel.firstName = :firstName
                ORDER BY Sensors.idSensor DESC;
            ", ['lastName' => $lastName, 'firstName' => $firstName]);

            // Return the sensors as a JSON response
            return response()->json($report);
        } else {
            // If the user is not authenticated, return an error response
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    // Method to get data in the same agency
    public function getDataInSameAgency(Request $request) {
        // Check if the user is authenticated
        if ($request->user()) {
            // Get the user's first and last name and personnel id
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;
            $idPersonnel = $request->user()->personnel_id;

            // Execute a SQL query to get the data
            $report = DB::select("
                SELECT Data.dateData, Data.ppmValue, Sensors.latSensor, Sensors.longSensor, Sensors.idSensor, Gases.formulaGas
                FROM Data
                    INNER JOIN Sensors on Data.idSensor = Sensors.idSensor
                    INNER JOIN Personnel on Sensors.idPersonnel = Personnel.idPersonnel
                    INNER JOIN Agences on Personnel.idAgence = Agences.idAgence
                    LEFT JOIN Contain on Data.idData = Contain.idData
                    LEFT JOIN Reports on Contain.idReport = Reports.idReport
                    INNER JOIN Gases on Sensors.idGas = Gases.idGas
                WHERE Agences.idAgence = (
                    SELECT idAgence
                    FROM Personnel
                    WHERE firstName = :firstName AND lastName = :lastName AND idPersonnel = :idPersonnel
                ) AND Reports.idReport IS NULL;
            ", ['firstName' => $firstName, 'lastName' => $lastName, 'idPersonnel' => $idPersonnel]);

            // Return the data as a JSON response
            return response()->json($report);
        } else {
            // If the user is not authenticated, return an error response
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    // Method to add a sensor
    public function addSensor(Request $request) {
        // Check if the user is authenticated
        if ($request->user()) {
            // Get the user's first and last name and the sensor's details
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;
            $latSensor = $request->input('latSensor');
            $longSensor = $request->input('longSensor');
            $formulaGas = $request->input('formulaGas');
            $idSector = $request->input('idSector');

            // Check if the user's idPost is 2
            $personnel = DB::select("
                SELECT idPost FROM Personnel WHERE firstName = :firstName AND lastName = :lastName
            ", ['firstName' => $firstName, 'lastName' => $lastName]);

            if ($personnel[0]->idPost != 2) {
                return response()->json(['message' => 'Cannot insert. The idPost of the Personnel is not 2.'], 400);
            }

            // Convert the formulaGas to the correct format
            if ($formulaGas === "CO2nb") {
                $formulaGas = "CO2 non bio";
            } else if ($formulaGas === "") {
                $formulaGas = "CO2 bio";
            }

            // Execute a SQL query to get the idGas
            $idGas = DB::select("
                SELECT idGas FROM Gases WHERE formulaGas = :formulaGas
            ", ['formulaGas' => $formulaGas]);

            $idGas = $idGas[0]->idGas;

            // Execute a SQL query to insert the new sensor
            DB::insert("
                INSERT INTO Sensors(latSensor, longSensor, idGas, idSector, idPersonnel)
                VALUES (:latSensor, :longSensor, :idGas, :idSector,
                (SELECT idPersonnel FROM Personnel WHERE firstName = :firstName AND lastName = :lastName))
            ", ['latSensor' => $latSensor, 'longSensor' => $longSensor, 'idGas' => $idGas, 'idSector' => $idSector, 'firstName' => $firstName, 'lastName' => $lastName]);

            // Execute a SQL query to get the new sensor
            $newSensor = DB::select("
                SELECT Sensors.latSensor, Sensors.longSensor, Gases.nameGas
                FROM Sensors
                    INNER JOIN Gases ON Sensors.idGas = Gases.idGas
                    INNER JOIN Personnel ON Sensors.idPersonnel = Personnel.idPersonnel
                WHERE Personnel.lastName = :lastName AND Personnel.firstName = :firstName
                ORDER BY Sensors.idSensor DESC
                LIMIT 1
            ", ['lastName' => $lastName, 'firstName' => $firstName]);

            // Return a success message and the new sensor as a JSON response
            return response()->json(['message' => 'Sensor added successfully', 'newSensor' => $newSensor[0]]);
        } else {
            // If the user is not authenticated, return an error response
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    // Method to get writers in the same agency
    public function getWritersInSameAgency(Request $request) {
        // Check if the user is authenticated
        if ($request->user()) {
            // Get the user's first and last name and personnel id
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;
            $idPersonnel = $request->user()->personnel_id;

            // Execute a SQL query to get the writers
            $admins = DB::select("
                SELECT Personnel.firstName, Personnel.lastName
                FROM Personnel
                    INNER JOIN Agences ON Personnel.idAgence = Agences.idAgence
                WHERE Personnel.idPost = 3
                  AND Agences.idAgence = (
                    SELECT idAgence
                    FROM Personnel
                    WHERE firstName = :firstName1 AND lastName = :lastName1 AND idPersonnel = :idPersonnel
                )
                  AND NOT (Personnel.firstName = :firstName2 AND Personnel.lastName = :lastName2);
            ", ['firstName1' => $firstName, 'lastName1' => $lastName, 'firstName2' => $firstName, 'lastName2' => $lastName, 'idPersonnel' => $idPersonnel]);

            // Return the writers as a JSON response
            return response()->json($admins);
        } else {
            // If the user is not authenticated, return an error response
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    // Method to get the report sensor
    public function getReportSensor(Request $request) {
        // Get the idSensor from the route
        $idSensor = $request->route('idSensor');

        // Execute a SQL query to get the report
        $report = DB::select("
               select Reports.titleReport, Reports.dateReport, Personnel.firstName, Personnel.lastName, Contain.idReport
                from Reports
                         INNER JOIN Contain ON Reports.idReport = Contain.idReport
                        INNER  JOIN Data ON Contain.idData = Data.idData
                        INNER  JOIN Do ON Reports.idReport = Do.idReport
                        INNER JOIN Personnel ON Do.idPersonnel = Personnel.idPersonnel
                where Data.idSensor = :id;
            ", ['id' => $idSensor]);

        // Return the report as a JSON response
        return response()->json($report);
    }
}


