<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function addRole(Request $request)
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'role' => 'required|in:user,admin,agent,chef,technician',
        ]);

        $user = User::find($request->user_id);

        // Check if the user is an admin
        if ($user->role === 'admin') {
            // If the user is an admin, don't change their role
            return response()->json(['message' => 'Cannot change the role of an admin user'], 403);
        }

        $user->role = $request->role;
        $user->save();

        return response()->json(['message' => 'Role updated successfully', 'user' => $user], 200);
    }
}
