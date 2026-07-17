<?php

namespace App\Http\Requests\Attendance;

use Illuminate\Foundation\Http\FormRequest;

class StoreAttendanceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [

            'project_id' => [
                'required',
                'exists:projects,id'
            ],

            'date' => [
                'required',
                'date'
            ],

            'attendances' => [
                'required',
                'array'
            ],

            'attendances.*.worker_id' => [
                'required',
                'exists:workers,id'
            ],

            'attendances.*.status' => [
                'required',
                'in:hadir,lembur,cor,alpha'
            ],

        ];
    }
}