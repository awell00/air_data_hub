<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function getInfo(Request $request)
    {
        if ($request->user()) {
            $fullName = $request->user()->firstName . ' ' . $request->user()->lastName;
            return response()->json(['name' => $fullName]);
        } else {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    public function getReport(Request $request) {
        if ($request->user()) {
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;
            $report = DB::select('
                SELECT Reports.titleReport, Reports.dateReport
                FROM Reports
                    INNER JOIN Do ON Reports.idReport = Do.idReport
                    INNER JOIN Personnel ON Do.idPersonnel = Personnel.idPersonnel
                WHERE Personnel.lastName = :lastName AND Personnel.firstName = :firstName;
            ', ['lastName' => $lastName, 'firstName' => $firstName]);
            return response()->json($report);
        } else {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    public function getSensors(Request $request) {
        if ($request->user()) {
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;
            $report = DB::select("
                SELECT Sensors.latSensor, Sensors.longSensor, Gases.nameGas
                FROM Sensors
                    INNER JOIN Gases ON Sensors.idGas = Gases.idGas
                    INNER JOIN Personnel ON Sensors.idPersonnel = Personnel.idPersonnel
                WHERE Personnel.lastName = :lastName AND Personnel.firstName = :firstName;
            ", ['lastName' => $lastName, 'firstName' => $firstName]);
            return response()->json($report);
        } else {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    public function getDataInSameAgency(Request $request) {
        if ($request->user()) {
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;
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
                    WHERE firstName = :firstName AND lastName = :lastName
                ) AND Reports.idReport IS NULL;
            ", ['firstName' => $firstName, 'lastName' => $lastName]);
            return response()->json($report);
        } else {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    public function addSensor(Request $request) {
        if ($request->user()) {
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

            if ($formulaGas === "CO2nb") {
                $formulaGas = "CO2 non bio";
            } else if ($formulaGas === "") {
                $formulaGas = "CO2 bio";
            }

            $idGas = DB::select("
                SELECT idGas FROM Gases WHERE formulaGas = :formulaGas
            ", ['formulaGas' => $formulaGas]);

            $idGas = $idGas[0]->idGas;

            DB::insert("
                INSERT INTO Sensors(latSensor, longSensor, idGas, idSector, idPersonnel)
                VALUES (:latSensor, :longSensor, :idGas, :idSector,
                (SELECT idPersonnel FROM Personnel WHERE firstName = :firstName AND lastName = :lastName))
            ", ['latSensor' => $latSensor, 'longSensor' => $longSensor, 'idGas' => $idGas, 'idSector' => $idSector, 'firstName' => $firstName, 'lastName' => $lastName]);

            $newSensor = DB::select("
                SELECT Sensors.latSensor, Sensors.longSensor, Gases.nameGas
                FROM Sensors
                    INNER JOIN Gases ON Sensors.idGas = Gases.idGas
                    INNER JOIN Personnel ON Sensors.idPersonnel = Personnel.idPersonnel
                WHERE Personnel.lastName = :lastName AND Personnel.firstName = :firstName
                ORDER BY Sensors.idSensor DESC
                LIMIT 1
            ", ['lastName' => $lastName, 'firstName' => $firstName]);

            return response()->json(['message' => 'Sensor added successfully', 'newSensor' => $newSensor[0]]);
        } else {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

}


