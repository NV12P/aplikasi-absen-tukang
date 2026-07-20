<?php

namespace App\Services
<<<<<<< HEAD
use App\Models\Attendance;
use App\Models\Project;

class ReportService
{
    /**
     * Laporan absensi berdasarkan filter.
     *
     * Parameter yang didukung:
     *  - project_id  (opsional)
     *  - date_from   (opsional, format Y-m-d)
     *  - date_to     (opsional, format Y-m-d)
     */
    public function getReport(array $filters = []): array
    {
        $query = Attendance::with([
            'worker.position',
            'worker.project',
        ]);

        // Filter project melalui relasi worker
        if (!empty($filters['project_id'])) {
            $query->whereHas('worker', function ($q) use ($filters) {
                $q->where('project_id', $filters['project_id']);
            });
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate('date', '>=', $filters['date_from']);
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate('date', '<=', $filters['date_to']);
        }

        $attendances = $query->orderBy('date', 'desc')->get();

        // Hitung ringkasan per pekerja
        $summary = $attendances->groupBy('worker_id')->map(function ($records) {
            $worker = $records->first()->worker;

            return [
                'worker_id'   => $worker->id,
                'worker_name' => $worker->name,
                'position'    => $worker->position->name ?? '-',
                'project'     => $worker->project->name ?? '-',
                'total_hadir' => $records->where('status', 'hadir')->count(),
                'total_lembur'=> $records->where('status', 'lembur')->count(),
                'total_cor'   => $records->where('status', 'cor')->count(),
                'total_alpha' => $records->where('status', 'alpha')->count(),
                'total_hari'  => $records->count(),
                'total_upah'  => $records->sum('wage'),
            ];
        })->values();

        return [
            'total_records' => $attendances->count(),
            'total_upah'    => $attendances->sum('wage'),
            'summary'       => $summary,
            'detail'        => $attendances->map(function ($a) {
                return [
                    'id'          => $a->id,
                    'date'        => $a->date->format('Y-m-d'),
                    'worker_id'   => $a->worker_id,
                    'worker_name' => $a->worker->name,
                    'position'    => $a->worker->position->name ?? '-',
                    'project'     => $a->worker->project->name ?? '-',
                    'status'      => $a->status,
                    'wage'        => $a->wage,
                ];
            }),
        ];
    }
}
=======
use App\Repositories\AttendanceRepository;
use App\Models\Project;
use Carbon\Carbon;

class ReportService
{
    public function __construct(
        protected AttendanceRepository $repository
    ) {}

    public function weeklyReport(int $projectId, string $start)
    {
        $startDate = Carbon::parse($start)->startOfWeek();
        $endDate   = Carbon::parse($start)->endOfWeek();

        $attendances = $this->repository->report(
            $projectId,
            $startDate->toDateString(),
            $endDate->toDateString()
        );

        $project = Project::findOrFail($projectId);

        $workers = [];

        foreach ($attendances as $attendance) {

            $worker = $attendance->worker;
            $date   = $attendance->date->toDateString();

            if (!isset($workers[$worker->id])) {

                $workers[$worker->id] = [
                    'id'         => $worker->id,
                    'name'       => $worker->name,
                    'position'   => $worker->position->name,
                    'days'       => [],
                    'total_wage' => 0,
                ];

            }

            $workers[$worker->id]['days'][$date] = $attendance->status;

            $workers[$worker->id]['total_wage'] += $attendance->wage;
        }

        return [
            'summary' => [
                'project'        => $project->name,
                'period'         => $startDate->format('d M Y') . ' - ' . $endDate->format('d M Y'),
                'total_workers'  => count($workers),
                'total_expense'  => collect($workers)->sum('total_wage'),
            ],
            'workers' => array_values($workers)
        ];
    }
}
>>>>>>> 905f555 (feat: attendance reports)
    'workers' => array_values($workers)
        ];
    }
}  'workers' => array_values($workers)
        ];
    }
}