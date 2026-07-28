<?php

namespace App\Http\Controllers\Api;

use App\Exports\AttendanceReportExport;
use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\Project;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;

class ExportController extends Controller
{
    public function attendance(Request $request)
    {
        $request->validate([
            'project_id' => 'required|exists:projects,id',
            'date' => 'required|date',
        ]);

        $project = Project::findOrFail($request->project_id);

        $date = Carbon::parse($request->date);

        $start = $date->copy()->startOfWeek(Carbon::MONDAY);

        $end = $date->copy()->endOfWeek(Carbon::SUNDAY);

        $attendances = Attendance::with([
            'worker.position',
            'worker.project'
        ])
        ->whereBetween('date', [$start, $end])
        ->whereHas('worker', function ($q) use ($project) {
            $q->where('project_id', $project->id);
        })
        ->get();

        $workers = [];

        foreach ($attendances->groupBy('worker_id') as $workerAttendances) {

            $worker = $workerAttendances->first()->worker;

            $days = [
                'Sen'=>'',
                'Sel'=>'',
                'Rab'=>'',
                'Kam'=>'',
                'Jum'=>'',
                'Sab'=>'',
                'Min'=>''
            ];

            $total = 0;

            foreach ($workerAttendances as $attendance) {

                $hari = match ($attendance->date->dayOfWeekIso) {
                    1=>'Sen',
                    2=>'Sel',
                    3=>'Rab',
                    4=>'Kam',
                    5=>'Jum',
                    6=>'Sab',
                    7=>'Min'
                };

                $days[$hari] = $attendance->status;

                $total += $attendance->wage;
            }

          $dailyWage = $workerAttendances
    ->where('status', 'hadir')
    ->first()?->wage
    ?? $workerAttendances->where('status', 'lembur')->first()?->wage
    ?? 0;

$workers[] = [
    'name' => $worker->name,
    'position' => $worker->position->name,
    'daily_wage' => $dailyWage,
    'days' => $days,
    'total' => $total,
];
        }

        return Excel::download(
            new AttendanceReportExport(
                $project,
                $workers,
                [
                    'start'=>$start,
                    'end'=>$end
                ]
            ),
            'rekap-absensi-'.$start->format('Ymd').'.xlsx'
        );
    }
}