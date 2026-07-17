<?php

namespace App\Http\Resources\Worker;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WorkerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id' => $this->id,

            'name' => $this->name,

            'phone' => $this->phone,

            'address' => $this->address,

            'is_active' => $this->is_active,

            'project' => [
                'id' => $this->project->id,
                'name' => $this->project->name,
            ],

            'position' => [
                'id' => $this->position->id,
                'name' => $this->position->name,
                'daily_wage' => $this->position->daily_wage,
                'overtime_wage' => $this->position->overtime_wage,
                'casting_wage' => $this->position->casting_wage,
            ],

        ];
    }
}