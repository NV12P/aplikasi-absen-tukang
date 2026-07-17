<?php

namespace App\Http\Controllers\Attendance;

use App\Exports\AttendanceExport;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class AttendanceExportController extends Controller
{
    /**
     * Export rekap absensi ke file Excel (.xlsx).
     *
     * Query params (semua opsional):
     *   ?project_id=1
     *   ?date_from=2026-07-01
     *   ?date_to=2026-07-31
     *
     * Header: Authorization: Bearer {token}
     */
    public function __invoke(Request $request)
    {
        $request->validate([
            'project_id' => 'nullable|exists:projects,id',
            'date_from'  => 'nullable|date',
            'date_to'    => 'nullable|date|after_or_equal:date_from',
        ]);

        $filters  = $request->only(['project_id', 'date_from', 'date_to']);
        $filename = 'rekap-absensi-' . now()->format('Y-m-d') . '.xlsx';

        return Excel::download(new AttendanceExport($filters), $filename);
    }
}
