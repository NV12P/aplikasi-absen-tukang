<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\StoreAttendanceRequest;
use App\Services\AttendanceService;
use Illuminate\Http\Request;
use App\Models\Project;
use App\Models\Worker;
use App\Models\Attendance;

class AttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $service
    ) {}

    /**
     * Daftar pekerja berdasarkan proyek (Optimized - No N+1 queries)
     */
    public function projectWorkers(Request $request, Project $project)
    {
        $date = $request->date ?? now()->toDateString();

        $attendedWorkerIds = Attendance::whereDate('date', $date)
            ->whereIn('worker_id', function ($query) use ($project) {
                $query->select('id')->from('workers')->where('project_id', $project->id);
            })
            ->pluck('worker_id')
            ->flip();

        $workers = Worker::with('position')
            ->where('project_id', $project->id)
            ->get();

        $workers->each(function ($worker) use ($attendedWorkerIds) {
            $worker->already_attended = isset($attendedWorkerIds[$worker->id]);
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