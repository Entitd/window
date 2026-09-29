<?php

namespace App\Services;

use App\Models\Vendor;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VendorLogoManager
{
    public function update(Vendor $vendor, UploadedFile $logo): void
    {
        $previousLogo = $vendor->logo;

        $vendor->logo = $logo->store('vendor-logos', 'public');

        $vendor->save();

        if (Str::startsWith($previousLogo ?? '', 'vendor-logos/')) {
            Storage::disk('public')->delete($previousLogo);
        }
    }
}
