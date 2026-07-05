# MVP task list

Project: Laravel + Inertia/React service for window glass package installation and replacement.

Goal: make the product usable end to end, not just visually complete.

Working definition of MVP:

- A client can register, create a request, choose an approved vendor, and track the request status.
- A vendor can register, pass moderation, manage services, receive client requests, and change request status.
- An admin can approve or reject vendors.
- Main public pages open without broken layout or obvious placeholder content.
- Main flows work on a clean database after migrations and seeders.

## Current known state

- Home page exists.
- Search results use approved vendors from the database.
- Client request creation is connected to the backend.
- Client dashboard reads real current-user requests.
- Admin vendor moderation exists.
- Vendor services are connected to real database records.
- Vendor dashboard uses real assigned requests, real vendor profile, and real vendor services.
- Vendor requests page reads real requests assigned to the authenticated vendor.
- Request status actions are wired for vendor and client MVP flow.
- Request status history is stored in the database and shown on client request pages.
- Vendor dashboard uses real assigned requests for stats, priority list, and status board.
- Vendor profile editing saves real company profile fields.
- Client request detail supports real edit, cancel, and repeat actions.
- Public/legal pages have temporary MVP copy aligned with current behavior.

## Task 1: Real vendor requests page

Status: done on 2026-06-29.

Priority: highest.

Route: `/vendor/requests`

Files likely involved:

- `routes/web.php`
- `app/Http/Controllers/VendorRequestController.php`
- `app/Models/ServiceRequest.php`
- `resources/js/pages/vendor/requests.tsx`
- `resources/js/lib/dashboard-mock.ts`

Work:

- Create a controller for vendor requests.
- Load only requests assigned to the authenticated vendor.
- Pass real requests to `vendor/requests.tsx`.
- Replace mock lead list with Inertia props.
- Keep filters by status: new, confirmed, in progress, completed, rejected.
- Add empty states for no requests.
- Add protection so vendors cannot see other vendors' requests.

Done when:

- A vendor sees real assigned client requests.
- Mock data is not the primary source for this page.
- Filters work with real data.
- Page opens on desktop and mobile.

Result:

- Added `VendorRequestController@index`.
- Replaced the static Inertia route with a controller route.
- `/vendor/requests` now loads only requests assigned to the authenticated vendor.
- `resources/js/pages/vendor/requests.tsx` now uses Inertia `requests` props instead of `vendorLeads`.
- Status action buttons intentionally remain disabled until Task 2.

Verification:

- Passed: `php artisan route:list --name=vendor.requests`
- Passed: `php -l app/Http/Controllers/VendorRequestController.php`
- Passed: `php -l routes/web.php`
- Passed: `npm run build`
- Passed: `npm run types:check`
- Not run yet: manual client-to-vendor browser flow. It is more useful after Task 2 wires status actions.

## Task 2: Request status actions

Status: done on 2026-06-29.

Priority: highest.

Routes to add or confirm:

- Vendor accepts request.
- Vendor rejects request.
- Vendor marks request in progress.
- Vendor completes request.
- Client cancels request.

Files likely involved:

- `routes/web.php`
- `app/Http/Controllers/ClientRequestController.php`
- `app/Http/Controllers/VendorRequestController.php`
- `app/Models/ServiceRequest.php`
- `resources/js/pages/client/request-show.tsx`
- `resources/js/pages/client/dashboard.tsx`
- `resources/js/pages/vendor/requests.tsx`

Work:

- Define allowed statuses: `new`, `confirmed`, `in_progress`, `completed`, `rejected`, `cancelled`.
- Add backend actions for each status transition.
- Validate ownership and role before changing status.
- Wire buttons in client and vendor UI to real backend actions.
- Disable or hide actions that are not allowed for the current status.
- Add success/error feedback through Inertia.

Done when:

- Vendor can accept/reject/start/complete a request.
- Client can cancel a request when status allows it.
- Status updates are visible on client dashboard, client request page, vendor dashboard, and vendor requests page.

Result:

- Added vendor request status routes:
  - accept: `new` -> `confirmed`
  - reject: `new|confirmed` -> `rejected`
  - start: `confirmed` -> `in_progress`
  - complete: `in_progress` -> `completed`
- Added client cancel route: `new|awaiting_confirmation|confirmed` -> `cancelled`
- Added role/ownership checks before status changes.
- Wired `/vendor/requests` buttons to real PATCH actions.
- Wired client dashboard and client request detail cancel buttons to real PATCH action.
- Added frontend support for `rejected` request status.

Verification:

- Passed: `php -l app/Http/Controllers/VendorRequestController.php`
- Passed: `php -l app/Http/Controllers/ClientRequestController.php`
- Passed: `php -l routes/web.php`
- Passed: `php artisan route:list --name=vendor.requests`
- Passed: `php artisan route:list --name=client.requests`
- Passed: `npm run build`
- Passed: `npm run types:check`
- Not run yet: manual full browser flow. Do this after Task 3 adds real history so the user can verify the complete lifecycle in one pass.

## Task 3: Request history

Status: done on 2026-06-29.

Priority: high.

Files likely involved:

- new migration for request status history
- new model, for example `ServiceRequestStatusHistory`
- `ClientRequestController`
- `VendorRequestController`
- `resources/js/pages/client/request-show.tsx`

Work:

- Add a table for request status history.
- Write a history row when a request is created.
- Write a history row when status changes.
- Show real history on the client request detail page.
- Optionally show short history/details in vendor request details.

Done when:

- Client sees real timeline, not generated placeholder history.
- Each status action creates a history entry.

Result:

- Added `service_request_status_histories` table.
- Added `ServiceRequestStatusHistory` model.
- Added `ServiceRequest::statusHistories()` relation.
- New client requests now create an initial history entry.
- Client cancellation writes a history entry.
- Vendor accept/reject/start/complete actions write history entries.
- Client dashboard and request detail now serialize real history, with fallback for old requests that have no history yet.

Verification:

- Passed: `php artisan migrate --force`
- Passed: PHP lint for the new migration, new model, `ServiceRequest`, `ClientRequestController`, and `VendorRequestController`
- Passed: `php artisan route:list --name=client.requests`
- Passed: `php artisan route:list --name=vendor.requests`
- Passed: `npm run build`
- Passed: `npm run types:check`
- Not run yet: manual browser status-flow inspection.

## Task 4: Real vendor dashboard stats and leads

Status: done on 2026-06-29.

Priority: high.

Route: `/vendor/dashboard`

Files likely involved:

- `app/Http/Controllers/VendorDashboardController.php`
- `resources/js/pages/vendor/dashboard.tsx`
- `resources/js/lib/dashboard-mock.ts`

Work:

- Load real assigned requests for the current vendor.
- Compute stats from database requests.
- Replace mock leads with real latest/new requests.
- Keep real vendor profile and real vendor services already passed by the controller.
- Keep mock fallback only if useful for empty UI states, not as business data.

Done when:

- Vendor dashboard reflects the same requests as `/vendor/requests`.
- Counters change when request statuses change.
- Text no longer says or implies mock data.

Result:

- `VendorDashboardController@index` now loads real requests assigned to the authenticated vendor.
- Dashboard receives `vendorRequests` Inertia props.
- `resources/js/pages/vendor/dashboard.tsx` no longer imports or uses `vendorLeads`.
- Top stats, priority requests, and status board are computed from real vendor requests.
- Added honest empty state when the vendor has no assigned requests.
- Replaced dead priority-card action buttons with a link to the real request queue.

Verification:

- Passed: `php -l app/Http/Controllers/VendorDashboardController.php`
- Passed: `php artisan route:list --name=vendor.dashboard`
- Passed: `npm run build`
- Passed: `npm run types:check`
- Not run yet: manual browser check that status changes update dashboard counters.

## Task 5: Client request actions

Status: done on 2026-06-29.

Priority: high.

Routes:

- `/client/dashboard`
- `/client/requests/{id}`

Files likely involved:

- `ClientRequestController`
- `resources/js/pages/client/dashboard.tsx`
- `resources/js/pages/client/request-show.tsx`

Work:

- Wire "cancel request" to backend.
- Decide whether "edit request" is needed for MVP.
- If editing is included, build a simple edit form for allowed statuses only.
- Wire "repeat request" to prefill a new request or create a copy safely.
- Remove fake/demo fallback behavior where it can hide real bugs.

Done when:

- Client can manage their own request without dead buttons.
- Client cannot edit/cancel requests in disallowed statuses.

Result:

- Client cancellation was already wired during Task 2 and remains status-protected.
- Added `ClientRequestController@update` for editing own requests while status is `new` or `awaiting_confirmation`.
- Added `ClientRequestController@repeat` for creating a new request from an existing client request.
- Added routes:
  - `PATCH /client/requests/{serviceRequest}`
  - `POST /client/requests/{serviceRequest}/repeat`
- Client request details now include raw edit values for date, district, and comment.
- `/client/requests/{id}` now shows a real edit form for editable requests.
- `/client/dashboard` and request detail repeat buttons now create real copied requests instead of linking to the home page.
- Edit and repeat actions write request history entries.

Verification:

- Passed: `php -l app/Http/Controllers/ClientRequestController.php`
- Passed: `php -l routes/web.php`
- Passed: `php artisan route:list --name=client.requests`
- Passed: `npm run build`
- Passed: `npm run types:check`
- Not run yet: manual browser client request lifecycle.

## Task 6: Real vendor profile editing

Status: done on 2026-06-29.

Priority: high.

Route: `/vendor/profile`

Files likely involved:

- `routes/web.php`
- new or existing vendor profile controller
- `app/Models/Vendor.php`
- `resources/js/pages/vendor/profile.tsx`
- storage/filesystem config if uploading images

Work:

- Load real vendor profile data.
- Save company name, description, phone, email, city, districts.
- Add moderation status block using real data.
- Add logo upload or keep initials for MVP if file upload is too much.
- Add work photos upload only if it can be done cleanly; otherwise leave a clear post-MVP note.
- Decide whether profile edits reset moderation to pending.

Done when:

- Vendor can update company profile and see saved data after reload.
- Moderation status is real.
- Page does not depend on mock vendor profile data.

Result:

- Added `VendorProfileController` with edit/update actions.
- Replaced static `/vendor/profile` Inertia route with controller-backed GET/PATCH routes.
- `resources/js/pages/vendor/profile.tsx` now uses real `vendorProfile` and `vendorServices` props.
- Vendor can save company name, city, phone, email, districts, description, and logo/initials text.
- District strings are synced to real `districts` and `vendor_districts` records.
- Vendor user phone/email are kept in sync with the company profile.
- If an approved vendor changes profile data, the profile is moved back to `pending` moderation with a moderation note.
- File upload/gallery remains intentionally out of scope for this MVP task.

Verification:

- Passed: `php -l app/Http/Controllers/VendorProfileController.php`
- Passed: `php -l routes/web.php`
- Passed: `php artisan route:list --name=vendor.profile`
- Passed: `npm run build`
- Passed: `npm run types:check`
- Not run yet: manual browser save/reload check.

## Task 7: Search filtering and honest vendor cards

Status: done on 2026-06-30.

Priority: medium-high.

Route: `/search-results`

Files likely involved:

- `SearchResultsController`
- `resources/js/pages/search-results.tsx`
- `resources/js/lib/okna-market.ts`
- vendor services and districts models

Work:

- Pass request/search parameters from the form to `/search-results`.
- Filter vendors by selected service.
- Filter vendors by district/city when possible.
- Use active vendor services only.
- Calculate price from vendor service price instead of fake multiplier where possible.
- Remove or clearly simplify fake rating/reviews/nearest date until real data exists.
- Keep sorting meaningful: price first, matching service, maybe newest vendor.

Done when:

- Search results match the client's selected service and location.
- Vendor cards show honest data from DB or clearly neutral text.
- Selecting a vendor sends a valid `vendor_id`.

Verification:

- Manual: create two vendors with different services and confirm search returns the right one.
- `npm run build`
- `npm run types:check`

Result:

- `SearchResultsController` now reads search parameters, maps `serviceKey` to the service name, and filters approved vendors by active matching vendor service.
- Search results now filter by city and by district when the form location includes a district.
- Vendor cards now serialize honest DB-backed fields: matched service name, vendor service price label, districts, active-service count, moderation badge, neutral availability, and neutral reviews text.
- Removed the unused mock company catalog from `resources/js/lib/okna-market.ts`.
- `/search-results` no longer sorts or filters by fake rating/date data.
- Selecting a company sends the real `vendor_id`.
- `ClientRequestController@store` now rejects a selected vendor if the vendor does not have the requested active service or does not work in the selected district.

Verification:

- Passed: `php -l app/Http/Controllers/SearchResultsController.php`
- Passed: `php -l app/Http/Controllers/ClientRequestController.php`
- Passed: `php artisan route:list --name=search-results`
- Passed: `npm run types:check`
- Passed: `npm run build`
- Not run yet: manual two-vendor browser/data scenario.

## Task 8: Auth roles and redirects

Status: done on 2026-06-30.

Priority: medium-high.

Files likely involved:

- Fortify actions/providers
- registration controllers
- middleware if needed
- `routes/web.php`
- sidebar/navigation components

Work:

- Confirm client registration creates `role = client`.
- Confirm vendor registration creates `role = vendor` and a related vendor record.
- Confirm admin seeding creates an admin user.
- Redirect users after login to the correct dashboard.
- Prevent clients from vendor/admin pages.
- Prevent vendors from client/admin pages.
- Prevent non-admins from moderation pages.
- Adjust sidebar links by role.

Done when:

- Role-based navigation and access are predictable.
- Wrong-role pages return 403 or redirect cleanly.

Verification:

- Manual login as admin, vendor, client.
- `php artisan route:list`
- `npm run build`

Result:

- Added `EnsureUserHasRole` middleware and registered the `role` middleware alias.
- `/dashboard` is now a role-aware redirect:
  - admin -> `/admin/vendors/moderation`
  - vendor -> `/vendor/dashboard`
  - client -> `/client/dashboard`
- Admin routes now require `role:admin`.
- Client dashboard/request routes now require `role:client`.
- Vendor dashboard/profile/services/requests routes now require `role:vendor`.
- Custom client registration already creates `role = client` and redirects to the client dashboard.
- Custom vendor registration already creates `role = vendor`, creates the related vendor profile, and redirects to the vendor dashboard.
- Sidebar navigation now shows role-specific sections for admin, client, and vendor users.

Verification:

- Passed: `php -l app/Http/Middleware/EnsureUserHasRole.php`
- Passed: `php -l bootstrap/app.php`
- Passed: `php -l routes/web.php`
- Passed: `php artisan route:list --name=admin.vendors.moderation -v` shows `role:admin`.
- Passed: `php artisan route:list --name=vendor.dashboard -v` shows `role:vendor`.
- Passed: `php artisan route:list --name=client.dashboard -v` shows `role:client`.
- Passed: `npm run types:check`
- Passed: `npm run build`
- Passed: `git diff --check`
- Not run yet: manual browser login as admin, vendor, and client.

## Task 9: Admin moderation polish

Status: done on 2026-06-30.

Priority: medium.

Route: `/admin/vendors/moderation`

Files likely involved:

- `AdminVendorModerationController`
- `resources/js/pages/admin/vendor-moderation.tsx`
- sidebar/navigation

Work:

- Confirm approve/reject actions work.
- Confirm rejected vendors get a visible moderation note.
- Confirm approved vendors appear in search results only when they have active services.
- Add admin navigation link if missing.
- Keep this minimal; no full admin panel yet.

Done when:

- Admin can reliably moderate vendors for MVP.

Verification:

- Register vendor, approve, check search.
- Reject vendor, check vendor dashboard message.

Result:

- Confirmed admin moderation routes are protected by `role:admin`.
- `AdminVendorModerationController` now loads vendor services for each moderation card.
- Admin moderation cards now show:
  - total vendor services;
  - active vendor services;
  - active service names and prices;
  - whether an approved vendor can appear in public search.
- Existing approve/reject backend actions remain wired:
  - approve sets status to `approved`, moderation note, moderated timestamp, and moderator;
  - reject requires a moderation note and sets status to `rejected`.
- Rejected vendor notes are already passed through vendor dashboard/profile props as `moderationNote`.
- Search already requires `status = approved` and active matching vendor service, so approved vendors without active services stay out of results.

Verification:

- Passed: `php -l app/Http/Controllers/AdminVendorModerationController.php`
- Passed: `php artisan route:list --name=admin.vendors -v` shows admin moderation routes with `role:admin`.
- Passed: `php artisan route:list --name=search-results -v`
- Passed: `npm run types:check`
- Passed: `npm run build`
- Passed: `git diff --check`
- Not run yet: manual browser scenario registering vendor, approving/rejecting, and checking vendor dashboard/search.

## Task 10: Contacts page backend

Status: deferred on 2026-06-30. User wants to handle mailer/contact backend setup personally for now.

Priority: medium.

Route: `/contacts`

Files likely involved:

- `routes/web.php`
- new contact request controller/model/migration or mail action
- `resources/js/pages/contacts.tsx`

Work:

- Decide storage first: database is enough for MVP.
- Save contact form submissions.
- Validate name, contact, message.
- Show success/error state.
- Optionally add admin-only list later.

Done when:

- Contact form no longer silently does nothing.

Verification:

- Submit contact form and confirm saved row or sent mail.

## Task 11: Legal and public content cleanup

Status: done on 2026-06-30.

Priority: medium.

Routes:

- `/faq`
- `/privacy-policy`
- `/user-agreement`
- `/vendors`

Work:

- Remove lorem ipsum or obvious placeholders.
- Make privacy and agreement text acceptable as temporary Russian placeholder legal copy.
- Confirm `/vendors` CTA links to vendor registration.
- Confirm FAQ answers match the actual current product behavior.

Done when:

- Public pages no longer feel broken or fake.

Verification:

- Manual visual check on desktop and mobile.

Result:

- Rewrote FAQ content to match the current MVP behavior: real requests, editable/cancellable statuses, repeat request, vendor moderation, active services, and honest absence of ratings.
- Rewrote privacy policy as a temporary Russian MVP document for current data flows: client requests, vendor profiles, moderation, role-protected cabinets, and search visibility.
- Rewrote user agreement as a temporary Russian MVP document: service role, request lifecycle, prices, moderation, statuses, and user/vendor responsibilities.
- Cleaned `/vendors` CTA section so it links to vendor registration and no longer references future registration/layout work or a protected vendor dashboard as a public CTA.
- Updated public marketing copy in `okna-market.ts` to avoid promising ratings, photos, guarantees, or unavailable date logic.
- Left `Task 10: Contacts page backend` untouched as requested.

Verification:

- Passed: public-content search for `lorem`, `ipsum`, `mock`, `placeholder`, `layout`, `будущ`, `X до Y`, fake date/rating/photo promises.
- Passed: `php artisan route:list --name=faq`
- Passed: `php artisan route:list --name=privacy`
- Passed: `php artisan route:list --name=agreement`
- Passed: `php artisan route:list --name=vendors`
- Passed: `npm run types:check`
- Passed: `npm run build`
- Passed: `git diff --check`
- Not run yet: manual visual check on desktop/mobile.

## Task 12: Remove or isolate mock data

Status: done on 2026-06-30.

Priority: medium.

Files likely involved:

- `resources/js/lib/dashboard-mock.ts`
- all imports from it

Work:

- Search for all mock imports.
- Replace business data with props from controllers.
- Keep only helpers like labels/status styling if useful.
- Rename helper file if it no longer contains mock data.

Done when:

- MVP flows do not depend on mock business records.
- Mock data cannot mask broken backend integration.

Verification:

- `rg "dashboard-mock|mock|Mock" resources/js app routes`
- `npm run build`
- `npm run types:check`

Result:

- Removed `resources/js/lib/dashboard-mock.ts`.
- Added `resources/js/lib/dashboard-format.ts` with only shared request/vendor types and label/variant helpers.
- Updated client dashboard, client request detail, vendor dashboard, vendor requests, and vendor profile pages to import helpers/types from `dashboard-format`.
- Removed client request fallback to mock request records.
- Removed vendor dashboard fallback to mock vendor profile and services.
- MVP dashboard/request/profile pages now show empty states or real Inertia props instead of silently falling back to demo business data.

Verification:

- Passed: `rg "dashboard-mock|mock|Mock" resources/js app routes` returns no matches.
- Passed: `npm run types:check`
- Passed: `npm run build`
- Passed: `git diff --check`

## Task 13: Seed data for manual testing

Status: done on 2026-06-30.

Priority: medium.

Files likely involved:

- `database/seeders/DatabaseSeeder.php`

Work:

- Seed admin user.
- Seed at least one client user.
- Seed at least two vendors: pending and approved.
- Seed active vendor services.
- Seed districts/services needed for search.
- Optionally seed one request for fast dashboard testing.

Done when:

- `php artisan migrate:fresh --seed` gives a useful local demo state.

Verification:

- Login credentials are documented in a local dev note or seeder comments.
- Manual flow works immediately after seed.

Result:

- Expanded `DatabaseSeeder` into an idempotent MVP seed set.
- Seeds catalog services used by the public form/search.
- Seeds Волгоград and active districts.
- Seeds four login users:
  - admin: `admin@example.com`
  - client: `client@example.com`
  - approved vendor: `vendor.approved@example.com`
  - pending vendor: `vendor.pending@example.com`
- All seeded users use password `password`.
- Seeds an approved vendor with active services and working districts.
- Seeds a pending vendor that should stay hidden from search until moderation.
- Seeds one assigned confirmed request with status history for client/vendor dashboard checks.
- Added `docs/dev-seed-users.md` with local credentials and seed behavior.

Verification:

- Passed: `php -l database/seeders/DatabaseSeeder.php`
- Passed: `php artisan db:seed --force`
- Passed: repeated `php artisan db:seed --force` without duplicate seed records for the core test users/vendors.
- Passed: `php artisan tinker --execute` check for four seed users, two seed vendors, and an existing client request.
- Passed: `npm run types:check`
- Passed: `npm run build`
- Passed: `git diff --check`
- Not run: `php artisan migrate:fresh --seed`, because that resets the local database and should be done only when the user wants a destructive clean-database check.

## Task 14: End-to-end manual MVP test

Priority: high before handoff.

Test flow:

- Run migrations and seeders on a clean database.
- Register a new vendor.
- Login as admin and approve vendor.
- Login as vendor and add active services.
- Register/login as client.
- Create a request.
- Choose the approved vendor.
- Confirm request appears in client dashboard.
- Confirm request appears in vendor requests.
- Vendor accepts request.
- Client sees accepted status.
- Vendor marks request in progress.
- Vendor completes request.
- Client sees completed status and history.

Done when:

- This full flow works without touching the database manually.

Verification commands:

- `php artisan migrate:fresh --seed`
- `php artisan route:list`
- `npm run build`
- `npm run types:check`

## Task 15: Final frontend QA

Priority: high before handoff.

Work:

- Check desktop and mobile for:
  - home
  - search results
  - client dashboard
  - client request details
  - vendor dashboard
  - vendor requests
  - vendor services
  - vendor profile
  - admin moderation
  - contacts
- Fix broken spacing, overflowing text, dead buttons, and confusing empty states.
- Keep the existing layout style.
- Do not globally redesign header/footer/navigation without approval.

Done when:

- Core pages look coherent and usable.
- No obvious layout break on mobile.

Verification:

- Browser/manual check.
- `npm run build`
- `npm run types:check`

## Task 16: Pre-launch cleanup

Priority: final.

Work:

- Remove debug/demo labels from production pages.
- Confirm `.env.example` has required variables.
- Confirm storage link if uploads are used.
- Confirm validation messages are understandable.
- Confirm database migrations run from zero.
- Confirm no private credentials are committed.
- Review git diff before final report.

Done when:

- Project is ready for the user to test as a real MVP.

Verification:

- `git status --short`
- `npm run build`
- `npm run types:check`
- key Laravel commands from the main brief

## Suggested working rule

When the user says "работай", take the first unfinished task from this file, complete it, verify it, then report:

- what was done;
- which files changed;
- what was verified;
- what remains next.
