<?php

namespace App\Services;

use App\Repositories\PositionRepository;
use App\Models\Position;

class PositionService
{
    public function __construct(
        protected PositionRepository $repository
    ) {}

    public function all()
    {
        return $this->repository->getAll();
    }

    public function find($id)
    {
        return $this->repository->find($id);
    }

    public function create(array $data)
    {
        return $this->repository->create($data);
    }

    public function update(Position $position, array $data)
    {
        return $this->repository->update($position, $data);
    }

    public function delete(Position $position)
    {
        return $this->repository->delete($position);
    }
}