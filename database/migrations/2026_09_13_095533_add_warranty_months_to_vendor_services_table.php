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
        Schema::table('vendor_services', function (Blueprint $table) {
            $table->unsignedSmallInteger('warranty_months')->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('vendor_services', function (Blueprint $table) {
            $table->dropColumn('warranty_months');
        });
    }
};
