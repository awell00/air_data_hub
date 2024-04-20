<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function addRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:user,admin,agent,chef',
        ]);

        $user = User::find($request->user_id);
        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => 'Role updated successfully', 'user' => $user], 200);
    }
}
