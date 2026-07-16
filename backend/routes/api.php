<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Position\PositionController;
use App\Http\Controllers\Project\ProjectController;

Route::apiResource('projects', ProjectController::class);

Route::apiResource('positions', PositionController::class);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
