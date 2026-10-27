<template>
  <main class="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-12">
    <section
      class="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm sm:p-12"
    >
      <RouterLink
        :to="{ name: 'products' }"
        class="inline-flex items-center gap-3 rounded-xl text-xl font-bold text-slate-950 hover:text-orange-700"
      >
        <img src="/logo-app.png" alt="" width="40" height="40" class="rounded-xl" />ShopFlow
      </RouterLink>
      <p class="mt-10 text-sm font-bold tracking-widest text-orange-700">404</p>
      <h1 class="mt-3 text-3xl font-bold text-slate-900">ไม่พบหน้านี้</h1>
      <p class="mt-4 text-sm leading-7 text-slate-600">
        ลิงก์อาจไม่ถูกต้อง หรือหน้านี้อาจถูกย้ายแล้ว<br />กลับไปดูสินค้าได้โดยไม่ต้องเข้าสู่ระบบ
      </p>
      <RouterLink
        :to="{ name: 'products' }"
        class="mt-8 inline-flex min-h-12 items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-semibold text-white hover:bg-slate-800"
        >กลับไปดูสินค้า</RouterLink
      >
    </section>
  </main>
</template>
