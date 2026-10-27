<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, useId, watch } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'
import { registerLeaveConfirmation } from '@/utils/leave-confirmation'
import AppConfirmDialog from '@/components/common/AppConfirmDialog.vue'
import ProductImageField from '@/components/admin/ProductImageField.vue'
import { uploadProductImage } from '@/services/product.service'
import { getErrorMessage } from '@/utils/get-error-message'
import type { Product, ProductPayload } from '@/types/product'
import { validateProduct } from '@/utils/product-validation'
import type { ProductFormErrors, ProductFormValues } from '@/utils/product-validation'

const props = defineProps<{ product?: Product | null; isLoading?: boolean }>()
const emit = defineEmits<{ submit: [payload: ProductPayload]; cancel: [] }>()
const id = useId()
const formElement = ref<HTMLFormElement | null>(null)
const form = reactive<ProductFormValues>({
  name: '',
  price: 0,
  stock: 0,
  description: '',
  imageUrl: '',
  category: 'general',
})
const errors = ref<ProductFormErrors>({})
const selectedFile = ref<File | null>(null)
const isUploading = ref(false)
const uploadProgress = ref<number | null>(null)
const uploadError = ref('')
const uploadNotice = ref('')
const isBusy = computed(() => Boolean(props.isLoading) || isUploading.value)
let uploadController: AbortController | undefined
const initial = ref('')
const dirty = computed(() => Boolean(selectedFile.value) || JSON.stringify(form) !== initial.value)
const showDiscard = ref(false)
let resolveNavigation: ((leave: boolean) => void) | undefined
const textFields = [
  { key: 'name', label: 'ชื่อสินค้า', placeholder: 'เช่น Logitech G Pro X Superlight', max: 120 },
  { key: 'category', label: 'หมวดหมู่', placeholder: 'เช่น Mouse, Keyboard', max: 80 },
] as const

watch([selectedFile, () => form.imageUrl], () => {
  uploadError.value = ''
  uploadNotice.value = ''
  delete errors.value.imageUrl
})

watch(
  () => props.product,
  (product) => {
    uploadController?.abort()
    selectedFile.value = null
    uploadError.value = ''
    uploadNotice.value = ''
    Object.assign(form, {
      name: product?.name ?? '',
      price: product?.price ?? 0,
      stock: product?.stock ?? 0,
      description: product?.description ?? '',
      imageUrl: product?.imageUrl ?? '',
      category: product?.category ?? 'general',
    })
    initial.value = JSON.stringify(form)
    errors.value = {}
  },
  { immediate: true },
)

async function handleSubmit() {
  if (isBusy.value) return
  errors.value = validateProduct(selectedFile.value ? { ...form, imageUrl: '' } : form)
  if (Object.keys(errors.value).length) {
    await nextTick()
    formElement.value?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
    return
  }
  if (selectedFile.value) {
    const controller = new AbortController()
    uploadController = controller
    isUploading.value = true
    uploadProgress.value = null
    uploadError.value = ''
    uploadNotice.value = ''
    try {
      const response = await uploadProductImage(selectedFile.value, controller.signal, (percent) => {
        if (!controller.signal.aborted) uploadProgress.value = percent
      })
      if (controller.signal.aborted) return
      form.imageUrl = response.data.imageUrl
      selectedFile.value = null
    } catch (error) {
      if (controller.signal.aborted) {
        uploadNotice.value = 'ยกเลิกการอัปโหลดแล้ว รูปที่เลือกและข้อมูลในฟอร์มยังอยู่'
      } else {
        uploadError.value = getErrorMessage(error, 'อัปโหลดรูปไม่สำเร็จ กรุณากดบันทึกเพื่อลองอีกครั้ง')
      }
      return
    } finally {
      isUploading.value = false
      uploadController = undefined
    }
  }
  emit('submit', {
    name: form.name.trim(),
    price: Number(form.price),
    stock: Number(form.stock),
    category: form.category.trim(),
    imageUrl: form.imageUrl.trim(),
    description: form.description.trim(),
  })
}
function requestCancel() {
  if (isBusy.value) return
  if (dirty.value) showDiscard.value = true
  else emit('cancel')
}
function finishDiscard(discard: boolean) {
  showDiscard.value = false
  if (resolveNavigation) {
    if (discard) {
      selectedFile.value = null
      initial.value = JSON.stringify(form)
    }
    resolveNavigation(discard)
    resolveNavigation = undefined
  } else if (discard) emit('cancel')
}
async function confirmLeave(): Promise<boolean> {
  if (isBusy.value) return false
  if (!dirty.value) return true
  resolveNavigation?.(false)
  showDiscard.value = true
  return new Promise<boolean>((resolve) => {
    resolveNavigation = resolve
  })
}
onBeforeRouteLeave(confirmLeave)
const unregisterConfirmation = registerLeaveConfirmation(confirmLeave)
function beforeUnload(event: BeforeUnloadEvent) {
  if (!dirty.value) return
  event.preventDefault()
  event.returnValue = ''
}
onMounted(() => window.addEventListener('beforeunload', beforeUnload))
onBeforeUnmount(() => {
  uploadController?.abort()
  unregisterConfirmation()
  window.removeEventListener('beforeunload', beforeUnload)
  resolveNavigation?.(false)
})
</script>

<template>
  <form
    ref="formElement"
    aria-label="ข้อมูลสินค้า"
    novalidate
    class="space-y-6"
    :aria-busy="isBusy"
    @submit.prevent="handleSubmit"
  >
    <p
      v-if="Object.keys(errors).length"
      role="alert"
      class="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
    >
      ตรวจสอบข้อมูลในช่องที่ระบุ ก่อนบันทึกสินค้าอีกครั้ง
    </p>
    <fieldset :disabled="isBusy" class="grid gap-5 md:grid-cols-2">
      <div
        v-for="field in textFields"
        :key="field.key"
        :class="{ 'md:col-span-2': field.key === 'name' }"
      >
        <label :for="id + '-' + field.key" class="mb-2 block text-sm font-medium text-slate-700">{{
          field.label
        }}</label>
        <input
          :id="id + '-' + field.key"
          v-model="form[field.key]"
          type="text"
          :maxlength="field.max"
          :placeholder="field.placeholder"
          required
          :aria-invalid="Boolean(errors[field.key])"
          :aria-describedby="errors[field.key] ? id + '-' + field.key + '-error' : undefined"
          class="app-field min-h-12 w-full px-4 py-3"
        />
        <p
          v-if="errors[field.key]"
          :id="id + '-' + field.key + '-error'"
          class="mt-2 text-sm text-red-700"
        >
          {{ errors[field.key] }}
        </p>
      </div>
      <div>
        <label :for="id + '-price'" class="mb-2 block text-sm font-medium text-slate-700"
          >ราคา (บาท)</label
        >
        <input
          :id="id + '-price'"
          v-model.number="form.price"
          type="number"
          min="0"
          step="any"
          required
          :aria-invalid="Boolean(errors.price)"
          :aria-describedby="errors.price ? id + '-price-error' : undefined"
          class="app-field min-h-12 w-full px-4 py-3"
        />
        <p v-if="errors.price" :id="id + '-price-error'" class="mt-2 text-sm text-red-700">
          {{ errors.price }}
        </p>
      </div>
      <div>
        <label :for="id + '-stock'" class="mb-2 block text-sm font-medium text-slate-700"
          >จำนวนคงเหลือ (ชิ้น)</label
        >
        <input
          :id="id + '-stock'"
          v-model.number="form.stock"
          type="number"
          min="0"
          step="1"
          required
          :aria-invalid="Boolean(errors.stock)"
          :aria-describedby="errors.stock ? id + '-stock-error' : undefined"
          class="app-field min-h-12 w-full px-4 py-3"
        />
        <p v-if="errors.stock" :id="id + '-stock-error'" class="mt-2 text-sm text-red-700">
          {{ errors.stock }}
        </p>
      </div>
      <ProductImageField
        v-model="form.imageUrl"
        v-model:file="selectedFile"
        :error="uploadError || errors.imageUrl"
        class="md:col-span-2"
      />
      <div class="md:col-span-2">
        <label :for="id + '-description'" class="mb-2 block text-sm font-medium text-slate-700"
          >รายละเอียด (ไม่บังคับ)</label
        >
        <textarea
          :id="id + '-description'"
          v-model="form.description"
          rows="5"
          maxlength="1000"
          :aria-invalid="Boolean(errors.description)"
          :aria-describedby="id + '-description-help'"
          class="app-field w-full resize-none px-4 py-3"
        />
        <p
          :id="id + '-description-help'"
          class="mt-2 text-sm"
          :class="errors.description ? 'text-red-700' : 'text-slate-500'"
        >
          {{ errors.description || form.description.length + ' / 1,000 ตัวอักษร' }}
        </p>
      </div>
    </fieldset>
    <div v-if="isUploading" class="space-y-2 rounded-xl bg-orange-50 p-4">
      <p role="status" class="text-sm font-medium text-orange-900">
        {{ uploadProgress === 100 ? 'กำลังเตรียมรูปภาพ...' : 'กำลังอัปโหลดรูปภาพ...' }}
        <span v-if="uploadProgress !== null && uploadProgress < 100">{{ uploadProgress }}%</span>
      </p>
      <progress
        :value="uploadProgress === 100 ? undefined : uploadProgress ?? undefined"
        max="100"
        aria-label="ความคืบหน้าการอัปโหลดรูปภาพ"
        class="h-2 w-full accent-orange-600"
      />
      <button
        type="button"
        class="min-h-11 rounded-lg px-3 text-sm font-semibold text-orange-900 underline underline-offset-4 hover:bg-orange-100"
        @click="uploadController?.abort()"
      >ยกเลิกการอัปโหลด</button>
    </div>
    <p v-if="uploadNotice" role="status" class="text-sm text-slate-600">{{ uploadNotice }}</p>
    <div class="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
      <button
        type="button"
        :disabled="isBusy"
        class="min-h-12 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        @click="requestCancel"
      >
        ยกเลิก
      </button>
      <button
        type="submit"
        :disabled="isBusy"
        class="min-h-12 min-w-40 rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
      >
        {{ isUploading ? 'กำลังอัปโหลดรูป...' : isLoading ? 'กำลังบันทึก...' : 'บันทึกสินค้า' }}
      </button>
    </div>
  </form>
  <AppConfirmDialog
    :open="showDiscard"
    title="ละทิ้งการแก้ไข?"
    description="ข้อมูลสินค้าที่ยังไม่ได้บันทึกจะหายไป หากต้องการเก็บข้อมูลให้กลับไปบันทึกก่อน"
    confirm-label="ละทิ้งการแก้ไข"
    cancel-label="แก้ไขต่อ"
    @confirm="finishDiscard(true)"
    @cancel="finishDiscard(false)"
  />
</template>
