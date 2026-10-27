<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useId, watch } from 'vue'

const props = defineProps<{
  modelValue: string
  file: File | null
  error?: string
}>()
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:file': [file: File | null]
}>()
const id = useId()
const localUrl = ref('')
const localError = ref('')
const previewFailed = ref(false)
const preview = computed(() => localUrl.value || props.modelValue.trim())
const errorMessage = computed(() => localError.value || props.error)

function releasePreview() {
  if (localUrl.value) URL.revokeObjectURL(localUrl.value)
  localUrl.value = ''
}
watch(() => props.file, (file) => {
  releasePreview()
  localError.value = ''
  if (file) localUrl.value = URL.createObjectURL(file)
}, { immediate: true })
watch(preview, () => { previewFailed.value = false })
onBeforeUnmount(releasePreview)

function selectFile(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    localError.value = 'รองรับเฉพาะรูป JPG, PNG และ WebP กรุณาเลือกไฟล์ใหม่'
    return
  }
  if (!file.size || file.size > 5 * 1024 * 1024) {
    localError.value = 'เลือกไฟล์รูปภาพที่ไม่ว่าง และมีขนาดไม่เกิน 5 MB'
    return
  }
  localError.value = ''
  emit('update:file', file)
}
function editUrl(event: Event) {
  localError.value = ''
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
    <div>
      <label :for="id + '-file'" class="block text-sm font-semibold text-slate-800">
        รูปภาพสินค้า (ไม่บังคับ)
      </label>
      <p :id="id + '-help'" class="mt-1 text-sm text-slate-500">
        เลือกรูปจากเครื่อง JPG, PNG หรือ WebP ไม่เกิน 5 MB รูปจะอัปโหลดเมื่อบันทึกสินค้า
      </p>
    </div>
    <div class="grid items-start gap-4 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <div class="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-3">
        <img
          v-if="preview && !previewFailed"
          :src="preview"
          alt="ตัวอย่างรูปภาพสินค้า"
          class="h-full w-full object-contain"
          @error="previewFailed = true"
        />
        <p v-else class="text-center text-sm text-slate-500">
          {{ previewFailed ? 'แสดงตัวอย่างรูปไม่ได้ กรุณาตรวจสอบไฟล์หรือลิงก์' : 'ยังไม่มีรูปภาพ' }}
        </p>
      </div>
      <div class="min-w-0 space-y-3">
        <input
          :id="id + '-file'"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          :aria-invalid="Boolean(errorMessage)"
          :aria-describedby="id + '-help' + (errorMessage ? ' ' + id + '-error' : '')"
          class="block min-h-12 w-full min-w-0 rounded-lg text-sm text-slate-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-orange-100 file:px-4 file:py-3 file:font-semibold file:text-orange-900"
          @change="selectFile"
        />
        <p v-if="file" class="wrap-break-word text-sm text-slate-700" role="status">
          เลือกแล้ว: {{ file.name }} ({{ (file.size / 1024 / 1024).toFixed(2) }} MB)
        </p>
        <button
          v-if="file"
          type="button"
          class="min-h-11 rounded-lg px-3 text-sm font-medium text-slate-700 underline underline-offset-4 hover:bg-slate-200"
          @click="emit('update:file', null)"
        >ยกเลิกการเลือกรูปใหม่</button>
        <button
          v-else-if="modelValue"
          type="button"
          class="min-h-11 rounded-lg px-3 text-sm font-medium text-red-700 underline underline-offset-4 hover:bg-red-50"
          @click="emit('update:modelValue', '')"
        >นำรูปออกจากสินค้า</button>
      </div>
    </div>
    <div>
      <label :for="id + '-url'" class="mb-2 block text-sm font-medium text-slate-700">
        หรือใช้ลิงก์รูปภาพ
      </label>
      <input
        :id="id + '-url'"
        :value="modelValue"
        :disabled="Boolean(file)"
        type="text"
        maxlength="2048"
        placeholder="https://..."
        :aria-invalid="Boolean(error)"
        :aria-describedby="errorMessage ? id + '-error' : undefined"
        class="app-field min-h-12 w-full px-4 py-3 disabled:bg-slate-100 disabled:text-slate-400"
        @input="editUrl"
      />
      <p v-if="file" class="mt-2 text-sm text-slate-500">รูปที่เลือกจะใช้แทนลิงก์เดิมเมื่อบันทึก</p>
    </div>
    <p v-if="errorMessage" :id="id + '-error'" role="alert" class="text-sm text-red-700">
      {{ errorMessage }}
    </p>
  </div>
</template>
