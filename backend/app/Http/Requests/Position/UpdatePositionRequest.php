<?php

namespace App\Http\Requests\Position;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'name'=>'required|string|max:100',

            'daily_wage'=>'required|integer|min:0',

            'overtime_wage'=>'required|integer|min:0',

            'casting_wage'=>'required|integer|min:0',

        ];
    }
}