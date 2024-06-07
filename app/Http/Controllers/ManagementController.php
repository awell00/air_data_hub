<?php

// Namespace declaration
namespace App\Http\Controllers;

// Importing necessary classes
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

// ManagementController class extending the base Controller class
class ManagementController extends Controller
{
    // Method to get personnel
    public function getPersonnel(Request $request) {
        // Check if the user is authenticated
        if ($request->user()) {
            // Get the user's first and last name
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;

            // Execute a SQL query to get the personnel report
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

            // Return the report as a JSON response
            return response()->json($report);
        } else {
            // If the user is not authenticated, return an error response
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    // Method to add personnel
    public function addPersonnel(Request $request) {
        // Check if the user is authenticated
        if ($request->user()) {
            // Get the user's first and last name
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;

            // Execute a SQL query to get the agency id
            $idAgence = DB::select("
                SELECT idAgence
                FROM Personnel
                WHERE firstName= :firstName AND lastName= :lastName
                ", ['firstName' => $firstName, 'lastName' => $lastName]);
            $idAgence = $idAgence[0]->idAgence;

            // Validate the incoming request
            $request->validate([
                'firstName' => 'required|string',
                'lastName' => 'required|string',
                'birthDate' => 'required|date',
                'address' => 'required|string',
                'startDate' => 'required|date',
                'idPost' => 'required|integer',
            ]);

            // Get the request data
            $firstNameV = $request->firstName;
            $lastNameV = $request->lastName;
            $startDate = $request->startDate;
            $idPost = $request->idPost;
            $adress = $request->address;
            $birthDate = $request->birthDate;

            // Execute a SQL query to insert the new personnel
            $result = DB::insert("
                INSERT INTO Personnel(firstName, lastName, birthDate, adress, startDate, idPost, idAgence, verificationCode)
                VALUES (:firstName, :lastName, :birthDate , :address, :startDate, :idPost, :idAgence, FLOOR(100000 + RAND() * 900000) )
                ", ['firstName' => $firstNameV, 'lastName' => $lastNameV, 'birthDate' => $birthDate, 'address' => $adress, 'startDate' => $startDate, 'idPost' => $idPost, 'idAgence' => $idAgence]);

            // Return a success message as a JSON response
            return response()->json(['message' => 'Personnel added']);
        } else {
            // If the user is not authenticated, return an error response
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    // Method to get sensors agency
    public function getSensorsAgency(Request $request) {
        // Check if the user is authenticated
        if ($request->user()) {
            // Get the user's first and last name
            $firstName = $request->user()->firstName;
            $lastName = $request->user()->lastName;

            // Execute a SQL query to get the sensors report
            $report = DB::select("
                SELECT Sensors.latSensor, Sensors.longSensor, Gases.nameGas, Sensors.idSensor
                FROM Sensors
                INNER JOIN Personnel ON Sensors.idPersonnel = Personnel.idPersonnel
                INNER JOIN Gases ON Sensors.idGas = Gases.idGas
                WHERE idAgence = (SELECT idAgence FROM Personnel WHERE Personnel.firstName = :firstName AND Personnel.lastName = :lastName)
                ORDER BY Sensors.idSensor DESC;
            ", ['lastName' => $lastName, 'firstName' => $firstName]);

            // Return the report as a JSON response
            return response()->json($report);
        } else {
            // If the user is not authenticated, return an error response
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }

    // Method to get posts
    public function getPosts(Request $request) {
        // Check if the user is authenticated
        if ($request->user()) {
            // Execute a SQL query to get all posts
            $posts = DB::select("
                SELECT namePost
                FROM Posts
            ");

            // Return the posts as a JSON response
            return response()->json($posts);
        } else {
            // If the user is not authenticated, return an error response
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }
}
