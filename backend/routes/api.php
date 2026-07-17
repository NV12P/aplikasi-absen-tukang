<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Position\PositionController;
use App\Http\Controllers\Project\ProjectController;
use App\Http\Controllers\Worker\WorkerController;
use App\Http\Controllers\Attendance\AttendanceController;
use App\Http\Controllers\Attendance\AttendanceReportController;

Route::prefix('attendance')->group(function () {

    Route::get('/project/{project}', [AttendanceController::class, 'projectWorkers']);

    Route::post('/store', [AttendanceController::class, 'store']);

    Route::get('/today', [AttendanceController::class, 'today']);

    Route::get('/report', [AttendanceReportController::class, 'index']);

});

Route::apiResource('workers', WorkerController::class);

Route::apiResource('projects', ProjectController::class);

Route::apiResource('positions', PositionController::class);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
