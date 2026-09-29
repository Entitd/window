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
        Schema::table('requests', function (Blueprint $table) {
            $table->foreignId('replacement_request_id')->nullable()->constrained('requests')->nullOnDelete();
            $table->timestamp('assistance_requested_at')->nullable()->index();
            $table->text('assistance_note')->nullable();
            $table->index(['status', 'created_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table) {
            $table->dropForeign(['replacement_request_id']);
            $table->dropIndex(['status', 'created_at']);
            $table->dropColumn(['replacement_request_id', 'assistance_requested_at', 'assistance_note']);
        });
    }
};
