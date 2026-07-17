<?php

namespace App\Http\Requests\Attendance;

use App\Enums\AttendanceStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Enum;

class UpdateAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'worker_id' => 'required|exists:workers,id',
            'date'      => 'required|date',
            'status'    => [
                'required',
                new Enum(AttendanceStatus::class),
            ],
        ];
    }
}
