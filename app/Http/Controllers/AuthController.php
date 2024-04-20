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

        $credentials = request(['email', 'password']);
        if (!auth()->attempt($credentials)) {
            return response()->json([
                'message' => 'The given data was invalid.',
                'errors' => [
                    'password' => [
                        'Invalid credentials'
                    ],
                ]
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        $authToken = $user->createToken('auth-token')->accessToken;

        return response()->json([
            'access_token' => $authToken,
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
                'role' => 'required|in:user,admin,agent,chef',
            ]);

            $personnel = DB::select('select * from Personnel where firstName = ? AND lastName= ?', [$request->firstName, $request->lastName]);
            if (!$personnel && $request->email != config('admin.email')) {
                return response()->json(['message' => 'Personnel not found'], 404);
            }

            if ($request->role == 'admin') {
                $allowedAdminEmail = config('admin.email');

                if ($request->email != $allowedAdminEmail) {
                    return response()->json(['message' => 'This email cannot be assigned the admin role'], 403);
                }
            }

            $user = User::create([
                'firstName' => $request->firstName,
                'lastName' => $request->lastName,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => $request->role,
            ]);

            return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Failed to create user', 'error' => $e->getMessage()], 500);
        }
    }
}
