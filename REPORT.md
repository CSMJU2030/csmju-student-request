# REPORT — csmju-student-request

## ผลรัน

### Static compliance

ผลล่าสุดจาก `bash standards/scripts/run-all-checks.sh`:

- PASS 19/20 checks
- FAIL `SEC-01` (`check-no-secrets.sh`)
- `SEC-01` ตรวจพบ local development `DATABASE_URL` ใน `backend/.env`
- `backend/.env` เป็น ignored local file และไม่ได้ถูก Git track
- `API-01` แสดง warning ว่าข้ามการตรวจ OpenAPI เพราะไม่มี `generate:openapi`
- QA ผ่าน: lint, typecheck, test และ build

ผลสรุป:

    ❌ 1 / 20 checks failed — merge would be blocked.

### Runtime conformance

คำสั่ง `node standards/conformance/run.js` เริ่มด้วย:

    standard      : v1.2
    subsystem     : csmju-student-request
    base url      : http://localhost:3234
    core hub      : https://csmju2030.jowave.com
    level         : L3

แต่ runner หยุดก่อน login เพราะไม่ได้ตั้ง `CONFORMANCE_ACCOUNTS_FILE`
สำหรับ Core Hub จริง

ดังนั้น runtime conformance รอบล่าสุดยังไม่มีผล pass/fail และไม่ได้อ้างผล
71/71 จากการรันครั้งก่อนเป็นผลของ working tree ปัจจุบัน

### Build / test ที่รันเพิ่มเติม

- backend lint: passed
- backend typecheck: passed
- backend test: 3 suites passed, 14 tests passed
- backend build: passed
- frontend lint: passed
- frontend typecheck: passed
- frontend build: passed

## ไฟล์ที่สร้าง/แก้ไข

- `.gitignore` — ignore `conformance-report.json`
- `backend/prisma/seed.mjs` — เปลี่ยน contact บุคคลเดิมเป็นข้อมูลสำนักงานสาขาวิชาวิทยาการคอมพิวเตอร์
- `backend/prisma/migrations/20261006230000_add_contact_directory_person_copy_constraint/migration.sql` — ลบ contact บุคคลเดิมและเพิ่ม constraint ป้องกันการเก็บข้อมูลบุคคลซ้ำกับ `person_code`
- `backend/src/http-exception.filter.ts` — เปลี่ยน HTTP 429 เป็น error code `TOO_MANY_REQUESTS`
- `backend/src/main.ts` — จัดรูปแบบ source code
- `backend/src/services.controller.ts` — จำกัด fields ของ `contactDirectory` ที่ select
- `backend/src/services.service.ts` — จำกัด fields ของ `contactDirectory` ที่ select
- `backend/src/system.controller.ts` — ลบ dead branch หลัง `AuthGuard` และให้ health response อ่าน subsystem id จาก `SUBSYSTEM_ID`
- `docker-compose.yml` — แก้ชื่อ PostgreSQL named volume ที่ซ้ำ `csmju-csmju`; ย้าย local database ไป volume ชื่อใหม่และตรวจข้อมูลหลัง restore แล้ว
- `frontend/src/app/services/[id]/page.tsx` — ปรับ `ContactDirectory` type และแสดง position/location/channels ของ contact
- `conformance-report.json` — เอา generated report ออกจาก Git tracking
- `REPORT.md` — บันทึกผลตรวจจริงของงานรอบนี้

## ชั้น auth ที่คัดลอกมา

- reference implementation ตามมาตรฐาน: `demo-student-subsystem/backend/`
- ไฟล์ auth ที่ระบบใช้งาน:
  - `backend/src/auth.controller.ts`
  - `backend/src/auth.guard.ts`
  - `backend/src/auth.service.ts`
  - `backend/src/auth/core-hub-identity.ts`
  - `backend/src/auth/permissions.guard.ts`
  - `backend/src/auth/permissions.ts`
  - `backend/src/auth/require-permissions.decorator.ts`
  - `backend/src/auth/role-mapping.ts`
  - `backend/src/core-hub/core-hub-http.ts`
  - `backend/src/core-hub/express-request.ts`
  - `backend/src/core-hub/people.service.ts`
- แก้ไขในงานรอบนี้: ไม่มี

## Role mapping ที่ประกาศ (ต้องตรงกับ default_role_mapping ในทะเบียน)

| core role | subsystem role |
|---|---|
| student | USER |
| alumni | USER |
| staff | STAFF |
| lecturer | USER |
| admin | USER |
| guest | ปฏิเสธ (ไม่มี mapping) |

หมายเหตุ: mapping นี้ยืนยันจาก `backend/src/auth/role-mapping.ts` แต่ยังไม่ได้เทียบกับ
`default_role_mapping` ในทะเบียน Core Hub ในรอบล่าสุด

## ข้อสมมติที่ตั้งเอง (เพราะมาตรฐานไม่ได้ระบุ)

1. ข้อมูลสำนักงานสาขาวิชาวิทยาการคอมพิวเตอร์ถูกจัดเป็นข้อมูลหน่วยงานของ subsystem และไม่ผูก `person_code`
2. ข้อมูล PostgreSQL local ถูกสำรองและ restore ไปยัง named volume ใหม่ก่อนตรวจสอบ migration และข้อมูล โดยยังเก็บ volume เก่าไว้เป็น backup

## สิ่งที่ยังทำไม่ได้ / เคสที่ยังไม่ผ่าน

- Static compliance: `SEC-01` ยังไม่ผ่านจาก local ignored `backend/.env`; ผลล่าสุดผ่าน 19/20 checks
- Runtime conformance L3 ยังรันจนจบไม่ได้ เนื่องจากไม่มี `~/.csmju/conformance-accounts.json` สำหรับ Core Hub จริง
- Role mapping ยังไม่ได้ยืนยันเทียบกับทะเบียน Core Hub ในรอบล่าสุด
