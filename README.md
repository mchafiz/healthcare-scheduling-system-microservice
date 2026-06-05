# Healthcare Scheduling System

Sistem penjadwalan layanan kesehatan berbasis microservice. Proyek ini dibangun untuk membuktikan konsep pemisahan tanggung jawab antar service, keamanan autentikasi berlapis, dan validasi aturan bisnis di level database.

![Tests](https://img.shields.io/badge/tests-59%20passed-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-70.8%25-yellow)
![Services](https://img.shields.io/badge/services-auth%20%7C%20schedule-blue)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![GraphQL](https://img.shields.io/badge/GraphQL-code--first-e10098)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)

---

## Arsitektur Sistem

![Arsitektur](https://mermaid.ink/img/Z3JhcGggVEQKICAgIEFbIkNsaWVudApQb3N0bWFuIC8gRnJvbnRlbmQiXSAtLT58IkdyYXBoUUwgSFRUUCJ8IEJbIlNjaGVkdWxlIFNlcnZpY2UKcG9ydCAzMDAyIl0KICAgIEIgLS0+fCJUQ1AgSW50ZXJuYWwifCBDWyJBdXRoIFNlcnZpY2UKcG9ydCAzMDAxIC8gMzAwMyJdCiAgICBCIC0tPnwiUHJpc21hIE9STSJ8IERbKCJzY2hlZHVsZV9kYiIpXQogICAgQyAtLT58IlByaXNtYSBPUk0ifCBFWygiYXV0aF9kYiIpXQogICAgRCAtLT4gRlsoIlBvc3RncmVTUUwKcG9ydCA1NDMyIildCiAgICBFIC0tPiBGCiAgICBzdHlsZSBBIGZpbGw6IzRBOTBEOSxjb2xvcjojZmZmCiAgICBzdHlsZSBCIGZpbGw6IzI3QUU2MCxjb2xvcjojZmZmCiAgICBzdHlsZSBDIGZpbGw6I0U3NEMzQyxjb2xvcjojZmZmCiAgICBzdHlsZSBEIGZpbGw6I0YzOUMxMixjb2xvcjojZmZmCiAgICBzdHlsZSBFIGZpbGw6I0YzOUMxMixjb2xvcjojZmZmCiAgICBzdHlsZSBGIGZpbGw6IzhFNDRBRCxjb2xvcjojZmZm)

### Kenapa Dipisah Jadi Dua Service?

Kalau semua fitur digabung dalam satu aplikasi, setiap kali ada bug di fitur penjadwalan, seluruh sistem termasuk autentikasi ikut terdampak. Dengan memisahkan Auth Service dan Schedule Service, kegagalan di satu service tidak meruntuhkan yang lain. Ini yang disebut **fault isolation** — prinsip dasar microservice.

Auth Service punya satu tanggung jawab: urusan identitas pengguna. Schedule Service punya satu tanggung jawab: urusan jadwal. Keduanya bisa dikembangkan, di-deploy, dan di-scale secara independen.

---

## Alur Autentikasi

![Auth Flow](https://mermaid.ink/img/c2VxdWVuY2VEaWFncmFtCiAgICBwYXJ0aWNpcGFudCBDIGFzIENsaWVudAogICAgcGFydGljaXBhbnQgUyBhcyBTY2hlZHVsZSBTZXJ2aWNlCiAgICBwYXJ0aWNpcGFudCBBIGFzIEF1dGggU2VydmljZQogICAgcGFydGljaXBhbnQgREIgYXMgUG9zdGdyZVNRTAoKICAgIEMtPj5BOiBtdXRhdGlvbiByZWdpc3Rlci9sb2dpbgogICAgQS0+PkRCOiBzaW1wYW4gdXNlciAocGFzc3dvcmQgZGktaGFzaCBiY3J5cHQpCiAgICBBLS0+PkM6IEpXVCBUb2tlbgoKICAgIEMtPj5TOiBHcmFwaFFMIHJlcXVlc3QgKyBCZWFyZXIgVG9rZW4KICAgIFMtPj5BOiBUQ1A6IHZhbGlkYXRlX3Rva2VuCiAgICBBLS0+PlM6IHZhbGlkICsgdXNlcklkCiAgICBTLT4+REI6IHF1ZXJ5L211dGF0ZSBkYXRhCiAgICBTLS0+PkM6IGhhc2lsIGRhdGE=)

### Kenapa Token Divalidasi di Auth Service, Bukan di Schedule Service Langsung?

Cara yang lebih sederhana adalah menyimpan JWT secret di Schedule Service dan memverifikasi token di sana tanpa memanggil Auth Service. Tapi ada dua masalah besar:

Pertama, JWT secret harus dibagikan ke semua service. Semakin banyak service yang tahu secret, semakin besar risiko kebocoran. Kalau satu service bocor, semua token di seluruh sistem bisa dipalsukan.

Kedua, kalau suatu saat kita perlu membatalkan token pengguna tertentu (misalnya akun dikompromikan), tidak ada cara untuk melakukannya karena verifikasi hanya berbasis signature, bukan state di server. Dengan validasi terpusat di Auth Service, kita punya satu tempat untuk menambahkan logika seperti token blacklist atau session invalidation di masa depan.

### Kenapa Pakai TCP Bukan HTTP untuk Komunikasi Antar Service?

HTTP biasa bisa dipakai, tapi artinya Schedule Service harus tahu URL Auth Service, handle timeout, retry, dan error HTTP secara manual. NestJS TCP transport mengabstraksi semua itu. Yang lebih penting, kode tidak bergantung pada protokol — kalau besok ingin ganti ke RabbitMQ atau Redis, hanya konfigurasi yang berubah, bukan kode handler-nya sama sekali.

---

## Keamanan

### Password — Kenapa Tidak Disimpan Langsung?

Password pengguna tidak pernah disimpan dalam bentuk aslinya. Sebelum disimpan ke database, password diproses menggunakan **bcrypt** — algoritma hashing satu arah dengan salt.

```
Password asli:  "password123"
Setelah bcrypt: "$2b$10$X9mC3vQ8Kz..."  ← tidak bisa dikembalikan ke aslinya
```

Salt rounds diset ke 10, artinya proses hashing diulang 2^10 = 1024 kali. Ini membuat serangan brute force jauh lebih lambat — tiap percobaan butuh ~100ms, bukan mikrodetik.

Kalau database bocor sekalipun, penyerang hanya mendapatkan hash yang tidak bisa dipakai untuk login di tempat lain.

### JWT — Kenapa Token Punya Waktu Kadaluarsa?

Token JWT yang tidak pernah expired adalah celah keamanan. Kalau token dicuri, penyerang bisa pakai selamanya. Dengan expiry 7 hari, dampak pencurian token terbatas hanya pada periode itu.

Payload token sengaja dibuat minimal — hanya menyimpan `userId` dan `email`. Tidak ada data sensitif di dalamnya, karena payload JWT bisa dibaca siapa saja (hanya signature-nya yang terenkripsi).

### Password Tidak Bisa Diambil Lewat API

Field `password` di entity User sengaja tidak diberi decorator `@Field()` pada GraphQL schema. Artinya field ini tidak terdaftar di schema — client tidak bisa memintanya sama sekali, bukan sekadar diabaikan tapi benar-benar tidak ada di kontrak API.

### Pesan Error yang Generik saat Login

Ketika login gagal, sistem selalu mengembalikan pesan `"Invalid credentials"` — baik kalau emailnya tidak ada maupun kalau passwordnya salah. Ini disengaja. Kalau sistemnya membedakan keduanya, penyerang bisa menggunakan perbedaan pesan tersebut untuk mengetahui email mana yang terdaftar (disebut **user enumeration attack**).

---

## Tech Stack

| Teknologi | Kegunaan | Kenapa Dipilih |
|---|---|---|
| NestJS | Framework backend | Struktur modular, DI built-in, dukungan microservice native |
| GraphQL Code First | API layer | Fleksibel, self-documenting, satu endpoint untuk semua operasi |
| Prisma ORM | Akses database | Type-safe, schema sebagai single source of truth |
| PostgreSQL 15 | Database | Relational, mature, support kompleks query |
| JWT | Autentikasi | Stateless, tidak butuh session store, scalable |
| bcrypt | Hash password | One-way, salt otomatis, tahan brute force |
| Docker + Compose | Containerisasi | Reproducible environment, mudah deploy |

---

## Penjelasan Library yang Digunakan

### `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
Ini tiga paket inti NestJS. `@nestjs/common` berisi semua decorator yang sering dipakai (`@Injectable`, `@Module`, `@Controller`, dll). `@nestjs/core` adalah engine dependency injection-nya. `@nestjs/platform-express` menghubungkan NestJS dengan Express sebagai HTTP server di balik layar — NestJS tidak langsung handle HTTP sendiri, tapi mendelegasikan ke Express.

### `@nestjs/graphql` dan `@nestjs/apollo`
`@nestjs/graphql` adalah integrasi GraphQL untuk NestJS — menyediakan decorator seperti `@Resolver`, `@Query`, `@Mutation`, `@ObjectType`, `@Field`. `@nestjs/apollo` adalah driver yang menghubungkan NestJS GraphQL dengan Apollo Server sebagai engine GraphQL-nya. Keduanya harus ada bersama.

### `@apollo/server` dan `graphql`
`@apollo/server` adalah implementasi Apollo Server versi 4 — ini yang benar-benar menjalankan GraphQL engine, parsing query, validasi schema, dan eksekusi resolver. `graphql` adalah library JavaScript resmi implementasi GraphQL spec — tanpa ini tidak ada yang bisa jalan.

### `@nestjs/microservices`
Paket yang menyediakan semua hal terkait microservice di NestJS: `Transport.TCP`, `ClientProxy`, `ClientsModule`, `@MessagePattern`, `@Payload`. Tanpa paket ini tidak ada komunikasi TCP antar service.

### `@nestjs/jwt`
Wrapper NestJS untuk library `jsonwebtoken`. Menyediakan `JwtModule` dan `JwtService` dengan method `sign()` untuk generate token dan `verify()` untuk memvalidasinya. Diintegrasi dengan sistem dependency injection NestJS sehingga bisa di-inject ke service manapun.

### `@prisma/client` dan `prisma`
`prisma` (devDependency) adalah CLI tool — dipakai untuk perintah `prisma generate`, `prisma migrate`, dll. `@prisma/client` adalah runtime client yang dipakai di kode untuk query database. Keduanya harus ada: `prisma` untuk development, `@prisma/client` untuk production.

### `bcrypt` dan `@types/bcrypt`
`bcrypt` adalah implementasi algoritma bcrypt untuk Node.js. Dipakai khusus untuk hash password — tidak boleh dipakai untuk enkripsi data biasa karena sifatnya one-way. `@types/bcrypt` adalah TypeScript type definition-nya agar editor bisa memberikan autocomplete dan type checking.

### `reflect-metadata`
Library yang mengaktifkan fitur metadata reflection di TypeScript. NestJS sangat bergantung pada ini untuk membaca decorator dan melakukan dependency injection. Harus di-import pertama kali saat aplikasi start — biasanya di `main.ts`. Tanpa ini, hampir semua fitur NestJS tidak akan bekerja.

### `rxjs`
Library reactive programming untuk JavaScript. NestJS menggunakannya secara internal, dan `ClientProxy.send()` mengembalikan Observable dari library ini. Di project ini kita pakai `firstValueFrom()` dari rxjs untuk mengkonversi Observable menjadi Promise yang lebih familiar.

### `@nestjs/testing` dan `jest`, `ts-jest`
`@nestjs/testing` menyediakan `Test.createTestingModule()` — cara membuat module NestJS yang terisolasi untuk unit testing. `jest` adalah test runner-nya. `ts-jest` adalah transformer yang memungkinkan Jest menjalankan file TypeScript secara langsung tanpa perlu compile manual terlebih dahulu.

---

## Kenapa GraphQL, Bukan REST?

Di sistem ini, jadwal punya relasi ke dokter dan customer. Kalau pakai REST, untuk menampilkan daftar jadwal lengkap dengan info dokter dan customer, client harus melakukan beberapa request terpisah (disebut N+1 problem). Dengan GraphQL, client cukup satu query dan bisa menentukan sendiri field mana yang dibutuhkan — tidak lebih, tidak kurang.

Selain itu, GraphQL punya introspection built-in yang menggantikan dokumentasi Swagger secara otomatis.

### Kenapa Code First, Bukan Schema First?

NestJS mendukung dua pendekatan GraphQL. Schema First berarti menulis file `.graphql` secara manual lalu membuat resolver yang cocok dengannya. Code First berarti menulis TypeScript dengan decorator, lalu schema-nya di-generate otomatis.

Dengan Code First, tidak ada risiko schema dan implementasi tidak sinkron — karena keduanya satu sumber. Cukup ubah satu tempat, schema otomatis ikut berubah.

---

## Kenapa Database Dipisah per Service?

Kalau kedua service berbagi satu database yang sama, Schedule Service secara teknis bisa langsung query tabel `users` milik Auth Service — dan sebaliknya. Ini melanggar prinsip microservice paling fundamental: setiap service harus punya data domain-nya sendiri.

Dengan memisahkan `auth_db` dan `schedule_db`, coupling di level database hilang. Auth Service tidak tahu tabel apa yang ada di schedule_db, dan sebaliknya. Komunikasi antar service hanya boleh lewat API yang terdefinisi — dalam kasus ini, lewat TCP.

---

## Test Coverage

Unit test mencakup seluruh layer business logic (service, resolver, controller, guard) dengan total **59 test** di **11 test suite**.

```
Test Suites : 11 passed
Tests       : 59 passed
Coverage    : 70.8% statements
```

| Layer | File | Statements | Branches | Functions | Lines |
|---|---|---|---|---|---|
| **Auth Service** | `auth.service.ts` | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| | `auth.resolver.ts` | ![83%](https://img.shields.io/badge/83%25-green) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![57%](https://img.shields.io/badge/57%25-yellow) | ![81%](https://img.shields.io/badge/81%25-green) |
| | `auth.controller.ts` | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| | `users.service.ts` | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| **Schedule Service** | `customer.service.ts` | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| | `doctor.service.ts` | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| | `schedule.service.ts` | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| | `auth.guard.ts` | ![95%](https://img.shields.io/badge/95%25-brightgreen) | ![67%](https://img.shields.io/badge/67%25-yellow) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![95%](https://img.shields.io/badge/95%25-brightgreen) |
| | `customer.resolver.ts` | ![73%](https://img.shields.io/badge/73%25-green) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![47%](https://img.shields.io/badge/47%25-yellow) | ![71%](https://img.shields.io/badge/71%25-green) |
| | `doctor.resolver.ts` | ![76%](https://img.shields.io/badge/76%25-green) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![45%](https://img.shields.io/badge/45%25-yellow) | ![74%](https://img.shields.io/badge/74%25-green) |
| | `schedule.resolver.ts` | ![76%](https://img.shields.io/badge/76%25-green) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![50%](https://img.shields.io/badge/50%25-yellow) | ![74%](https://img.shields.io/badge/74%25-green) |

> Coverage resolver tidak 100% karena decorator GraphQL (`@Query`, `@Mutation`, `@Field`) tidak dieksekusi saat unit test — ini normal dan expected. Semua business logic di service layer mencapai **100%**.

Untuk menjalankan test:
```bash
npm test
npm test -- --coverage
```

---

## Cara Menjalankan

### Dengan Docker Compose

```bash
docker-compose up --build
```

Setelah semua service jalan:
- Auth Service: `http://localhost:3001/graphql`
- Schedule Service: `http://localhost:3002/graphql`

### Secara Lokal

```bash
npm install
npm run prisma:generate:auth
npm run prisma:generate:schedule
npm run prisma:migrate:auth
npm run prisma:migrate:schedule

# Terminal 1
npm run start:auth:dev

# Terminal 2
npm run start:schedule:dev
```

---

## Contoh Penggunaan API

### 1. Register

```graphql
mutation {
  register(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    token
    user { id email }
  }
}
```

### 2. Login

```graphql
mutation {
  login(input: {
    email: "user@example.com"
    password: "password123"
  }) {
    token
  }
}
```

### 3. Gunakan Token di Schedule Service

Tambahkan header berikut di setiap request ke Schedule Service:

```json
{ "Authorization": "Bearer <token>" }
```

### 4. Tambah Dokter

```graphql
mutation {
  createDoctor(input: {
    name: "Dr. Budi Santoso"
    specialization: "Umum"
  }) {
    id name specialization
  }
}
```

### 5. Tambah Customer

```graphql
mutation {
  createCustomer(input: {
    name: "John Doe"
    email: "john@example.com"
    phone: "081234567890"
  }) {
    id name
  }
}
```

### 6. Buat Jadwal

```graphql
mutation {
  createSchedule(input: {
    doctorId: "uuid-dokter"
    customerId: "uuid-customer"
    startTime: "2026-06-10T09:00:00Z"
    endTime: "2026-06-10T10:00:00Z"
  }) {
    id
    startTime
    endTime
    doctor { name }
    customer { name }
  }
}
```

### 7. Lihat Semua Jadwal

```graphql
query {
  schedules {
    id
    startTime
    endTime
    doctor { name specialization }
    customer { name phone }
  }
}
```

---

## Aturan Bisnis

- Jadwal dokter tidak boleh overlap — sistem menolak jika `startTime` dan `endTime` bertabrakan dengan jadwal yang sudah ada
- Customer dan Doctor harus sudah terdaftar sebelum bisa membuat jadwal
- Email customer bersifat unik — tidak boleh duplikat
- Kombinasi nama + spesialisasi dokter tidak boleh duplikat
- Seluruh endpoint Schedule Service wajib menggunakan JWT token yang valid

---

## Environment Variables

| Variable | Keterangan |
|---|---|
| `DATABASE_URL_AUTH` | Koneksi ke auth_db |
| `DATABASE_URL_SCHEDULE` | Koneksi ke schedule_db |
| `JWT_SECRET` | Secret key untuk sign dan verify JWT — jangan pernah commit ke git |
| `JWT_EXPIRES_IN` | Masa berlaku token, default `7d` |
| `AUTH_HTTP_PORT` | Port HTTP Auth Service, default `3001` |
| `AUTH_TCP_PORT` | Port TCP Auth Service, default `3003` |
| `SCHEDULE_HTTP_PORT` | Port Schedule Service, default `3002` |
| `AUTH_SERVICE_HOST` | Host Auth Service — `localhost` saat lokal, `auth-service` saat Docker |

---

## Struktur Project

```
healthcare-scheduling-system/
├── apps/
│   ├── auth-service/src/
│   │   ├── auth/          # Register, login, TCP validateToken
│   │   ├── users/         # User entity & database access
│   │   └── prisma/        # Koneksi ke auth_db
│   └── schedule-service/src/
│       ├── auth/          # Guard + TCP client ke Auth Service
│       ├── customers/     # CRUD Customer
│       ├── doctors/       # CRUD Doctor
│       ├── schedules/     # CRUD Schedule + validasi bentrok
│       └── prisma/        # Koneksi ke schedule_db
├── prisma/
│   ├── auth-service/      # Schema auth_db
│   └── schedule-service/  # Schema schedule_db
├── docker/
│   ├── auth-service.Dockerfile
│   ├── schedule-service.Dockerfile
│   └── init-db.sql
├── docker-compose.yml
└── docs/                  # Spesifikasi arsitektur & implementation plan
```
