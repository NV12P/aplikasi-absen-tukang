<?php

namespace App\Repositories;

use App\Models\Project;

class ProjectRepository
{
    public function all()
    {
        return Project::latest()->get();
    }

    public function find($id)
    {
        return Project::findOrFail($id);
    }

    public function create(array $data)
    {
        return Project::create($data);
    }

    public function update(Project $project,array $data)
    {
        $project->update($data);

        return $project;
    }

    public function delete(Project $project)
    {
        return $project->delete();
    }

    public function active()
{
    return Project::where('is_active', true)
        ->orderBy('name')
        ->get();
}
}