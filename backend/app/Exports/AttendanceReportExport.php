<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;

class AttendanceReportExport implements FromView
{
    protected $project;
    protected $workers;
    protected $week;

    public function __construct($project, $workers, $week)
    {
        $this->project = $project;
        $this->workers = $workers;
        $this->week = $week;
    }

    public function view(): View
    {
        return view('exports.attendance-report', [
            'project' => $this->project,
            'workers' => $this->workers,
            'week' => $this->week,
        ]);
    }
}