export interface ProductFormValues {
  name: string
  price: number | string
  stock: number | string
  category: string
  imageUrl: string
  description: string
}
export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>

// Mirrors INET_Workshop1/src/validations/request.schemas.js.
export function validateProduct(values: ProductFormValues): ProductFormErrors {
  const errors: ProductFormErrors = {}
  if (!values.name.trim()) errors.name = 'กรุณากรอกชื่อสินค้า'
  else if (values.name.trim().length > 120) errors.name = 'ชื่อสินค้าต้องไม่เกิน 120 ตัวอักษร'
  if (typeof values.price !== 'number' || !Number.isFinite(values.price) || values.price < 0)
    errors.price = 'กรอกราคาเป็นตัวเลขตั้งแต่ 0 ขึ้นไป'
  if (typeof values.stock !== 'number' || !Number.isSafeInteger(values.stock) || values.stock < 0)
    errors.stock = 'กรอกจำนวนคงเหลือเป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป'
  if (!values.category.trim() || values.category.trim().length > 80)
    errors.category = 'กรอกหมวดหมู่ 1–80 ตัวอักษร'
  if (values.description.trim().length > 1000)
    errors.description = 'รายละเอียดต้องไม่เกิน 1,000 ตัวอักษร'
  if (values.imageUrl.trim().length > 2048)
    errors.imageUrl = 'ลิงก์รูปภาพต้องไม่เกิน 2,048 ตัวอักษร'
  return errors
}
