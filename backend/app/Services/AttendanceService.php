<?php

namespace App\Services;

use App\Models\Attendance;
use App\Models\Worker;

class AttendanceService
{
    public function calculateWage(
        Worker $worker,
        bool $hadir,
        bool $lembur,
        bool $cor
    ): array {

        $position = $worker->position;

        if ($cor) {

            return [
                'status' => 'COR',
                'is_overtime' => false,
                'daily_wage' => $position->casting_wage
            ];
        }

        if ($hadir) {

            $wage = $position->daily_wage;

            if ($lembur) {
                $wage += $position->overtime_wage;
            }

            return [
                'status' => 'HADIR',
                'is_overtime' => $lembur,
                'daily_wage' => $wage
            ];
        }

        return [
            'status' => 'ALPHA',
            'is_overtime' => false,
            'daily_wage' => 0
        ];
    }
}