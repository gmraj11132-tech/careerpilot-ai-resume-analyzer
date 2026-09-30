# Security Documentation

## Threat Model

CareerPilot is designed to process sensitive user data (resumes, personal details). The primary threats considered are:
- Unauthorized access to user accounts.
- Data breaches leaking resume or profile information.
- Malicious file uploads (e.g., executing scripts via resume uploads).
- Injection attacks (SQL/NoSQL injection, XSS).

## Authentication & Cryptography

- **Password Hashing:** Passwords are never stored in plaintext. We utilize PBKDF2 with 100,000 iterations and the SHA-512 algorithm for secure password hashing.
- **Tokens:** Authentication is maintained via JSON Web Tokens (JWT) signed using the HS256 algorithm.
- **Storage:** JWTs are stored in HTTP-only, Secure (in production), SameSite cookies to mitigate Cross-Site Scripting (XSS) risks related to token theft.

## Authorization

- **User-Scoped Data Access:** All API routes interacting with personal data ensure that the requesting user can only access their own resources (resumes, applications).
- **Admin Roles:** Specific administrative endpoints check for an 'admin' role within the validated JWT before granting access.

## Input Validation

- All incoming data across API routes is strictly validated using **Zod** schemas. This prevents malformed data from causing application errors or security vulnerabilities and mitigates injection risks.

## File Upload Security

Resume uploads represent a significant attack vector. Defenses include:
- **Type Validation:** Only specific MIME types (e.g., `application/pdf`, `text/plain`) are permitted.
- **Size Limits:** Hard limits (e.g., 5MB) are enforced on file uploads to prevent Denial of Service (DoS) via disk exhaustion.
- **Filename Sanitization:** Uploaded filenames are sanitized, and internal references are often replaced with UUIDs to prevent directory traversal attacks (e.g., `../../../etc/passwd`).

## Secret Management

- Environment variables containing sensitive information (database credentials, API keys) are stored in `.env` files.
- `.env` files are strictly added to `.gitignore` and **never committed** to the repository.
- The `AUTH_SECRET` environment variable is explicitly required for the application to boot safely.

## Data Protection

- No plaintext passwords exist in the database or logs.
- Admin statistics and logs are scrubbed of Personally Identifiable Information (PII) to prevent accidental exposure.

## Security Headers

The application utilizes secure HTTP headers (configured via `next.config.js` or middleware):
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY` or `SAMEORIGIN`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## Known Limitations

- **Rate Limiting:** Currently, rate limiting is not implemented in the local development environment. It is strongly recommended to configure rate limiting at the infrastructure level (e.g., via Vercel or an API gateway) in production.
- **Deployment:** The architecture assumes a single-server or stateless serverless deployment. Shared local file storage for resumes is not suitable for multi-server deployments without moving to object storage (like AWS S3).

## Responsible Disclosure

If you discover a security vulnerability within CareerPilot, please do not disclose it publicly. Email the maintainers directly to coordinate a fix.
