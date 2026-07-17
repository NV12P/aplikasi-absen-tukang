<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Http\Requests\Attendance\StoreAttendanceRequest;
use App\Services\AttendanceService;

class AttendanceController extends Controller
{
    public function __construct(
        protected AttendanceService $service
    ) {}

    /**
     * Daftar pekerja berdasarkan proyek
     */
    public function projectWorkers(int $projectId)
    {
        return response()->json([
            'success' => true,
            'data' => $this->service->projectWorkers($projectId)
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