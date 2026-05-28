# Veetu Vadagai — House Rental Management Platform

Veetu Vadagai (வீட்டு வாடகை) is a production-oriented full-stack rental management SaaS for property owners, tenants, and administrators.

## Stack

- Backend: Java 21, Spring Boot 3.5.6, Spring Security, JWT/refresh tokens, Spring Data JPA/Hibernate, Flyway, PostgreSQL, OpenAPI.
- Frontend: React, Vite, Tailwind CSS, shadcn-inspired components, TanStack Query, Zustand, React Router, Recharts, Framer Motion.
- DevOps: Dockerfiles, Docker Compose, Nginx reverse proxy, env-first configuration.

## Core capabilities

- Role-based authentication for `OWNER`, `TENANT`, and `ADMIN`.
- BCrypt password hashing, JWT access tokens, refresh tokens, CORS, validation, global exception responses.
- Owner dashboard with properties, tenants, pending dues, monthly revenue, occupied/vacant stats, and charts.
- Property management with normalized PostgreSQL schema and soft-delete support.
- Tenant onboarding, KYC/document URL fields, agreement lifecycle model.
- Rent, advance, maintenance, EB, and water payment model with Razorpay order/webhook structure.
- Invoice/receipt download endpoint and cloud-storage-ready file URL fields.
- Notification model plus WebSocket broker endpoint for real-time reminders.
- Admin analytics, user listing, and scalable module structure.

## Repository layout

```text
backend/                 Spring Boot REST API
frontend/                React + Vite dashboard and landing page
ops/nginx/               Reverse proxy configuration
postman/                 Postman collection
docker-compose.yml       Local production-like stack
```

## Quick start with Docker

```bash
docker compose up --build
```

Open:

- Frontend: http://localhost:5173
- API: http://localhost:8080/api/v1
- Swagger UI: http://localhost:8080/swagger-ui.html
- Reverse proxy: http://localhost:8088

## Local backend setup

```bash
cd backend
cp .env.example .env
mvn spring-boot:run
```

The backend expects PostgreSQL at `jdbc:postgresql://localhost:5432/veetu_vadagai` unless `DB_URL` is overridden.

## Local frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

## Seed users

Flyway inserts demo users for local exploration:

| Role | Email |
| --- | --- |
| Owner | owner@veetu.test |
| Tenant | tenant@veetu.test |
| Admin | admin@veetu.test |

The application supports creating new users via `/api/v1/auth/register`.

## Important environment variables

Backend:

- `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET` — use at least 64 random characters in production
- `CORS_ORIGINS`
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- `MAIL_HOST`, `MAIL_PORT`

Frontend:

- `VITE_API_URL`

## API modules

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/forgot-password`
- `POST /api/v1/auth/reset-password`
- `GET /api/v1/properties`
- `GET /api/v1/properties/all`
- `POST/PUT/DELETE /api/v1/properties`
- `GET/POST/DELETE /api/v1/properties/{propertyId}/images`
- `GET/POST/PUT/DELETE /api/v1/tenants`
- `GET /api/v1/tenants/me`
- `GET/POST /api/v1/payments`
- `PATCH /api/v1/payments/{id}/success`
- `PATCH /api/v1/payments/{id}/refund`
- `POST /api/v1/payments/{id}/reminders`
- `POST /api/v1/payments/razorpay/webhook`
- `GET /api/v1/invoices`
- `GET /api/v1/invoices/{paymentId}/pdf`
- `GET /api/v1/notifications`
- `GET /api/v1/notifications/unread-count`
- `PATCH /api/v1/notifications/{id}/read`
- `GET/POST/PUT/DELETE /api/v1/agreements`
- `GET /api/v1/dashboard/owner|tenant|admin`
- `GET /api/v1/users/me`
- `PATCH /api/v1/users/me`
- `PATCH /api/v1/users/me/password`
- `GET/PUT /api/v1/owners/me`

## Frontend routes

- `/login`, `/register`
- `/owner`, `/tenant`, `/admin`
- `/properties`, `/tenants`, `/payments`, `/invoices`, `/agreements`
- `/notifications`, `/settings`

## Production hardening checklist

1. Replace demo secrets with values from a secret manager.
2. Configure SMTP, Razorpay live credentials, object storage, and SMS/WhatsApp providers.
3. Put Nginx or a cloud load balancer behind TLS.
4. Enable managed PostgreSQL backups and observability.
5. Add distributed rate limiting (Redis-backed Bucket4j or gateway policy) for multi-instance deployments.
6. Wire PDF generation to a branded template and persistent object storage.
7. Add CI jobs for Maven tests, frontend build, container scan, and dependency audit.

## Postman

Import `postman/Veetu-Vadagai.postman_collection.json`, call login, copy the `accessToken` into the `token` collection variable, then call protected endpoints.
