# Dev seed users

`php artisan db:seed --force` creates a small MVP test set.

All seeded users use the password `password`.

| Role | Email |
| --- | --- |
| Admin | `admin@example.com` |
| Client | `client@example.com` |
| Approved vendor | `vendor.approved@example.com` |
| Pending vendor | `vendor.pending@example.com` |

The approved vendor has active services and districts, so it should appear in search for matching Волгоград requests. The pending vendor is intentionally hidden from search until moderation.
