<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Passport\HasApiTokens;

// Define a new model class for User
class User extends Authenticatable
{
    // Use traits for API tokens, factory, and notifications
    use HasApiTokens, HasFactory, Notifiable;

    // Define the attributes that are mass assignable
    protected $fillable = [
        'firstName',
        'lastName',
        'email',
        'password',
        'role',
        'personnel_id'
    ];

    // Define the attributes that should be hidden for serialization
    protected $hidden = [
        'password',
        'remember_token',
    ];

    // Define the attributes that should be cast to native types
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'role' => 'string',
    ];

    // Get the attributes that should be cast to native types
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
