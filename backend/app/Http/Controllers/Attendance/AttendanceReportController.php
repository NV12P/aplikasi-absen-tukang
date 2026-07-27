<?php

namespace App\Http\Controllers\Attendance;

use App\Http\Controllers\Controller;
use App\Services\ReportService;
use Illuminate\Http\Request;

class AttendanceReportController extends Controller
{
    public function __construct(
        protected ReportService $service
    ) {}

    public function index(Request $request)
    {
        $request->validate([
            'project_id' => ['required', 'exists:projects,id'],
            'week'       => ['nullable', 'date'],
            'date_from'  => ['nullable', 'date'],
        ]);

        $week = $request->week ?? $request->date_from ?? now()->toDateString();

        return response()->json([
            'success' => true,
            'data'    => $this->service->weeklyReport((int) $request->project_id, $week)
        ]);
    }
}