<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Worker extends Model
{
    protected $fillable = [

        'project_id',

        'position_id',

        'name',

        'phone',

        'address',

        'is_active'

    ];

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function position()
    {
        return $this->belongsTo(Position::class);
    }

    public function attendances()
{
    return $this->hasMany(Attendance::class);
}
}