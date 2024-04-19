<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Str;

class CreateApiToken extends Command
{
    protected $signature = 'api:token';

    protected $description = 'Create a new API token';

    public function handle()
    {
        $token = Str::random(80);

        // Store the token in your database
        // ...

        $this->info('Your new API token is: ' . $token);
    }
}
