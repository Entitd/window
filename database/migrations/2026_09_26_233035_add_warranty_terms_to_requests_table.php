<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('requests', function (Blueprint $table): void {
            $table->json('warranty_terms')->nullable();
        });

        DB::table('requests')->whereNotNull('vendor_id')->orderBy('id')->chunkById(100, function ($requests): void {
            foreach ($requests as $request) {
                $vendor = DB::table('vendors')->find($request->vendor_id);
                if (! $vendor) {
                    continue;
                }
                $service = DB::table('services')->find($request->service_id);
                $offering = DB::table('vendor_services')->where('vendor_id', $vendor->id)
                    ->where(function ($query) use ($request, $service): void {
                        $query->where('service_id', $request->service_id)
                            ->orWhere(fn ($legacy) => $legacy->whereNull('service_id')->where('service_name', $service?->name));
                    })->first();
                DB::table('requests')->where('id', $request->id)->update([
                    'warranty_terms' => json_encode([
                        'months' => $offering?->warranty_months,
                        'description' => $vendor->warranty_description,
                        'company_name' => $vendor->company_name,
                        'contact_phone' => $vendor->phone,
                        'contact_email' => $vendor->email,
                    ], JSON_THROW_ON_ERROR),
                ]);
            }
        });
    }

    public function down(): void
    {
        Schema::table('requests', function (Blueprint $table): void {
            $table->dropColumn('warranty_terms');
        });
    }
};
