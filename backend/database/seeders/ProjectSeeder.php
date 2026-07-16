<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Project;

class ProjectSeeder extends Seeder
{
    public function run(): void
    {
        Project::insert([

            [

                'name'=>'Rumah Pak Budi',

                'location'=>'Kediri',

                'description'=>'Pembangunan Rumah',

                'start_date'=>'2026-07-01',

                'end_date'=>null,

                'is_active'=>true,

            ],

            [

                'name'=>'Ruko Pak Andi',

                'location'=>'Blitar',

                'description'=>'Pembangunan Ruko',

                'start_date'=>'2026-07-10',

                'end_date'=>null,

                'is_active'=>true,

            ],

        ]);
    }
}