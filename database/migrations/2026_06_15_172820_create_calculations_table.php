<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('calculations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('city');
            $table->string('district')->nullable();
            $table->date('installation_date')->nullable();
            $table->unsignedInteger('window_width');
            $table->unsignedInteger('window_height');
            $table->string('service_type');
            $table->json('additional_services')->nullable();
            $table->text('comment')->nullable();
            $table->decimal('estimated_price', 10, 2)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calculations');
    }
};
