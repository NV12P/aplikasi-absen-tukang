<?php

namespace App\Services;

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
};