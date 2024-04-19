<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\GazController;
use App\Models\User;

Route::get('/gaz', [GazController::class, 'getGazData']);

Route::post('/login', function (Request $request) {
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
})->name('login');

Route::middleware(['auth:api', 'App\Http\Middleware\IsAdmin:admin'])->group(function () {
    Route::post('/add-role', function (Request $request) {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:user,admin,agent,chef',
        ]);

        $user = User::find($request->user_id);
        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => 'Role updated successfully', 'user' => $user], 200);
    });
});

Route::post('/signup', function (Request $request) {
    try {
        $request->validate([
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:8',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);

        return response()->json(['message' => 'User created successfully', 'user' => $user], 201);
    } catch (\Exception $e) {
        return response()->json(['message' => 'Failed to create user', 'error' => $e->getMessage()], 500);
    }
});

Route::middleware(['auth:api'])->get('/info', function (Request $request) {
    if ($request->user()) {
        return response()->json(['name' => $request->user()->name]);
    } else {
        return response()->json(['message' => 'Unauthenticated'], 401);
    }
});

Route::get('/user', function (Request $request) {
    return $request->user();
});
