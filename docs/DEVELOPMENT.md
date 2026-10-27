# Development review — 2026-10-26

## ชุดที่ปรับปรุงแล้ว

ตรวจ frontend และ backend ที่ผู้ใช้ระบุ (`C:/src/INET_Workshop1`) ก่อนเลือกงาน
โดยอ้างอิง controller, middleware และ schema จริง ไม่มีการแก้ source ของ Backend ในชุดนี้

| จุดที่พบ                                             | การเปลี่ยนแปลง                                                           |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| กลับจากรายละเอียดแล้วตัวกรอง/หน้าหาย                 | ย้ายสถานะที่ยืนยันแล้วลง URL พร้อมพกกลับผ่านลิงก์รายละเอียด              |
| คำขอเก่าอาจยังทำงานหลังเปลี่ยนเงื่อนไข               | AbortController + request generation + ยกเลิก debounce/unmount           |
| ไม่มีปุ่มล้างและ dropdown ขาด keyboard model         | Shared search และ native select ที่มี label                              |
| เรียงราคาเฉพาะหน้าแต่ไม่บอกขอบเขต                    | ระบุ “เรียงสินค้าในหน้านี้” ตามความสามารถ API จริง                       |
| API ส่ง totalPages=0 เมื่อว่าง/เปิดเลขหน้าเกินข้อมูล | แยก empty/no-results, แสดง logical page 1, clamp หน้าและโหลดใหม่         |
| ลบ/อนุมัติใช้ window.confirm                         | ใช้ AppConfirmDialog เดียวกับตะกร้า พร้อม error/retry และป้องกันส่งซ้ำ   |
| ฟอร์มสินค้าไม่ตรวจจำนวนเต็ม/ข้อมูลว่าง/ความยาว       | Validation ตาม schema, field association, first-invalid focus            |
| ข้อมูลฟอร์มหายเมื่อกดยกเลิก/เปลี่ยนหน้า              | ยืนยัน discard ในแอปและ beforeunload สำหรับปิด/รีเฟรชหน้า                |
| URL ที่ไม่มี route แสดงหน้าว่าง                      | หน้า 404 และทางกลับที่เหมาะกับสถานะเข้าสู่ระบบ                           |
| ไม่มี regression suite                               | Node unit tests + Playwright desktop/mobile พร้อม synthetic API fixtures |

## งานถัดไปตามผลกระทบ

| ลำดับ | งาน                              | หลักฐาน/เงื่อนไขที่ต้องทำ                                                                           | เกณฑ์เสร็จ                                                                                              |
| ----- | -------------------------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| 1     | Session expiry และ authorization | Backend auth.middleware ใช้ 401 ทั้งหมดอายุและไม่มีสิทธิ์ admin; แยก 401/403 ก่อนออกแบบ interceptor | หมดอายุแล้วเข้าสู่ระบบใหม่และกลับหน้าเดิม; ไม่มี redirect loop; บัญชีใหม่ไม่เห็น state เก่าค้าง         |
| 1     | Pagination หลังบ้าน              | ProductsView โหลดสูงสุด 100; users/orders API ส่งทั้งรายการ                                         | ค้นหา/กรอง/นับจำนวนและแบ่งหน้าจาก server ครบทั้งชุด พร้อม URL state และ clamp หลังลบ                    |
| 1     | Input limits ฝั่ง API            | productQuerySchema ตรวจ digits แต่ยังยอม 0 และไม่กำหนด limit สูงสุด; search ใช้ regex โดยตรง        | server ปฏิเสธ page/limit ผิดช่วง, จำกัดภาระค้นหา, มี backend tests                                      |
| 2     | เรียงสินค้าแบบทั้งคลัง           | product.controller เรียง createdAt เท่านั้น                                                         | whitelist sort keys ใน schema/controller, tie-break ด้วย id, ทดสอบข้ามหน้า แล้วเปลี่ยน copy ใน Frontend |
| 2     | Checkout recovery                | ต้องทดสอบ transaction/stock กับ MongoDB จริง และกำหนด idempotency                                   | กดซ้ำ/timeout/stock เปลี่ยนไม่เกิดคำสั่งซื้อซ้ำหรือยอดติดลบ                                             |
| 2     | Admin order confirmation         | เปลี่ยนสถานะควรอธิบายผลก่อนยืนยัน โดยเฉพาะ cancelled                                                | ใช้ AppConfirmDialog และ status utility กลาง; กฎ transition มาจาก Backend                               |
| 2     | ภาพสินค้า                        | ProductCard มี fallback เมื่อ URL ว่าง แต่ยังไม่มี fallback เมื่อโหลด URL เสีย                      | รูปเสียไม่แสดง broken image, ขนาดภาพคงที่, alt และ lazy loading ครบ                                     |
| 2     | Accessibility ทั้งแอป            | Admin mobile sidebar และ auth field errors ยังต้องตรวจเชิงลึก                                       | ทดสอบ focus/inert/Escape, screen reader, contrast และ 200% zoom                                         |
| 3     | Operational readiness            | ยังไม่มี real API integration suite/observability/deployment guide                                  | health checks, error tracing ที่ไม่บันทึกข้อมูลลับ, staging smoke test, rollback guide                  |

ไม่เพิ่มระบบชำระเงินจริง ที่อยู่จัดส่ง หรือสิทธิ์ใหม่โดยอาศัยการคาดเดา
ต้องกำหนด requirement และ API ก่อนเริ่มงานเหล่านี้

## การตรวจสอบและข้อจำกัด

- Unit tests ครอบคลุม query ที่ผิดรูปแบบ/ค่าซ้ำ/round-trip และ validation ตัวเลข/ความยาว
- Browser tests ใช้ข้อมูลจำลองตาม schema ที่อ่านจาก Backend; ตรวจการค้นหา, IME,
  clear/stale responses, pagination/back, retry, create/edit/delete, approval, discard,
  login return, 404, keyboard และความกว้างมือถือ
- ภาพ catalog เก็บใน test-results สำหรับตรวจด้วยตา ไม่ใช่ visual-regression baseline
- `premium-audit.json` เป็นผลตรวจ static ไม่ใช่หลักฐานว่าผ่าน accessibility ทุกข้อ
- ยังต้องทดสอบ API จริงพร้อมบัญชีทดสอบและ MongoDB ที่ตั้งค่าแล้วก่อนนำขึ้นใช้งาน
- Vue ใช้ release-candidate channel ตาม package เดิม; lockfile ทำให้ติดตั้งซ้ำได้
  ควรประเมินการย้ายไป stable release เป็นงานแยกพร้อมทดสอบความเข้ากันได้

ใช้ `npm run test`, `npm run test:e2e`, `npm run lint:check`, `npm run type-check`
และ `npm run build` เพื่อตรวจซ้ำ รายละเอียด behavior อยู่ใน UX-CONTRACT.md
