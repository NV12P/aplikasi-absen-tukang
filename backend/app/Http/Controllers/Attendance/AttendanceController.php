<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Worker;
use App\Services\AttendanceService;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    public function store(Request $request, AttendanceService $service)
    {
        foreach ($request->workers as $item) {

            $worker = Worker::with('position')
                ->findOrFail($item['worker_id']);

            $result = $service->calculateWage(
                $worker,
                $item['hadir'],
                $item['lembur'],
                $item['cor']
            );

            Attendance::updateOrCreate(

                [
                    'worker_id'=>$worker->id,
                    'date'=>$request->date
                ],

                [

                    'status'=>$result['status'],

                    'is_overtime'=>$result['is_overtime'],

                    'daily_wage'=>$result['daily_wage']

                ]

            );

        }

        return response()->json([

            'message'=>'Attendance Saved'

        ]);
    }
};