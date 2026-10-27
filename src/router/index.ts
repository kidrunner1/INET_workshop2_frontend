import { createRouter, createWebHistory } from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.path === from.path) return
    return { top: 0 }
  },
  routes: [
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: {
        guestOnly: true,
      },
    },

    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
      meta: {
        guestOnly: true,
      },
    },

    // Customer
    {
      path: '/',
      component: () => import('@/layouts/MainLayout.vue'),

      children: [
        {
          path: '',
          // The storefront is the public application entry point for every role.
          redirect: {
            name: 'products',
          },
        },

        {
          path: 'products',
          name: 'products',
          component: () => import('@/views/products/ProductListView.vue'),
        },

        {
          path: 'products/:id',
          name: 'product-detail',
          component: () => import('@/views/products/ProductDetailView.vue'),
        },

        {
          path: 'cart',
          name: 'cart',
          meta: { requiresAuth: true },
          component: () => import('@/views/cart/CartView.vue'),
        },

        {
          path: 'orders',
          name: 'orders',
          meta: { requiresAuth: true },
          component: () => import('@/views/orders/MyOrdersView.vue'),
        },

        {
          path: 'orders/:id',
          name: 'user-order-detail',
          meta: { requiresAuth: true },
          component: () => import('@/views/orders/UserOrderDetailView.vue'),
        },
      ],
    },

    // Admin
    {
      path: '/admin',
      component: () => import('@/layouts/AdminLayout.vue'),

      meta: {
        requiresAuth: true,
        requiresAdmin: true,
      },

      children: [
        {
          path: '',
          redirect: {
            name: 'admin-users',
          },
        },

        {
          path: 'users',
          name: 'admin-users',
          component: () => import('@/views/admin/UsersView.vue'),
        },

        {
          path: 'products',
          name: 'admin-products',
          component: () => import('@/views/admin/ProductsView.vue'),
        },

        {
          path: 'orders',
          name: 'admin-orders',
          component: () => import('@/views/admin/OrdersView.vue'),
        },

        {
          path: 'orders/:id',
          name: 'admin-order-detail',
          component: () => import('@/views/admin/AdminOrderDetailView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  const requiresAuth = to.matched.some((route) => route.meta.requiresAuth)

  const requiresAdmin = to.matched.some((route) => route.meta.requiresAdmin)

  const guestOnly = to.matched.some((route) => route.meta.guestOnly)

  if (requiresAuth && !authStore.isAuthenticated) {
    return {
      name: 'login',
      query: { redirect: to.fullPath },
    }
  }

  if (requiresAdmin && !authStore.isAdmin) {
    return {
      name: 'products',
    }
  }

  if (guestOnly && authStore.isAuthenticated) {
    return {
      name: authStore.isAdmin ? 'admin-users' : 'products',
    }
  }
})

const pageTitles: Record<string, string> = {
  login: 'เข้าสู่ระบบ',
  register: 'สมัครสมาชิก',
  products: 'เลือกซื้อสินค้า',
  'product-detail': 'รายละเอียดสินค้า',
  cart: 'ตะกร้าสินค้า',
  orders: 'คำสั่งซื้อของฉัน',
  'user-order-detail': 'รายละเอียดคำสั่งซื้อ',
  'admin-users': 'จัดการผู้ใช้งาน',
  'admin-products': 'จัดการสินค้า',
  'admin-orders': 'จัดการคำสั่งซื้อ',
  'admin-order-detail': 'รายละเอียดคำสั่งซื้อ',
  'not-found': 'ไม่พบหน้านี้',
}
router.afterEach((to, _from, failure) => {
  if (!failure) document.title = (pageTitles[String(to.name)] ?? 'ร้านอุปกรณ์ไอที') + ' | ShopFlow'
})

export default router
