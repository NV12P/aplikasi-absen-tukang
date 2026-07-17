<?php

namespace App\Repositories;

use App\Models\Worker;

class WorkerRepository
{
    public function all()
    {
        return Worker::with([
            'project',
            'position'
        ])->latest()->get();
    }

    public function find($id)
    {
        return Worker::with([
            'project',
            'position'
        ])->findOrFail($id);
    }

    public function create(array $data)
    {
        return Worker::create($data);
    }

    public function update(Worker $worker, array $data)
    {
        $worker->update($data);

        return $worker->fresh([
            'project',
            'position'
        ]);
    }

    public function delete(Worker $worker)
    {
        return $worker->delete();
    }

    public function byProject(int $projectId)
{
    return \App\Models\Worker::with([
        'position',
        'project'
    ])
    ->where('project_id', $projectId)
    ->where('is_active', true)
    ->orderBy('name')
    ->get();
}

}