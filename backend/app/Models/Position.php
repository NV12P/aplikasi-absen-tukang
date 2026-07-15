<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Position extends Model
{
    protected $fillable = [
        'name',
        'daily_wage',
        'overtime_wage',
        'casting_wage',
    ];
}