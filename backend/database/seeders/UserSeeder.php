<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Akun Admin
        User::updateOrCreate(
            ['email' => 'admin@absen.com'],
            [
                'name'     => 'Admin',
                'email'    => 'admin@absen.com',
                'password' => Hash::make('password'),
            ]
        );

        // Akun Mandor
        User::updateOrCreate(
            ['email' => 'mandor@absen.com'],
            [
                'name'     => 'Mandor Budi',
                'email'    => 'mandor@absen.com',
                'password' => Hash::make('password'),
            ]
        );
    }
}
