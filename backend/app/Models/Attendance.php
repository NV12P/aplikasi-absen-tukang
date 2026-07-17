<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attendance extends Model
{
    protected $fillable = [
        'worker_id',
        'date',
        'status',
        'wage'
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function worker()
    {
        return $this->belongsTo(Worker::class);
    }
}