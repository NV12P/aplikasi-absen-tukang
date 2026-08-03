<?php

namespace App\Services;

use App\Repositories\AttendanceRepository;
use Illuminate\Support\Facades\DB;
use App\Models\Attendance;
use App\Models\Worker;
use App\Repositories\WorkerRepository;

class AttendanceService
{
    public function __construct(
        protected AttendanceRepository $repository,
        protected WorkerRepository $workerRepository,
        protected WageCalculatorService $wageCalculator
    ) {}

    public function storeAttendance(array $data)
    {
        $workerIds = collect($data['attendances'])->pluck('worker_id')->toArray();

        // 1. Eager load all submitted workers with position in 1 query
        $workers = Worker::with('position')->whereIn('id', $workerIds)->get()->keyBy('id');

        // 2. Fetch existing attendances for these workers on this date in 1 query
        $existingWorkerIds = Attendance::whereIn('worker_id', $workerIds)
            ->whereDate('date', $data['date'])
            ->pluck('worker_id')
            ->toArray();

        if (!empty($existingWorkerIds)) {
            $firstExistingWorkerId = $existingWorkerIds[0];
            $workerName = $workers[$firstExistingWorkerId]->name ?? 'Pekerja';
            return response()->json([
                'success' => false,
                'message' => "Pekerja {$workerName} sudah diabsen pada tanggal {$data['date']}.",
            ], 422);
        }

        $rows = [];
        $now = now();

        foreach ($data['attendances'] as $attendance) {
            $worker = $workers[$attendance['worker_id']] ?? null;

            if (!$worker) {
                return response()->json([
                    'success' => false,
                    'message' => "Data pekerja tidak ditemukan.",
                ], 422);
            }

            if ($worker->project_id != $data['project_id']) {
                return response()->json([
                    'success' => false,
                    'message' => "Pekerja {$worker->name} tidak termasuk dalam proyek yang dipilih.",
                ], 422);
            }

            $wage = $this->wageCalculator->calculate(
                $worker->position,
                $attendance['status']
            );

            $rows[] = [
                'worker_id'  => $attendance['worker_id'],
                'date'       => $data['date'],
                'status'     => $attendance['status'],
                'wage'       => $wage,
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        DB::transaction(function () use ($rows) {
            $this->repository->createMany($rows);
        });

        return response()->json([
            'success'    => true,
            'message'    => 'Absensi berhasil disimpan.',
            'total_data' => count($rows),
        ], 201);
    }

    public function projectWorkers(int $projectId)
    {
        return $this->workerRepository->byProject($projectId);
    }

    public function today()
    {
        return $this->repository->today();
    }
}
