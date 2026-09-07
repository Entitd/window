<?php

namespace App\Http\Requests;

use App\Models\ServiceCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Validator;

class SaveServiceCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->role === 'admin';
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'parent_id' => ['nullable', 'integer', 'exists:service_categories,id'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['required', 'boolean'],
        ];
    }

    public function after(): array
    {
        return [function (Validator $validator): void {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }
            $category = $this->route('category');
            $parents = ServiceCategory::pluck('parent_id', 'id');
            $parent = $this->input('parent_id');
            $visited = [];
            while ($parent) {
                if (isset($visited[$parent]) || ($category && (int) $parent === $category->id)) {
                    $validator->errors()->add('parent_id', 'Категория не может быть вложена в себя или своего потомка.');

                    return;
                }
                $visited[$parent] = true;
                $parent = $parents[$parent] ?? null;
            }
        }];
    }
}
