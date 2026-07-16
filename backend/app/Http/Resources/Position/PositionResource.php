<?php

namespace App\Http\Resources\Position;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PositionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [

            'id'=>$this->id,

            'name'=>$this->name,

            'daily_wage'=>$this->daily_wage,

            'overtime_wage'=>$this->overtime_wage,

            'casting_wage'=>$this->casting_wage,

            'created_at'=>$this->created_at,

        ];
    }
}