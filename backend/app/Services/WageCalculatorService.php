<?php

namespace App\Services;

use App\Models\Position;

class WageCalculatorService
{
    public function calculate(Position $position, string $status): int
    {
        return match ($status) {

            'hadir' => $position->daily_wage,

            'lembur' => $position->daily_wage + $position->overtime_wage,

            'cor' => $position->casting_wage,

            default => 0

        };
    }
}