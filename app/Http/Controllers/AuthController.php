<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'email|required',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

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

        $authToken = $user->createToken('auth-token')->accessToken;

        return response()->json([
            'access_token' => $authToken,
            'role' => $user->role,
            'redirect_url' => '/info'
        ]);
    }

    public function signup(Request $request)
    {
        try {
            $request->validate([
                'firstName' => 'required',
                'lastName' => 'required',
                'email' => 'required|email|unique:users',
                'password' => 'required|min:8',
                'role' => 'nullable|in:admin,personnel',
                'verificationCode' => 'required|integer'
            ]);

            // Check if a user with the same first name and last name already exists
            /*$existingUser = User::where('firstName', $request->firstName)
                ->where('lastName', $request->lastName)
                ->first();

            if ($existingUser) {
                return response()->json([
                    'message' => 'The given data was invalid.',
                    'errors' => [
                        'user' => 'User already exists'
                    ],
                ], 422);
            }*/

            if ($request->role == 'admin') {
                $allowedAdminEmail = config('admin.email');
                $allowedAdminVerification = config('admin.verification');

                if ($request->email != $allowedAdminEmail) {
                    return response()->json(['message' => 'This email cannot be assigned the admin role'], 403);
                }

                if ($request->verificationCode != $allowedAdminVerification) {
                    return response()->json(['message' => 'Invalid verification code for admin'], 403);
                }
            } else if ($request->role == 'personnel') {
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

            $user = User::create([
                'firstName' => $request->firstName,
                'lastName' => $request->lastName,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role !='admin' ? $role[0]->namePost : 'admin',
                'verificationCode' => $request->verificationCode,
                'personnel_id' => $request->role != 'admin' ? $personnel[0]->idPersonnel : null,
            ]);

            return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create user', 'error' => $e->getMessage()], 500);
        }
    }
}
