<?php

namespace App\Services;

use App\Models\Worker;
use App\Repositories\WorkerRepository;

class WorkerService
{
    public function __construct(
        protected WorkerRepository $repository
    ){}

    public function all()
    {
        return $this->repository->all();
    }

    public function find($id)
    {
        return $this->repository->find($id);
    }

    public function create(array $data)
    {
        return $this->repository->create($data);
    }

    public function update(Worker $worker,array $data)
    {
        return $this->repository->update($worker,$data);
    }

    public function delete(Worker $worker)
    {
        return $this->repository->delete($worker);
    }

   public function byProject(int $projectId)
{
    return $this->repository->byProject($projectId);
}

}