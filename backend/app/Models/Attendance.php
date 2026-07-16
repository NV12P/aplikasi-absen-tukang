<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'worker_id',
        'date',
        'status',
        'is_overtime',
        'daily_wage',
        'notes',
    ];

    protected $casts = [
        'date' => 'date',
        'is_overtime' => 'boolean',
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}