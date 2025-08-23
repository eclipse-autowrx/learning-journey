# Certificates & Operational Flow Plan

## Goals
- Issue verifiable certificates upon path completion
- Keep issuance idempotent and auditable
- Provide verification endpoint and downloadable artifact

## Model: Certificate (new)
- `user_id: ObjectId`
- `path_id: ObjectId`
- `certificate_id: string` (short, unique for public URL)
- `verify_code: string` (random code/UUID)
- `issued_at: Date`
- `revoked_at?: Date`
- `metadata: {
    user_name?: string,
    path_name?: string,
    template?: string,
    locale?: string,
    extra?: Mixed
  }`
- Indexes: `{ user_id: 1, path_id: 1 }` (unique), `{ certificate_id: 1 }` (unique)

## APIs (new)
- `POST /api/paths/:path_id/certificates` — issue for current user if eligible
  - Preconditions: `PathProgress.state === 'completed'`
  - Idempotent: if exists, return existing
- `GET /api/paths/:path_id/certificates/me` — my certificate for this path
- `GET /api/certificates/:certificate_id` — public verify endpoint (no auth)

## Issuance flow
- Trigger: PathProgress transitions to `completed` (domain event `path.completed`)
- Steps:
  1. Check existing certificate (idempotency)
  2. Create new document, generate `certificate_id` and `verify_code`
  3. Render PDF (Puppeteer/Playwright) using template and metadata
  4. Store PDF (S3/local) and set `asset_url`
  5. Append audit record to Course/Path progress: `issue_certificate`

## Frontend UX
- On completed path page: Show "Get Certificate" button
- After issuance: show certificate preview link, download PDF, and public verify link
- Optional: Add to profile wallet (list of certificates)

## Security / Validation
- Derive `user_id` from auth; validate `path_id`
- Rate-limit issuance endpoint; protect from spamming
- Verification endpoint must not leak PII beyond what is displayed on certificate

## Observability
- Log issuance events with metadata (user, path, time)
- Optional: webhook to CRM/LMS when issued

## Tests
- Idempotent issuance
- Verify forbidden when not completed
- Public verify returns expected payload

## Roadmap extras
- Badges (Open Badges 2.0)
- Share to LinkedIn/credly integration
- Multilingual templates
- Revocation support and re-issue with new template