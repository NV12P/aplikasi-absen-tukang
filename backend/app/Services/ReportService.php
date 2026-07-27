<?php

namespace App\Services;

use App\Repositories\AttendanceRepository;
use App\Models\Project;
use App\Models\Worker;
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

        $project = Project::findOrFail($projectId);

        $projectWorkers = Worker::where('project_id', $projectId)
            ->where('is_active', true)
            ->with('position')
            ->get();

        $attendances = $this->repository->report(
            $projectId,
            $startDate->toDateString(),
            $endDate->toDateString()
        );

        $attendanceMap = [];
        foreach ($attendances as $attendance) {
            $attendanceMap[$attendance->worker_id][$attendance->date->toDateString()] = [
                'status' => $attendance->status,
                'wage'   => $attendance->wage,
            ];
        }

        $workers = [];

        foreach ($projectWorkers as $worker) {
            $days = [];
            $totalWage = 0;

            if (isset($attendanceMap[$worker->id])) {
                foreach ($attendanceMap[$worker->id] as $dateStr => $attData) {
                    $days[$dateStr] = $attData['status'];
                    $totalWage += $attData['wage'];
                }
            }

            $workers[] = [
                'worker_id'   => $worker->id,
                'worker_name' => $worker->name,
                'position'    => $worker->position?->name ?? '-',
                'daily_wage'  => (float) ($worker->position?->daily_wage ?? 0),
                'days'        => $days,
                'total_wage'  => $totalWage,
            ];
        }

        return [
            'summary' => [
                'project'       => $project->name,
                'period'        => $startDate->format('d M Y') . ' - ' . $endDate->format('d M Y'),
                'total_workers' => count($workers),
                'total_expense' => collect($workers)->sum('total_wage'),
            ],
            'workers' => $workers
        ];
    }
}