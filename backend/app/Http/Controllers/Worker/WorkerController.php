<?php

namespace App\Http\Controllers\Worker;

use App\Http\Controllers\Controller;
use App\Http\Requests\Worker\StoreWorkerRequest;
use App\Http\Requests\Worker\UpdateWorkerRequest;
use App\Http\Resources\Worker\WorkerResource;
use App\Models\Worker;
use App\Services\WorkerService;

class WorkerController extends Controller
{
    protected WorkerService $service;

    public function __construct(WorkerService $service)
    {
        $this->service = $service;
    }

    /**
     * Menampilkan semua pekerja
     */
    public function index()
    {
        return WorkerResource::collection(
            $this->service->all()
        );
    }

    /**
     * Menyimpan pekerja baru
     */
    public function store(StoreWorkerRequest $request)
    {
        $worker = $this->service->create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Pekerja berhasil ditambahkan.',
            'data' => new WorkerResource($worker)
        ], 201);
    }

    /**
     * Detail pekerja
     */
    public function show(Worker $worker)
    {
        return response()->json([
            'success' => true,
            'data' => new WorkerResource($worker->load(['project', 'position']))
        ]);
    }

    /**
     * Update pekerja
     */
    public function update(UpdateWorkerRequest $request, Worker $worker)
    {
        $worker = $this->service->update(
            $worker,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Pekerja berhasil diperbarui.',
            'data' => new WorkerResource($worker)
        ]);
    }

    /**
     * Hapus pekerja
     */
    public function destroy(Worker $worker)
    {
        $this->service->delete($worker);

        return response()->json([
            'success' => true,
            'message' => 'Pekerja berhasil dihapus.'
        ]);
    }
}