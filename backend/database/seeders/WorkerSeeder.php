<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Worker;

class WorkerSeeder extends Seeder
{
    public function run(): void
    {
        Worker::insert([

            [

                'project_id'=>1,

                'position_id'=>1,

                'name'=>'Budi',

                'phone'=>'081111111',

                'address'=>'Kediri',

                'is_active'=>true

            ],

            [

                'project_id'=>1,

                'position_id'=>2,

                'name'=>'Joko',

                'phone'=>'082222222',

                'address'=>'Kediri',

                'is_active'=>true

            ],

            [

                'project_id'=>2,

                'position_id'=>1,

                'name'=>'Slamet',

                'phone'=>'083333333',

                'address'=>'Blitar',

                'is_active'=>true

            ]

        ]);
    }
}