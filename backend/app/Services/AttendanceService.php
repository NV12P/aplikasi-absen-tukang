<?php

namespace App\Services;

use App\Repositories\AttendanceRepository;
use Illuminate\Support\Facades\DB;
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
    DB::transaction(function () use ($data) {

        $rows = [];

        foreach ($data['attendances'] as $attendance) {

            if ($this->repository->exists(
    $attendance['worker_id'],
    $data['date']
)) {

    $worker = Worker::find($attendance['worker_id']);

    return response()->json([
        'success' => false,
        'message' => "Pekerja {$worker->name} sudah diabsen pada tanggal {$data['date']}."
    ], 422);

}

            $worker = Worker::with('position')
    ->findOrFail($attendance['worker_id']);

if ($worker->project_id != $data['project_id']) {
    abort(422, 'Pekerja tidak termasuk dalam proyek yang dipilih.');
}

           $wage = $this->wageCalculator->calculate(
    $worker->position,
    $attendance['status']
);

            $rows[] = [

                'worker_id'=>$attendance['worker_id'],

                'date'=>$data['date'],

                'status'=>$attendance['status'],

                'wage'=>$wage,

                'created_at'=>now(),

                'updated_at'=>now(),

            ];

        }

        $this->repository->createMany($rows);

    });

    return response()->json([
    'success' => true,
    'message' => 'Absensi berhasil disimpan.',
    'total_data' => count($data['attendances'])
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