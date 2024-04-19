<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Hash;
use App\Http\Controllers\GazController;
use App\Models\User;
use App\Http\Controllers\AuthController;

Route::get('/gaz', [GazController::class, 'getGazData'])->middleware('App\Http\Middleware\CheckApiToken');

Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::post('/signup', [AuthController::class, 'signup']);

Route::get('/gasTypes', function () {
    // select formulaGas from Gases
    $gasesType = DB::select('SELECT formulaGas FROM Gases');
    return response()->json($gasesType);
});

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
