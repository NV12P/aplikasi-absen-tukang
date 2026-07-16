<?php

namespace App\Repositories;

use App\Models\Position;

class PositionRepository
{
    public function getAll()
    {
        return Position::latest()->get();
    }

    public function find($id)
    {
        return Position::findOrFail($id);
    }

    public function create(array $data)
    {
        return Position::create($data);
    }

    public function update(Position $position, array $data)
    {
        $position->update($data);

        return $position;
    }

    public function delete(Position $position)
    {
        return $position->delete();
    }
}