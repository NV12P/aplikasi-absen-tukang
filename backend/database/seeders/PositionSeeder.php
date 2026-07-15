<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Position;

class PositionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Position::insert([
            [
                'name' => 'Tukang',
                'daily_wage' => 110000,
                'overtime_wage' => 50000,
                'casting_wage' => 300000,
            ],
            [
                'name' => 'Kenek',
                'daily_wage' => 90000,
                'overtime_wage' => 40000,
                'casting_wage' => 250000,
            ],
        ]);
    }
}