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
        Schema::create('service_request_amendments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_request_id')->constrained('requests')->cascadeOnDelete();
            $table->foreignId('proposed_by_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('proposed_by_role');
            $table->json('changes');
            $table->string('status')->default('pending')->index();
            $table->foreignId('decided_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('decided_at')->nullable();
            $table->timestamps();

            $table->index(['service_request_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_request_amendments');
    }
};
