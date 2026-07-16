<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [

        'name',

        'location',

        'description',

        'start_date',

        'end_date',

        'is_active',

    ];  

    public function workers()
{
    return $this->hasMany(Worker::class);
}
}