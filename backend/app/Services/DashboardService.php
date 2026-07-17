<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Project;
use App\Models\Worker;
use App\Models\Position;

class DashboardService
{
    public function getSummary(): array
    {
        $today = today();

        // Absensi hari ini
        $todayAttendances = Attendance::whereDate('date', $today)->get();

        // Total pekerja aktif
        $totalWorkers = Worker::where('is_active', true)->count();

        // Total proyek aktif
        $totalProjects = Project::where('is_active', true)->count();

        // Total jabatan
        $totalPositions = Position::count();

        // Upah yang sudah dikeluarkan hari ini
        $todayWage = $todayAttendances->sum('wage');

        // Rekap status absensi hari ini
        $todayRecap = [
            'hadir'  => $todayAttendances->where('status', 'hadir')->count(),
            'lembur' => $todayAttendances->where('status', 'lembur')->count(),
            'cor'    => $todayAttendances->where('status', 'cor')->count(),
            'alpha'  => $todayAttendances->where('status', 'alpha')->count(),
            'total'  => $todayAttendances->count(),
        ];

        // Total upah bulan ini
        $monthWage = Attendance::whereYear('date', $today->year)
            ->whereMonth('date', $today->month)
            ->sum('wage');

        // 5 pekerja dengan upah terbanyak bulan ini
        $topWorkers = Attendance::with('worker')
            ->whereYear('date', $today->year)
            ->whereMonth('date', $today->month)
            ->selectRaw('worker_id, SUM(wage) as total_wage, COUNT(*) as total_hari')
            ->groupBy('worker_id')
            ->orderByDesc('total_wage')
            ->limit(5)
            ->get()
            ->map(fn ($a) => [
                'worker_id'   => $a->worker_id,
                'worker_name' => $a->worker->name ?? '-',
                'total_hari'  => $a->total_hari,
                'total_wage'  => $a->total_wage,
            ]);

        return [
            'stats' => [
                'total_workers'   => $totalWorkers,
                'total_projects'  => $totalProjects,
                'total_positions' => $totalPositions,
            ],
            'today' => [
                'date'       => $today->format('Y-m-d'),
                'attendance' => $todayRecap,
                'total_wage' => $todayWage,
            ],
            'this_month' => [
                'month'      => $today->format('Y-m'),
                'total_wage' => $monthWage,
            ],
            'top_workers_this_month' => $topWorkers,
        ];
    }
}
