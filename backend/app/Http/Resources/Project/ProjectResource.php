<?php

namespace App\Http\Resources\Project;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id'=>$this->id,

            'name'=>$this->name,

            'location'=>$this->location,

            'description'=>$this->description,

            'start_date'=>$this->start_date,

            'end_date'=>$this->end_date,

            'is_active'=>$this->is_active,

            'created_at'=>$this->created_at

        ];
    }
}