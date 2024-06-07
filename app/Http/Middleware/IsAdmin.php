<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Auth;

// Define a new middleware class for checking if the user is an admin
class IsAdmin
{
    // Handle an incoming request
    public function handle(Request $request, Closure $next, $role)
    {
        // Check if the user is authenticated, their role matches the required role, and their email matches the admin email
        if (Auth::check() &&  Auth::user()->role == $role && Auth::user()->email == config('admin.email')) {
            // If all checks pass, pass the request to the next middleware
            return $next($request);
        }

        // If any check fails, return an 'Unauthorized' response with the user's role
        return response()->json([
            'message' => 'Unauthorized',
            'user_role' => Auth::user()->role
        ], 401);
    }
}
