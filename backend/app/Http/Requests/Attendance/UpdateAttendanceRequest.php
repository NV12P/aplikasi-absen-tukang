<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;
use App\Enums\AttendanceStatus;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'worker_id'=>'required|exists:workers,id',

            'date'=>'required|date',

            'status'=>[
                'required',
                new Enum(AttendanceStatus::class)
            ]

        ];
    }
}