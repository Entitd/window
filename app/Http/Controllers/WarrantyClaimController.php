<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreWarrantyClaimRequest;
use App\Http\Requests\UpdateWarrantyClaimRequest;
use App\Models\ServiceRequest;
use App\Models\WarrantyClaim;
use App\Services\WarrantyClaimService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class WarrantyClaimController extends Controller
{
    public function store(StoreWarrantyClaimRequest $request, ServiceRequest $serviceRequest, WarrantyClaimService $claims): RedirectResponse
    {
        $claims->create($serviceRequest, $request->validated());

        return back();
    }

    public function update(UpdateWarrantyClaimRequest $request, ServiceRequest $serviceRequest, WarrantyClaim $warrantyClaim, WarrantyClaimService $claims): RedirectResponse
    {
        $claims->respond($warrantyClaim, $request->user(), $request->validated());

        return back();
    }

    public function escalate(Request $request, ServiceRequest $serviceRequest, WarrantyClaim $warrantyClaim, WarrantyClaimService $claims): RedirectResponse
    {
        $claims->escalate($warrantyClaim, $request->user());

        return back();
    }
}
