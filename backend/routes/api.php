<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Position\PositionController;
use App\Http\Controllers\Project\ProjectController;
use App\Http\Controllers\Worker\WorkerController;
use App\Http\Controllers\Attendance\AttendanceController;
use App\Http\Controllers\Attendance\AttendanceReportController;
use App\Http\Controllers\Attendance\AttendanceExportController;
use App\Http\Controllers\Auth\LoginController;
use App\Http\Controllers\Auth\LogoutController;
use App\Http\Controllers\Auth\ProfileController;
use App\Http\Controllers\Dashboard\DashboardController;

Route::get('/attendance/report', [AttendanceReportController::class, 'index']);


// ─── Auth (publik) ────────────────────────────────────────────────────────────
Route::post('/login', LoginController::class);

// ─── Route yang butuh autentikasi ─────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // Auth
    Route::post('/logout', LogoutController::class);
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::put('/profile', [ProfileController::class, 'update']);

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index']);

    // Absensi
    Route::prefix('attendance')->group(function () {
        Route::get('/project/{project}', [AttendanceController::class, 'projectWorkers']);
        Route::post('/store', [AttendanceController::class, 'store']);
        Route::get('/today', [AttendanceController::class, 'today']);
        Route::get('/report', [AttendanceReportController::class, 'index']);
        Route::get('/export', AttendanceExportController::class);
    });

    // CRUD Resources
    Route::apiResource('workers', WorkerController::class);
    Route::apiResource('projects', ProjectController::class);
    Route::apiResource('positions', PositionController::class);
});
