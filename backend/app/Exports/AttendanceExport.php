<?php

namespace App\Exports;

use App\Models\Attendance;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AttendanceExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    ShouldAutoSize
{
    public function __construct(
        protected array $filters = []
    ) {}

    public function collection()
    {
        $query = Attendance::with([
            'worker.position',
            'worker.project',
        ]);

        if (!empty($this->filters['project_id'])) {
            $query->whereHas('worker', function ($q) {
                $q->where('project_id', $this->filters['project_id']);
            });
        }

        if (!empty($this->filters['date_from'])) {
            $query->whereDate('date', '>=', $this->filters['date_from']);
        }

        if (!empty($this->filters['date_to'])) {
            $query->whereDate('date', '<=', $this->filters['date_to']);
        }

        return $query->orderBy('date', 'desc')->get();
    }

    public function headings(): array
    {
        return [
            'No',
            'Tanggal',
            'Nama Pekerja',
            'Jabatan',
            'Proyek',
            'Status',
            'Upah (Rp)',
        ];
    }

    public function map($attendance): array
    {
        static $no = 0;
        $no++;

        return [
            $no,
            $attendance->date->format('d/m/Y'),
            $attendance->worker->name ?? '-',
            $attendance->worker->position->name ?? '-',
            $attendance->worker->project->name ?? '-',
            strtoupper($attendance->status),
            $attendance->wage,
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            // Bold header row
            1 => ['font' => ['bold' => true]],
        ];
    }
}
