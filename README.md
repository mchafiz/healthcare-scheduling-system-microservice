# Healthcare Scheduling System

Sistem penjadwalan layanan kesehatan berbasis microservice. Proyek ini dibangun untuk membuktikan konsep pemisahan tanggung jawab antar service, keamanan autentikasi berlapis, dan validasi aturan bisnis di level database.

![Tests](https://img.shields.io/badge/tests-84%20passed-brightgreen)
![Coverage](https://img.shields.io/badge/coverage-71.9%25-yellowgreen)
![Services](https://img.shields.io/badge/services-auth%20%7C%20schedule-blue)
![NestJS](https://img.shields.io/badge/NestJS-10-red)
![GraphQL](https://img.shields.io/badge/GraphQL-code--first-e10098)
![Prisma](https://img.shields.io/badge/Prisma-5-2D3748)
![Redis](https://img.shields.io/badge/Redis-7-DC382D)
![Bull](https://img.shields.io/badge/Bull-queue-orange)

---

## Arsitektur Sistem

![Arsitektur](https://mermaid.ink/img/Z3JhcGggVEQKICAgIEFbIkNsaWVudApQb3N0bWFuIC8gRnJvbnRlbmQiXSAtLT58IkdyYXBoUUwgSFRUUCJ8IEJbIlNjaGVkdWxlIFNlcnZpY2UKcG9ydCAzMDAyIl0KICAgIEIgLS0+fCJUQ1AgSW50ZXJuYWwifCBDWyJBdXRoIFNlcnZpY2UKcG9ydCAzMDAxIC8gMzAwMyJdCiAgICBCIC0tPnwiUHJpc21hIE9STSJ8IERbKCJzY2hlZHVsZV9kYiIpXQogICAgQyAtLT58IlByaXNtYSBPUk0ifCBFWygiYXV0aF9kYiIpXQogICAgRCAtLT4gRlsoIlBvc3RncmVTUUwKcG9ydCA1NDMyIildCiAgICBFIC0tPiBGCiAgICBCIC0tPnwiQ2FjaGUifCBHWygiUmVkaXMKcG9ydCA2Mzc5IildCiAgICBCIC0tPnwiQnVsbCBRdWV1ZSJ8IEcKICAgIEcgLS0+fCJQcm9jZXNzb3IifCBIWyJOb2RlbWFpbGVyCk1haWx0cmFwIl0KICAgIHN0eWxlIEEgZmlsbDojNEE5MEQ5LGNvbG9yOiNmZmYKICAgIHN0eWxlIEIgZmlsbDojMjdBRTYwLGNvbG9yOiNmZmYKICAgIHN0eWxlIEMgZmlsbDojRTc0QzNDLGNvbG9yOiNmZmYKICAgIHN0eWxlIEQgZmlsbDojRjM5QzEyLGNvbG9yOiNmZmYKICAgIHN0eWxlIEUgZmlsbDojRjM5QzEyLGNvbG9yOiNmZmYKICAgIHN0eWxlIEYgZmlsbDojOEU0NEFELGNvbG9yOiNmZmYKICAgIHN0eWxlIEcgZmlsbDojREM0ODJELGNvbG9yOiNmZmYKICAgIHN0eWxlIEggZmlsbDojMTZBMDg1LGNvbG9yOiNmZmY=)

### Kenapa Dipisah Jadi Dua Service?

Kalau semua fitur digabung dalam satu aplikasi, setiap kali ada bug di fitur penjadwalan, seluruh sistem termasuk autentikasi ikut terdampak. Dengan memisahkan Auth Service dan Schedule Service, kegagalan di satu service tidak meruntuhkan yang lain. Ini yang disebut **fault isolation** prinsip dasar microservice.

Auth Service punya satu tanggung jawab: urusan identitas pengguna. Schedule Service punya satu tanggung jawab: urusan jadwal. Keduanya bisa dikembangkan, di-deploy, dan di-scale secara independen.

---

## Alur Autentikasi

![Auth Flow](https://mermaid.ink/img/c2VxdWVuY2VEaWFncmFtCiAgICBwYXJ0aWNpcGFudCBDIGFzIENsaWVudAogICAgcGFydGljaXBhbnQgUyBhcyBTY2hlZHVsZSBTZXJ2aWNlCiAgICBwYXJ0aWNpcGFudCBBIGFzIEF1dGggU2VydmljZQogICAgcGFydGljaXBhbnQgREIgYXMgUG9zdGdyZVNRTAoKICAgIEMtPj5BOiBtdXRhdGlvbiByZWdpc3Rlci9sb2dpbgogICAgQS0+PkRCOiBzaW1wYW4gdXNlciAocGFzc3dvcmQgZGktaGFzaCBiY3J5cHQpCiAgICBBLS0+PkM6IEpXVCBUb2tlbgoKICAgIEMtPj5TOiBHcmFwaFFMIHJlcXVlc3QgKyBCZWFyZXIgVG9rZW4KICAgIFMtPj5BOiBUQ1A6IHZhbGlkYXRlX3Rva2VuCiAgICBBLS0+PlM6IHZhbGlkICsgdXNlcklkCiAgICBTLT4+REI6IHF1ZXJ5L211dGF0ZSBkYXRhCiAgICBTLS0+PkM6IGhhc2lsIGRhdGE=)

### Kenapa Token Divalidasi di Auth Service, Bukan di Schedule Service Langsung?

Cara yang lebih sederhana adalah menyimpan JWT secret di Schedule Service dan memverifikasi token di sana tanpa memanggil Auth Service. Tapi ada dua masalah besar:

Pertama, JWT secret harus dibagikan ke semua service. Semakin banyak service yang tahu secret, semakin besar risiko kebocoran. Kalau satu service bocor, semua token di seluruh sistem bisa dipalsukan.

Kedua, kalau suatu saat kita perlu membatalkan token pengguna tertentu (misalnya akun dikompromikan), tidak ada cara untuk melakukannya karena verifikasi hanya berbasis signature, bukan state di server. Dengan validasi terpusat di Auth Service, kita punya satu tempat untuk menambahkan logika seperti token blacklist atau session invalidation di masa depan.

### Kenapa Pakai TCP Bukan HTTP untuk Komunikasi Antar Service?

HTTP biasa bisa dipakai, tapi artinya Schedule Service harus tahu URL Auth Service, handle timeout, retry, dan error HTTP secara manual. NestJS TCP transport mengabstraksi semua itu. Yang lebih penting, kode tidak bergantung pada protokol kalau besok ingin ganti ke RabbitMQ atau Redis, hanya konfigurasi yang berubah, bukan kode handler-nya sama sekali.

---

## Keamanan

### Password Kenapa Tidak Disimpan Langsung?

Password pengguna tidak pernah disimpan dalam bentuk aslinya. Sebelum disimpan ke database, password diproses menggunakan **bcrypt** algoritma hashing satu arah dengan salt.

```
Password asli:  "password123"
Setelah bcrypt: "$2b$10$X9mC3vQ8Kz..."  ← tidak bisa dikembalikan ke aslinya
```

Salt rounds diset ke 10, artinya proses hashing diulang 2^10 = 1024 kali. Ini membuat serangan brute force jauh lebih lambat tiap percobaan butuh ~100ms, bukan mikrodetik.

Kalau database bocor sekalipun, penyerang hanya mendapatkan hash yang tidak bisa dipakai untuk login di tempat lain.

### JWT Kenapa Token Punya Waktu Kadaluarsa?

Token JWT yang tidak pernah expired adalah celah keamanan. Kalau token dicuri, penyerang bisa pakai selamanya. Dengan expiry 7 hari, dampak pencurian token terbatas hanya pada periode itu.

Payload token sengaja dibuat minimal hanya menyimpan `userId` dan `email`. Tidak ada data sensitif di dalamnya, karena payload JWT bisa dibaca siapa saja (hanya signature-nya yang terenkripsi).

### Password Tidak Bisa Diambil Lewat API

Field `password` di entity User sengaja tidak diberi decorator `@Field()` pada GraphQL schema. Artinya field ini tidak terdaftar di schema client tidak bisa memintanya sama sekali, bukan sekadar diabaikan tapi benar-benar tidak ada di kontrak API.

### Pesan Error yang Generik saat Login

Ketika login gagal, sistem selalu mengembalikan pesan `"Invalid credentials"` baik kalau emailnya tidak ada maupun kalau passwordnya salah. Ini disengaja. Kalau sistemnya membedakan keduanya, penyerang bisa menggunakan perbedaan pesan tersebut untuk mengetahui email mana yang terdaftar (disebut **user enumeration attack**).

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
| Bull + Redis | Job queue | Async email notification, retry otomatis, tidak blocking request |
| Nodemailer | Kirim email | Integrasi SMTP ke Mailtrap untuk notifikasi jadwal |
| ioredis | Redis client | Cache layer untuk customer dan doctor, kurangi query ke DB |
| Docker + Compose | Containerisasi | Reproducible environment, mudah deploy |

---

## Penjelasan Library yang Digunakan

### `@nestjs/common`, `@nestjs/core`, `@nestjs/platform-express`
Ini tiga paket inti NestJS. `@nestjs/common` berisi semua decorator yang sering dipakai (`@Injectable`, `@Module`, `@Controller`, dll). `@nestjs/core` adalah engine dependency injection-nya. `@nestjs/platform-express` menghubungkan NestJS dengan Express sebagai HTTP server di balik layar NestJS tidak langsung handle HTTP sendiri, tapi mendelegasikan ke Express.

### `@nestjs/graphql` dan `@nestjs/apollo`
`@nestjs/graphql` adalah integrasi GraphQL untuk NestJS menyediakan decorator seperti `@Resolver`, `@Query`, `@Mutation`, `@ObjectType`, `@Field`. `@nestjs/apollo` adalah driver yang menghubungkan NestJS GraphQL dengan Apollo Server sebagai engine GraphQL-nya. Keduanya harus ada bersama.

### `@apollo/server` dan `graphql`
`@apollo/server` adalah implementasi Apollo Server versi 4 ini yang benar-benar menjalankan GraphQL engine, parsing query, validasi schema, dan eksekusi resolver. `graphql` adalah library JavaScript resmi implementasi GraphQL spec tanpa ini tidak ada yang bisa jalan.

### `@nestjs/microservices`
Paket yang menyediakan semua hal terkait microservice di NestJS: `Transport.TCP`, `ClientProxy`, `ClientsModule`, `@MessagePattern`, `@Payload`. Tanpa paket ini tidak ada komunikasi TCP antar service.

### `@nestjs/jwt`
Wrapper NestJS untuk library `jsonwebtoken`. Menyediakan `JwtModule` dan `JwtService` dengan method `sign()` untuk generate token dan `verify()` untuk memvalidasinya. Diintegrasi dengan sistem dependency injection NestJS sehingga bisa di-inject ke service manapun.

### `@prisma/client` dan `prisma`
`prisma` (devDependency) adalah CLI tool dipakai untuk perintah `prisma generate`, `prisma migrate`, dll. `@prisma/client` adalah runtime client yang dipakai di kode untuk query database. Keduanya harus ada: `prisma` untuk development, `@prisma/client` untuk production.

### `bcrypt` dan `@types/bcrypt`
`bcrypt` adalah implementasi algoritma bcrypt untuk Node.js. Dipakai khusus untuk hash password tidak boleh dipakai untuk enkripsi data biasa karena sifatnya one-way. `@types/bcrypt` adalah TypeScript type definition-nya agar editor bisa memberikan autocomplete dan type checking.

### `reflect-metadata`
Library yang mengaktifkan fitur metadata reflection di TypeScript. NestJS sangat bergantung pada ini untuk membaca decorator dan melakukan dependency injection. Harus di-import pertama kali saat aplikasi start biasanya di `main.ts`. Tanpa ini, hampir semua fitur NestJS tidak akan bekerja.

### `rxjs`
Library reactive programming untuk JavaScript. NestJS menggunakannya secara internal, dan `ClientProxy.send()` mengembalikan Observable dari library ini. Di project ini kita pakai `firstValueFrom()` dari rxjs untuk mengkonversi Observable menjadi Promise yang lebih familiar.

### `@nestjs/bull` dan `bull`
`@nestjs/bull` adalah integrasi Bull job queue untuk NestJS. Menyediakan decorator `@Processor`, `@Process`, dan `InjectQueue` untuk mendefinisikan consumer dan producer queue. `bull` adalah library queue-nya sendiri yang berbasis Redis. Dipakai untuk memproses notifikasi email secara asynchronous request `createSchedule` langsung return tanpa menunggu email terkirim.

### `nodemailer`
Library Node.js untuk mengirim email via SMTP. Di project ini dipakai di `NotificationProcessor` untuk mengirim email konfirmasi jadwal ke customer melalui Mailtrap. Mendukung berbagai provider SMTP tanpa perubahan kode.

### `ioredis`
Redis client untuk Node.js dengan dukungan TypeScript penuh. Dipakai di `CacheService` untuk menyimpan dan mengambil data customer dan doctor dari Redis. Lebih performant dari query database berulang untuk data yang jarang berubah.

### `@nestjs/testing` dan `jest`, `ts-jest`
`@nestjs/testing` menyediakan `Test.createTestingModule()` cara membuat module NestJS yang terisolasi untuk unit testing. `jest` adalah test runner-nya. `ts-jest` adalah transformer yang memungkinkan Jest menjalankan file TypeScript secara langsung tanpa perlu compile manual terlebih dahulu.

---

## Kenapa GraphQL, Bukan REST?

Di sistem ini, jadwal punya relasi ke dokter dan customer. Kalau pakai REST, untuk menampilkan daftar jadwal lengkap dengan info dokter dan customer, client harus melakukan beberapa request terpisah (disebut N+1 problem). Dengan GraphQL, client cukup satu query dan bisa menentukan sendiri field mana yang dibutuhkan tidak lebih, tidak kurang.

Selain itu, GraphQL punya introspection built-in yang menggantikan dokumentasi Swagger secara otomatis.

### Kenapa Code First, Bukan Schema First?

NestJS mendukung dua pendekatan GraphQL. Schema First berarti menulis file `.graphql` secara manual lalu membuat resolver yang cocok dengannya. Code First berarti menulis TypeScript dengan decorator, lalu schema-nya di-generate otomatis.

Dengan Code First, tidak ada risiko schema dan implementasi tidak sinkron karena keduanya satu sumber. Cukup ubah satu tempat, schema otomatis ikut berubah.

---

## Kenapa Database Dipisah per Service?

Kalau kedua service berbagi satu database yang sama, Schedule Service secara teknis bisa langsung query tabel `users` milik Auth Service dan sebaliknya. Ini melanggar prinsip microservice paling fundamental: setiap service harus punya data domain-nya sendiri.

Dengan memisahkan `auth_db` dan `schedule_db`, coupling di level database hilang. Auth Service tidak tahu tabel apa yang ada di schedule_db, dan sebaliknya. Komunikasi antar service hanya boleh lewat API yang terdefinisi dalam kasus ini, lewat TCP.

---

## Bull Queue & Email Notification

Ketika schedule dibuat atau dihapus, sistem mengirim email notifikasi ke customer secara **asynchronous** menggunakan Bull queue.

### Alur Notifikasi

```
createSchedule() → NotificationService.notifyScheduleCreated()
                       ↓
               Bull Queue (Redis)
                       ↓
            NotificationProcessor.handleScheduleCreated()
                       ↓
             Nodemailer → Mailtrap SMTP
```

### Kenapa Asynchronous?

Kalau email dikirim langsung di dalam resolver (synchronous), satu request `createSchedule` harus menunggu SMTP response dari Mailtrap sebelum bisa return ke client. Kalau SMTP lambat atau down, seluruh API ikut lambat atau gagal. Dengan Bull queue, job diantri ke Redis dan diproses di background request tetap cepat, email tetap terkirim.

### Retry Otomatis

Job dikonfigurasi dengan `attempts: 3` dan `backoff: exponential` kalau pengiriman email gagal, sistem otomatis mencoba ulang dengan jeda yang semakin lama (2s, 4s, 8s). Tidak ada data notifikasi yang hilang meski SMTP sempat error.

---

## Redis Caching

`CustomerService` dan `DoctorService` menyimpan hasil query ke Redis dengan TTL 60 detik.

### Strategi Cache

| Operasi | Behavior |
|---|---|
| `findAll(skip, take)` | Cache key: `customers:all:{skip}:{take}` hit langsung return, miss query DB lalu simpan |
| `findOne(id)` | Cache key: `customers:{id}` sama seperti di atas |
| `create` / `update` / `delete` | Invalidate semua key `customers:*` agar data tidak stale |

### Kenapa TTL 60 Detik?

Data customer dan doctor jarang berubah dalam rentang menit. TTL 60 detik memberi balance antara freshness data dan pengurangan beban DB. Bila ada update, cache diinvalidate langsung tidak perlu menunggu TTL habis.

---

## Test Coverage

Unit test mencakup seluruh layer business logic (service, resolver, controller, guard, cache, notification) dengan total **84 test** di **13 test suite**.

```
Test Suites : 13 passed
Tests       : 84 passed
Coverage    : 71.93% statements | 50% branches | 52.17% functions | 71.6% lines
```

| Layer | File | Statements | Branches | Functions | Lines |
|---|---|---|---|---|---|
| **Auth Service** | `auth.service.ts` | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| | `auth.resolver.ts` | ![83%](https://img.shields.io/badge/83%25-green) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![57%](https://img.shields.io/badge/57%25-yellow) | ![81%](https://img.shields.io/badge/81%25-green) |
| | `auth.controller.ts` | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| | `users.service.ts` | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| **Schedule Service** | `customer.service.ts` | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| | `doctor.service.ts` | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| | `schedule.service.ts` | ![97%](https://img.shields.io/badge/97%25-brightgreen) | ![89%](https://img.shields.io/badge/89%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| | `auth.guard.ts` | ![95%](https://img.shields.io/badge/95%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![95%](https://img.shields.io/badge/95%25-brightgreen) |
| | `cache.service.ts` | ![93%](https://img.shields.io/badge/93%25-brightgreen) | ![42%](https://img.shields.io/badge/42%25-yellow) | ![83%](https://img.shields.io/badge/83%25-green) | ![92%](https://img.shields.io/badge/92%25-brightgreen) |
| | `notification.service.ts` | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![100%](https://img.shields.io/badge/100%25-brightgreen) |
| | `customer.resolver.ts` | ![75%](https://img.shields.io/badge/75%25-green) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![47%](https://img.shields.io/badge/47%25-yellow) | ![73%](https://img.shields.io/badge/73%25-green) |
| | `doctor.resolver.ts` | ![75%](https://img.shields.io/badge/75%25-green) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![47%](https://img.shields.io/badge/47%25-yellow) | ![76%](https://img.shields.io/badge/76%25-green) |
| | `schedule.resolver.ts` | ![79%](https://img.shields.io/badge/79%25-green) | ![100%](https://img.shields.io/badge/100%25-brightgreen) | ![50%](https://img.shields.io/badge/50%25-yellow) | ![77%](https://img.shields.io/badge/77%25-green) |

> Coverage resolver tidak 100% karena decorator GraphQL (`@Query`, `@Mutation`, `@Field`) tidak dieksekusi saat unit test ini normal dan expected. Semua business logic di service layer mencapai **100%**.

Untuk menjalankan test:
```bash
npm test
npm test -- --coverage
```

---

## Cara Menjalankan

### Dengan Docker Compose

Pastikan Docker atau Podman sudah terinstall, lalu jalankan dari root folder project:

```bash
docker-compose up --build
```

Perintah ini akan otomatis:
1. Build image untuk Auth Service dan Schedule Service
2. Menjalankan container PostgreSQL, Redis, dan membuat `auth_db` + `schedule_db`
3. Menjalankan database migration
4. Menjalankan kedua service

Setelah semua container jalan:
- Auth Service: `http://localhost:3001/graphql`
- Schedule Service: `http://localhost:3002/graphql`

Untuk menghentikan semua container:
```bash
docker-compose down
```

Untuk menghapus semua data (termasuk database):
```bash
docker-compose down -v
```

### Secara Lokal

Pastikan PostgreSQL dan Redis sudah berjalan, lalu:

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

### Catatan Struktur Docker

Project ini menggunakan NestJS Monorepo sehingga Dockerfile disimpan di folder `docker/` dan di-reference dari root context. Ini berbeda dari struktur per-service konvensional, tapi memungkinkan kedua Dockerfile mengakses shared `node_modules` dan `prisma/` folder tanpa duplikasi.

```
docker/
├── auth-service.Dockerfile    ← build context dari root (.)
├── schedule-service.Dockerfile
└── init-db.sql                ← script inisialisasi dua database
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

Setelah berhasil, email konfirmasi otomatis dikirim ke `email` customer via Mailtrap.

```graphql
mutation {
  createSchedule(input: {
    doctorId: "uuid-dokter"
    customerId: "uuid-customer"
    objective: "Konsultasi rutin"
    scheduledAt: "2026-06-10T09:00:00Z"
  }) {
    id
    objective
    scheduledAt
    doctor { name }
    customer { name }
  }
}
```

### 7. Hapus Jadwal

Email pembatalan otomatis dikirim ke customer.

```graphql
mutation {
  deleteSchedule(id: "uuid-jadwal")
}
```

### 8. Lihat Semua Jadwal (dengan pagination & filter)

```graphql
query {
  schedules(
    pagination: { skip: 0, take: 10 }
    filter: { doctorId: "uuid-dokter" }
  ) {
    data {
      id
      objective
      scheduledAt
      doctor { name specialization }
      customer { name phone }
    }
    total
  }
}
```

### 9. Lihat Semua Dokter (dengan pagination)

```graphql
query {
  doctors(pagination: { skip: 0, take: 10 }) {
    total
    data { id name specialization }
  }
}
```

### 10. Lihat Semua Customer (dengan pagination)

```graphql
query {
  customers(pagination: { skip: 0, take: 10 }) {
    total
    data { id name email }
  }
}
```

## Aturan Bisnis

- Jadwal dokter tidak boleh duplikat di waktu yang sama sistem menolak jika `scheduledAt` dokter sudah terpakai
- Customer dan Doctor harus sudah terdaftar sebelum bisa membuat jadwal
- Email customer bersifat unik tidak boleh duplikat
- Kombinasi nama + spesialisasi dokter tidak boleh duplikat
- Seluruh endpoint Schedule Service wajib menggunakan JWT token yang valid

---

## Environment Variables

Salin `.env.example` menjadi `.env` dan isi nilai yang sesuai:

```bash
cp .env.example .env
```

| Variable | Keterangan |
|---|---|
| `DATABASE_URL_AUTH` | Koneksi ke auth_db |
| `DATABASE_URL_SCHEDULE` | Koneksi ke schedule_db |
| `JWT_SECRET` | Secret key untuk sign dan verify JWT jangan pernah commit ke git |
| `JWT_EXPIRES_IN` | Masa berlaku token, default `7d` |
| `AUTH_HTTP_PORT` | Port HTTP Auth Service, default `3001` |
| `AUTH_TCP_PORT` | Port TCP Auth Service, default `3003` |
| `SCHEDULE_HTTP_PORT` | Port Schedule Service, default `3002` |
| `AUTH_SERVICE_HOST` | Host Auth Service `localhost` saat lokal, `auth-service` saat Docker |
| `REDIS_HOST` | Host Redis, default `localhost` |
| `REDIS_PORT` | Port Redis, default `6379` |
| `MAIL_HOST` | SMTP host, contoh `sandbox.smtp.mailtrap.io` |
| `MAIL_PORT` | SMTP port, default `2525` |
| `MAIL_USER` | SMTP username dari Mailtrap |
| `MAIL_PASS` | SMTP password dari Mailtrap |
| `MAIL_FROM` | Alamat pengirim email |

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
│       ├── cache/         # CacheService wrapper ioredis
│       ├── customers/     # CRUD Customer + Redis cache
│       ├── doctors/       # CRUD Doctor + Redis cache
│       ├── notification/  # Bull queue + Nodemailer email processor
│       ├── schedules/     # CRUD Schedule + validasi bentrok
│       └── prisma/        # Koneksi ke schedule_db
├── prisma/
│   ├── auth-service/      # Schema auth_db
│   └── schedule-service/  # Schema schedule_db
├── docker/
│   ├── auth-service.Dockerfile
│   ├── schedule-service.Dockerfile
│   └── init-db.sql
├── docker-compose.yaml
├── .env.example
└── docs/                  # Spesifikasi arsitektur & implementation plan
```
