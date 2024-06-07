<?php

// Namespace declaration
namespace App\Http\Controllers;

// Importing necessary classes
use App\Models\User;
use Illuminate\Http\Request;

// AdminController class extending the base Controller class
class AdminController extends Controller
{
    // Method to add a role to a user
    public function addRole(Request $request)
    {
        // Validate the incoming request
        $request->validate([
            'user_id' => 'required|exists:users,id', // The user_id must exist in the users table
            'role' => 'required|in:user,admin,agent,chef,technician', // The role must be one of the following
        ]);

        // Find the user with the given id
        $user = User::find($request->user_id);

        // Check if the user is an admin
        if ($user->role === 'admin') {
            // If the user is an admin, don't change their role
            // Return a response with a message and a 403 status code
            return response()->json(['message' => 'Cannot change the role of an admin user'], 403);
        }

        // If the user is not an admin, update their role
        $user->role = $request->role;

        // Save the changes to the user
        $user->save();

        // Return a response with a success message, the updated user, and a 200 status code
        return response()->json(['message' => 'Role updated successfully', 'user' => $user], 200);
    }
}
