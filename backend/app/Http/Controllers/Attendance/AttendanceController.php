<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\StoreAttendanceRequest;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Worker;


class AttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $service
    ) {}

    /**
     * Daftar pekerja berdasarkan proyek
     */
    

public function projectWorkers(Request $request, Project $project)
{
    $date = $request->date ?? now()->toDateString();

    $workers = Worker::with('position')
        ->where('project_id', $project->id)
        ->get();

    $workers->each(function ($worker) use ($date) {
        $worker->already_attended = $worker->attendances()
            ->whereDate('date', $date)
            ->exists();
    });

    return response()->json([
        'success' => true,
        'data' => $workers
    ]);
}

    /**
     * Simpan absensi
     */
    public function store(StoreAttendanceRequest $request)
    {
        return $this->service->storeAttendance(
            $request->validated()
        );
    }

    /**
     * Absensi hari ini
     */
    public function today()
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->today()
        ]);
    }
}