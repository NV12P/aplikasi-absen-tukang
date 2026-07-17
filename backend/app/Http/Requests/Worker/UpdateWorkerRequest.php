<?php

namespace App\Http\Requests\Worker;

use Illuminate\Foundation\Http\FormRequest;

class UpdateWorkerRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'project_id' => 'required|exists:projects,id',

            'position_id' => 'required|exists:positions,id',

            'name' => 'required|string|max:100',

            'phone' => 'nullable|string|max:20',

            'address' => 'nullable|string',

            'is_active' => 'boolean',

        ];
    }
}