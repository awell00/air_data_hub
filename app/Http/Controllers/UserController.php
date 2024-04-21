<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function getInfo(Request $request)
    {
        if ($request->user()) {
            $fullName = $request->user()->firstName . ' ' . $request->user()->lastName;
            return response()->json(['name' => $fullName]);
        } else {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }
    }
}
