<?php

namespace App\Services;

use App\Models\ServiceRequest;
use App\Models\ServiceRequestWarranty;
use App\Models\Vendor;
use App\Models\VendorService;
use Illuminate\Validation\ValidationException;

class WarrantyIssuer
{
    public function issue(ServiceRequest $serviceRequest, Vendor $vendor): ServiceRequestWarranty
    {
        $warrantyMonths = VendorService::query()
            ->where('vendor_id', $vendor->id)
            ->where('service_id', $serviceRequest->service_id)
            ->value('warranty_months');

        if (! $warrantyMonths || ! $vendor->hasWarrantyDescription()) {
            throw ValidationException::withMessages([
                'warranty' => 'Перед завершением заявки заполните срок гарантии у услуги и условия гарантии в профиле компании.',
            ]);
        }

        $startsAt = today();

        return ServiceRequestWarranty::firstOrCreate(
            ['service_request_id' => $serviceRequest->id],
            [
                'vendor_id' => $vendor->id,
                'company_name' => $vendor->company_name,
                'contact_phone' => $vendor->phone,
                'contact_email' => $vendor->email,
                'starts_at' => $startsAt,
                'expires_at' => $startsAt->copy()->addMonthsNoOverflow($warrantyMonths),
                'description' => $vendor->warranty_description,
            ],
        );
    }
}
