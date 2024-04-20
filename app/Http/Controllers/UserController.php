<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function getInfo(Request $request)
    {
        if ($request->user()) {
            return response()->json(['name' => $request->user()->name]);
        } else {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }
}
