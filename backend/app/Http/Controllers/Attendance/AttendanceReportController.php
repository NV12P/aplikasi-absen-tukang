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

    /**
     * Laporan absensi.
     *
     * Query params (semua opsional):
     *   ?project_id=1
     *   ?date_from=2026-07-01
     *   ?date_to=2026-07-31
     */
    public function index(Request $request)
    {
        $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'date_from'  => 'nullable|date',
            'date_to'    => 'nullable|date|after_or_equal:date_from',
        ]);

        $report = $this->service->getReport($request->only([
            'project_id',
            'date_from',
            'date_to',
        ]));

        return response()->json([
            'success' => true,
            'data'    => $report,
        ]);
    }
}
