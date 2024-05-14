<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ManagementController extends Controller
{
    public function getPersonnel(Request $request) {
        if ($request->user()) {
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;
            $report = DB::select("
                SELECT Personnel.firstName, Personnel.lastName, Personnel.startDate, Posts.namePost, Personnel.verificationCode
                FROM Personnel
                    INNER JOIN Posts
                        ON Personnel.idPost = Posts.idPost
                WHERE idAgence=(
                    SELECT idAgence
                    FROM Personnel
                    WHERE firstName= :firstName AND lastName= :lastName
                ) AND NOT (Personnel.firstName = :firstName2 AND Personnel.lastName = :lastName2);
                ", ['firstName' => $firstName, 'lastName' => $lastName, 'firstName2' => $firstName, 'lastName2' => $lastName]);
            return response()->json($report);
        } else {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    public function addPersonnel(Request $request) {
        if ($request->user()) {
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;
            $idAgence = DB::select("
                SELECT idAgence
                FROM Personnel
                WHERE firstName= :firstName AND lastName= :lastName
                ", ['firstName' => $firstName, 'lastName' => $lastName]);
            $idAgence = $idAgence[0]->idAgence;
            $request->validate([
                'firstName' => 'required|string',
                'lastName' => 'required|string',
                'birthDate' => 'required|date',
                'address' => 'required|string',
                'startDate' => 'required|date',
                'idPost' => 'required|integer',
            ]);
            $firstNameV = $request->firstName;
            $lastNameV = $request->lastName;
            $startDate = $request->startDate;
            $idPost = $request->idPost;
            $adress = $request->address;
            $birthDate = $request->birthDate;

            $result = DB::insert("
                INSERT INTO Personnel(firstName, lastName, birthDate, adress, startDate, idPost, idAgence, verificationCode)
                VALUES (:firstName, :lastName, :birthDate , :address, :startDate, :idPost, :idAgence, FLOOR(100000 + RAND() * 900000) )
                ", ['firstName' => $firstNameV, 'lastName' => $lastNameV, 'birthDate' => $birthDate, 'address' => $adress, 'startDate' => $startDate, 'idPost' => $idPost, 'idAgence' => $idAgence]);
            return response()->json(['message' => 'Personnel added']);
        } else {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    public function getSensorsAgency(Request $request) {
        if ($request->user()) {
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;
            $report = DB::select("
                SELECT Sensors.latSensor, Sensors.longSensor, Gases.nameGas, Sensors.idSensor
                FROM Sensors
                INNER JOIN Personnel ON Sensors.idPersonnel = Personnel.idPersonnel
                INNER JOIN Gases ON Sensors.idGas = Gases.idGas
                WHERE idAgence = (SELECT idAgence FROM Personnel WHERE Personnel.firstName = :firstName AND Personnel.lastName = :lastName)
                ORDER BY Sensors.idSensor DESC;
            ", ['lastName' => $lastName, 'firstName' => $firstName]);
            return response()->json($report);
        } else {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    public function getPosts(Request $request) {
        if ($request->user()) {
            $posts = DB::select("
                SELECT namePost
                FROM Posts
            ");
            return response()->json($posts);
        } else {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }


}
