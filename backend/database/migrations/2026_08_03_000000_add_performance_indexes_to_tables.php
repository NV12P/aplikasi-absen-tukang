<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations for database performance indexes.
     */
    public function up(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->index('date', 'idx_attendances_date');
        });

        Schema::table('workers', function (Blueprint $table) {
            $table->index(['project_id', 'is_active'], 'idx_workers_project_active');
            $table->index('position_id', 'idx_workers_position');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->index('is_active', 'idx_projects_active');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('idx_attendances_date');
        });

        Schema::table('workers', function (Blueprint $table) {
            $table->dropIndex('idx_workers_project_active');
            $table->dropIndex('idx_workers_position');
        });

        Schema::table('projects', function (Blueprint $table) {
            $table->dropIndex('idx_projects_active');
        });
    }
};
