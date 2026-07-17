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

    
}