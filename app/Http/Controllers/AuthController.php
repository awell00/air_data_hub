<?php

// Namespace declaration
namespace App\Http\Controllers;

// Importing necessary classes
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

// AuthController class extending the base Controller class
class AuthController extends Controller
{
    // Method to log in a user
    public function login(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'email' => 'email|required',
            'password' => 'required'
        ]);

        // Find the user with the given email
        $user = User::where('email', $request->email)->first();

        // If the user does not exist, return an error response
        if (!$user) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'email' => [
                        'Email does not exist'
                    ],
                ]
            ], 422);
        }

        // If the provided password does not match the user's password, return an error response
        if (!Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'password' => [
                        'Invalid password'
                    ],
                ]
            ], 422);
        }

        // Create an auth token for the user
        $authToken = $user->createToken('auth-token')->accessToken;

        // Return a response with the auth token, the user's role, and a redirect URL
        return response()->json([
            'access_token' => $authToken,
            'role' => $user->role,
            'redirect_url' => '/info'
        ]);
    }

    // Method to sign up a user
    public function signup(Request $request)
    {
        try {
            // Validate the incoming request
            $request->validate([
                'firstName' => 'required',
                'lastName' => 'required',
                'email' => 'required|email|unique:users',
                'password' => 'required|min:8',
                'role' => 'nullable|in:admin,personnel',
                'verificationCode' => 'required|integer'
            ]);

            // If the role is 'admin', check the email and verification code
            if ($request->role == 'admin') {
                $allowedAdminEmail = config('admin.email');
                $allowedAdminVerification = config('admin.verification');

                if ($request->email != $allowedAdminEmail) {
                    return response()->json(['message' => 'This email cannot be assigned the admin role'], 403);
                }

                if ($request->verificationCode != $allowedAdminVerification) {
                    return response()->json(['message' => 'Invalid verification code for admin'], 403);
                }
            }
            // If the role is 'personnel', check the verification code and personnel details
            else if ($request->role == 'personnel') {
                if ($request->verificationCode <= 0 || !(DB::select('select * from Personnel where firstName = ? AND lastName= ?', [$request->firstName, $request->lastName]))) {
                    return response()->json([
                        'message' => 'The given data was invalid.',
                        'errors' => [
                            'verificationCode' => 'Invalid verification code'
                        ],
                    ], 422);
                }

                $personnel = DB::select('select * from Personnel where firstName = ? AND lastName= ? AND verificationCode= ?', [$request->firstName, $request->lastName, $request->verificationCode]);
                if (!$personnel) {
                    return response()->json([
                        'message' => 'The given data was invalid.',
                        'errors' => [
                            'personnel' => 'Personnel not found'
                        ],
                    ], 404);
                }

                $role = DB::select('select namePost from Posts where idPost = ?', [$personnel[0]->idPost]);
            }

            // Create the user
            $user = User::create([
                'firstName' => $request->firstName,
                'lastName' => $request->lastName,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role !='admin' ? $role[0]->namePost : 'admin',
                'verificationCode' => $request->verificationCode,
                'personnel_id' => $request->role != 'admin' ? $personnel[0]->idPersonnel : null,
            ]);

            // Return a response with a success message and the created user
            return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
        } catch (\Exception $e) {
            // If there was an error, return a response with an error message
            return response()->json(['message' => 'Failed to create user', 'error' => $e->getMessage()], 500);
        }
    }
}
