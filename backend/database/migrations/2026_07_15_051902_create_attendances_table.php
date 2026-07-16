<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('attendances', function (Blueprint $table) {

            $table->id();

            $table->foreignId('worker_id')
                ->constrained()
                ->cascadeOnDelete();

            $table->date('date');

            $table->enum('status', [
                'HADIR',
                'COR',
                'ALPHA'
            ]);

            $table->boolean('is_overtime')->default(false);

            $table->integer('daily_wage');

            $table->text('notes')->nullable();

            $table->timestamps();

            $table->unique([
                'worker_id',
                'date'
            ]);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('attendances');
    }
};