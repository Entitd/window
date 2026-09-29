<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('service_categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('parent_id')->nullable()->constrained('service_categories')->restrictOnDelete();
            $table->string('name');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::table('services', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->constrained('service_categories')->restrictOnDelete();
            $table->unsignedInteger('sort_order')->default(0);
        });
        Schema::create('service_parameters', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->restrictOnDelete();
            $table->string('key', 80);
            $table->string('name');
            $table->string('type', 20);
            $table->string('unit', 30)->nullable();
            $table->boolean('is_required')->default(false);
            $table->decimal('min_value', 14, 4)->nullable();
            $table->decimal('max_value', 14, 4)->nullable();
            $table->json('choices')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['service_id', 'key']);
        });
        Schema::create('service_options', function (Blueprint $table) {
            $table->id();
            $table->foreignId('service_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('input_type', 20);
            $table->string('pricing_type', 20);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
        Schema::table('vendor_services', function (Blueprint $table) {
            $table->foreignId('service_id')->nullable()->constrained()->restrictOnDelete();
            $table->unique(['vendor_id', 'service_id']);
        });
        Schema::create('vendor_service_rates', function (Blueprint $table) {
            $table->id();
            $table->foreignId('vendor_service_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_option_id')->constrained()->restrictOnDelete();
            $table->decimal('price', 10, 2)->nullable();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->unique(['vendor_service_id', 'service_option_id']);
        });
        Schema::create('request_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->cascadeOnDelete();
            $table->foreignId('service_id')->constrained()->restrictOnDelete();
            $table->foreignId('service_option_id')->constrained()->restrictOnDelete();
            $table->string('service_name');
            $table->string('option_name');
            $table->string('pricing_type', 20);
            $table->unsignedInteger('quantity');
            $table->unsignedInteger('width_mm')->nullable();
            $table->unsignedInteger('height_mm')->nullable();
            $table->decimal('unit_price', 10, 2)->nullable();
            $table->decimal('total_price', 10, 2)->nullable();
            $table->timestamps();
        });
        Schema::create('request_item_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_item_id')->constrained()->cascadeOnDelete();
            $table->foreignId('service_parameter_id')->constrained()->restrictOnDelete();
            $table->string('name');
            $table->string('type', 20);
            $table->string('unit', 30)->nullable();
            $table->text('text_value')->nullable();
            $table->decimal('number_value', 14, 4)->nullable();
            $table->boolean('boolean_value')->nullable();
            $table->timestamps();
            $table->unique(['request_item_id', 'service_parameter_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('request_item_values');
        Schema::dropIfExists('request_items');
        Schema::dropIfExists('vendor_service_rates');
        Schema::table('vendor_services', function (Blueprint $table) {
            $table->dropUnique(['vendor_id', 'service_id']);
            $table->dropConstrainedForeignId('service_id');
        });
        Schema::dropIfExists('service_options');
        Schema::dropIfExists('service_parameters');
        Schema::table('services', function (Blueprint $table) {
            $table->dropConstrainedForeignId('category_id');
            $table->dropColumn('sort_order');
        });
        Schema::dropIfExists('service_categories');
    }
};
