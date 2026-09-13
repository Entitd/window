<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('service_request_amendments', function (Blueprint $table) {
            $table->boolean('client_accepted')->nullable()->after('status');
            $table->timestamp('client_decided_at')->nullable()->after('client_accepted');
            $table->boolean('vendor_accepted')->nullable()->after('client_decided_at');
            $table->timestamp('vendor_decided_at')->nullable()->after('vendor_accepted');
        });

        DB::table('service_request_amendments')
            ->where('proposed_by_role', 'client')
            ->update(['client_accepted' => true]);

        DB::table('service_request_amendments')
            ->where('proposed_by_role', 'vendor')
            ->update(['vendor_accepted' => true]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('service_request_amendments', function (Blueprint $table) {
            $table->dropColumn([
                'client_accepted',
                'client_decided_at',
                'vendor_accepted',
                'vendor_decided_at',
            ]);
        });
    }
};
