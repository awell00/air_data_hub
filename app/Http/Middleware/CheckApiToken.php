<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckApiToken
{
    public function handle(Request $request, Closure $next)
    {
        $header = $request->header('Authorization');
        $token = str_replace('Bearer ', '', $header);

        // Replace this with the actual method to retrieve your token from the database
        $storedToken = config('admin.token');


        if ($token !== $storedToken) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return $next($request);
    }
}
