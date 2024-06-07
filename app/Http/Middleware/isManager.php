<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Auth;

// Define a new middleware class for checking if the user is a manager
class isManager
{
    // Handle an incoming request
    public function handle(Request $request, Closure $next, $role)
    {
        // Check if the user is authenticated and their role matches the required role
        if (Auth::check() &&  Auth::user()->role == $role) {
            // If both checks pass, pass the request to the next middleware
            return $next($request);
        }

        // If any check fails, return an 'Unauthorized' response with the user's role
        return response()->json([
            'message' => 'Unauthorized',
            'user_role' => Auth::user()->role
        ], 401);
    }
}
