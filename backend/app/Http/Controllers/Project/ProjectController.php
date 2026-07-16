<?php

namespace App\Http\Controllers\Project;

use App\Http\Controllers\Controller;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use App\Http\Resources\Project\ProjectResource;
use App\Models\Project;
use App\Services\ProjectService;

class ProjectController extends Controller
{
    protected ProjectService $service;

    public function __construct(ProjectService $service)
    {
        $this->service = $service;
    }

    /**
     * Menampilkan semua proyek
     */
    public function index()
    {
        return ProjectResource::collection(
            $this->service->all()
        );
    }

    /**
     * Menyimpan proyek baru
     */
    public function store(StoreProjectRequest $request)
    {
        $project = $this->service->create(
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Project berhasil ditambahkan.',
            'data' => new ProjectResource($project)
        ], 201);
    }

    /**
     * Menampilkan detail proyek
     */
    public function show(Project $project)
    {
        return response()->json([
            'success' => true,
            'data' => new ProjectResource($project)
        ]);
    }

    /**
     * Mengubah data proyek
     */
    public function update(UpdateProjectRequest $request, Project $project)
    {
        $project = $this->service->update(
            $project,
            $request->validated()
        );

        return response()->json([
            'success' => true,
            'message' => 'Project berhasil diperbarui.',
            'data' => new ProjectResource($project)
        ]);
    }

    /**
     * Menghapus proyek
     */
    public function destroy(Project $project)
    {
        $this->service->delete($project);

        return response()->json([
            'success' => true,
            'message' => 'Project berhasil dihapus.'
        ]);
    }
}