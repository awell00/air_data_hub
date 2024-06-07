<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

// Define a new middleware class for checking API tokens
class CheckApiToken
{
    // Handle an incoming request
    public function handle(Request $request, Closure $next)
    {
        // Get the 'Authorization' header from the request
        $header = $request->header('Authorization');

        // Remove 'Bearer ' from the start of the token
        $token = str_replace('Bearer ', '', $header);

        // Get the stored token from the configuration
        $storedToken = config('admin.token');

        // If the provided token does not match the stored token, return an 'Unauthorized' response
        if ($token !== $storedToken) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // If the token is valid, pass the request to the next middleware
        return $next($request);
    }
}
