<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Services\DashboardService;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(
        protected DashboardService $service
    ) {}

    /**
     * Ringkasan statistik untuk dashboard.
     *
     * Header: Authorization: Bearer {token}
     */
    public function index(Request $request)
    {
        return response()->json([
            'success' => true,
            'data'    => $this->service->getSummary(),
        ]);
    }
}
