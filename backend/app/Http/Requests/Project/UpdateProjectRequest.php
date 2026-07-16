<?php

namespace App\Http\Requests\Project;

use Illuminate\Foundation\Http\FormRequest;

class UpdateProjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'=>'required|string|max:255',
            'location'=>'required|string|max:255',
            'description'=>'nullable|string',
            'start_date'=>'nullable|date',
            'end_date'=>'nullable|date',
            'is_active'=>'boolean'
        ];
    }
}