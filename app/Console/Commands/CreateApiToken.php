<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

// Define a new command class for creating API tokens
class CreateApiToken extends Command
{
    // The name and signature of the console command
    protected $signature = 'api:token';

    // The console command description
    protected $description = 'Create a new API token';

    // Handle the console command
    public function handle()
    {
        // Generate a random string of 80 characters
        $token = Str::random(80);

        // Output the new API token
        $this->info('Your new API token is: ' . $token);
    }
}
