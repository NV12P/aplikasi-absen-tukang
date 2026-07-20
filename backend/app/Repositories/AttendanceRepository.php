<?php

namespace App\Repositories;

use App\Models\Attendance;

class AttendanceRepository
{
    public function exists(int $workerId, string $date): bool
    {
        return Attendance::where('worker_id', $workerId)
            ->whereDate('date', $date)
            ->exists();
    }

    public function createMany(array $rows): bool
    {
        return Attendance::insert($rows);
    }

    public function today()
    {
        return Attendance::with([
            'worker.position',
            'worker.project'
        ])
        ->whereDate('date', today())
        ->get();
    }
    

public function report(int $projectId, string $start, string $end)
{
    return Attendance::with([
        'worker.position',
        'worker.project'
    ])
    ->whereHas('worker', function ($query) use ($projectId) {
        $query->where('project_id', $projectId);
    })
    ->whereBetween('date', [$start, $end])
    ->orderBy('date')
    ->get();
}

    
}