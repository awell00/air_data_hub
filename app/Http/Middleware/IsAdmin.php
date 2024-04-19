<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Auth;

class IsAdmin
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next, $role)
    {
        if (Auth::check() &&  Auth::user()->role == $role) {
            return $next($request);
        }

        return response()->json([
            'message' => 'Unauthorized',
            'user_role' => Auth::user()->role
        ], 401);
    }
}
