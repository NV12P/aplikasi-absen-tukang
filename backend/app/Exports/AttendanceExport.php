<?php

namespace App\Exports;

use App\Models\Attendance;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class AttendanceExport implements
    FromCollection,
    WithHeadings,
    WithMapping,
    WithStyles,
    ShouldAutoSize
{
    protected int $no = 1;

    public function __construct(
        protected array $filters = []
    ) {}

    public function collection()
    {
        return Attendance::with([
                'worker.position',
                'worker.project',
            ])
            ->when(
                !empty($this->filters['project_id']),
                fn($query) => $query->whereHas('worker', function ($q) {
                    $q->where('project_id', $this->filters['project_id']);
                })
            )
            ->when(
                !empty($this->filters['date_from']),
                fn($query) => $query->whereDate('date', '>=', $this->filters['date_from'])
            )
            ->when(
                !empty($this->filters['date_to']),
                fn($query) => $query->whereDate('date', '<=', $this->filters['date_to'])
            )
            ->orderBy('date')
            ->orderBy('worker_id')
            ->get();
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
        return [
            $this->no++,
            $attendance->date->format('d/m/Y'),
            $attendance->worker->name ?? '-',
            $attendance->worker->position->name ?? '-',
            $attendance->worker->project->name ?? '-',
            ucfirst($attendance->status),
            number_format($attendance->wage, 0, ',', '.'),
        ];
    }

    public function styles(Worksheet $sheet): array
    {
        return [
            1 => [
                'font' => [
                    'bold' => true,
                ],
            ],
        ];
    }
}