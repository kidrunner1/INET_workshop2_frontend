# ShopFlow Frontend

เว็บร้านอุปกรณ์ไอทีสำหรับลูกค้าและผู้ดูแลระบบ พัฒนาด้วย Vue, TypeScript,
Pinia, Vue Router และ Tailwind CSS เชื่อมต่อ Express/MongoDB API ของ
[INET_Workshop1](../INET_Workshop1)

## เริ่มใช้งาน

ต้องมี Node.js ตาม `engines` ใน package.json (Node 24 รุ่นที่รองรับเป็นต้นไป)

```powershell
npm ci
Copy-Item .env.example .env
npm run dev
```

แก้ `VITE_API_URL` ในไฟล์ `.env` ให้ตรงกับ Backend:
`http://localhost:3000/api/v1` เป็นค่าเริ่มต้นจาก source ที่ตรวจแล้ว
หากเปลี่ยนพอร์ต/โดเมนให้แก้ค่าตามจริง แล้วเริ่ม Vite ใหม่
ห้ามใส่ JWT secret หรือรหัสผ่านฐานข้อมูลในตัวแปร `VITE_*` เพราะถูกส่งไปยังเบราว์เซอร์

Backend อยู่ที่ `C:\src\INET_Workshop1` ในเครื่องที่ใช้พัฒนา ต้องตั้งค่า
`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` และรันตาม README ของ Backend
โดย `CLIENT_URL` ต้องตรงกับ origin ของ Frontend เช่น `http://localhost:5173`
การสมัครบัญชีใหม่ต้องได้รับการอนุมัติจากผู้ดูแลก่อนเข้าสู่ระบบ

## สิ่งที่มี

- ลูกค้า: ค้นหา/กรองสินค้า, รายละเอียดสินค้า, ตะกร้า, สั่งซื้อ, ประวัติคำสั่งซื้อ
- ผู้ดูแล: จัดการสินค้า, อนุมัติผู้ใช้, จัดการคำสั่งซื้อ
- ตัวกรองสินค้า/หน้าปัจจุบัน/จำนวนต่อหน้าจำผ่าน URL และกลับจากรายละเอียดได้
- ค้นหาแบบหน่วง 300ms, ปุ่มล้าง, รองรับ IME และยกเลิกคำขอเก่า
- กล่องยืนยันร่วมกันสำหรับลบสินค้า/อนุมัติผู้ใช้ พร้อมแสดงข้อผิดพลาดและลองใหม่
- ตรวจข้อมูลสินค้าให้ตรง Backend และเตือนก่อนทิ้งข้อมูลที่ยังไม่บันทึก
- หน้า 404, ชื่อหน้า, การกลับไปหน้าที่ต้องการหลังเข้าสู่ระบบ และพื้นฐาน keyboard/reduced motion

**ขอบเขตการเรียง:** API ปัจจุบันคืนสินค้าล่าสุดก่อน การเรียงราคา/ชื่อ/คงเหลือ
บน Frontend ใช้เฉพาะสินค้าที่อยู่ในหน้านั้น มีคำอธิบายกำกับในหน้าค้นหา

## ตรวจสอบคุณภาพ

```powershell
npm run test
npm run lint:check
npm run type-check
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright เริ่ม Vite ที่ `127.0.0.1:4173` เอง และจำลอง API ตามรูปแบบ Backend
จึงไม่ต้องเปิดฐานข้อมูลหรือใช้บัญชีจริง มีทั้ง desktop และมือถือ 390px
ผลลัพธ์อยู่ใน `playwright-report/` และ `test-results/`

การทดสอบนี้ตรวจ Frontend ไม่ได้ทดแทน integration test กับ MongoDB/API จริง
`npm run lint` และ `npm run format` เป็นคำสั่งแก้ไฟล์ ส่วน `lint:check` ใช้ตรวจโดยไม่แก้

## โครงสร้างและการพัฒนาต่อ

- `src/views`: หน้าลูกค้า/หลังบ้าน
- `src/components/common`: search, dialog, toast และ loading ที่ใช้ร่วมกัน
- `src/services`: HTTP API; `src/stores`: state ของ session/cart/toast
- `src/utils`: การอ่าน query และ validation ที่ทดสอบแยกได้
- [DESIGN.md](DESIGN.md): รูปแบบภาพและเจ้าของ tokens
- [UX-CONTRACT.md](UX-CONTRACT.md): พฤติกรรมร่วมและขอบเขต API
- [แผนพัฒนาต่อ](docs/DEVELOPMENT.md): สิ่งที่ตรวจพบ ลำดับความสำคัญ และเกณฑ์เสร็จ

โปรดใช้บริการและ component ร่วมก่อนสร้างใหม่ และเพิ่ม regression test
สำหรับพฤติกรรมที่เสี่ยงต่อการสูญเสียข้อมูลหรือมีคำขอทำงานพร้อมกัน
# รูปภาพสินค้าในหน้าแอดมิน

หน้าเพิ่ม/แก้ไขสินค้าเลือกภาพจากเครื่องได้ (JPG, PNG, WebP ไม่เกิน 5 MB)
พร้อมตัวอย่างก่อนบันทึก กด **บันทึกสินค้า** เพื่ออัปโหลดแล้วบันทึกข้อมูลสินค้า
ยกเลิกการอัปโหลดได้โดยข้อมูลในฟอร์มยังอยู่ และยังใช้ลิงก์รูปภาพเดิมได้

Backend ที่ `C:\src\INET_Workshop1` เพิ่ม `POST /api/v1/products/image`
รับ multipart ช่อง `image` พร้อม Bearer token ของ admin และคืน `data.imageUrl`.
ไฟล์เก็บใน `uploads/products` ส่วน MongoDB เก็บ URL ตามเดิม ดูรายละเอียดที่
`C:\src\INET_Workshop1\PRODUCT-IMAGES.md`.
เมื่อนำขึ้นเซิร์ฟเวอร์ ตั้ง `PUBLIC_API_URL` เป็น origin ของ Backend ที่เข้าถึงได้
และสำรองโฟลเดอร์รูปควบคู่กับฐานข้อมูล การเปลี่ยนรูปไม่ลบไฟล์เก่าอัตโนมัติ

การเปลี่ยนแปลงนี้ไม่ได้รัน test/build/lint ตามคำขอของเจ้าของโปรเจกต์

