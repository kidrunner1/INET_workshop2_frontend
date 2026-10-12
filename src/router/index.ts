import {
  createRouter,
  createWebHistory,
} from 'vue-router'

import { useAuthStore } from '@/stores/auth.store'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
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
      meta: {
        requiresAuth: true,
      },

      children: [
        {
          path: '',
          redirect: {
            name: 'products',
          },
        },

        {
          path: 'products',
          name: 'products',
          component: () =>
            import('@/views/products/ProductListView.vue'),
        },

        {
          path: 'products/:id',
          name: 'product-detail',
          component: () =>
            import('@/views/products/ProductDetailView.vue'),
        },

        {
          path: 'cart',
          name: 'cart',
          component: () =>
            import('@/views/cart/CartView.vue'),
        },

        {
          path: 'orders',
          name: 'orders',
          component: () =>
            import('@/views/orders/MyOrdersView.vue'),
        },

        {
          path: 'orders/:id',
          name: 'user-order-detail',
          component: () =>
            import('@/views/orders/UserOrderDetailView.vue'),
        },
      ],
    },

    // Admin
    {
      path: '/admin',
      component: () =>
        import('@/layouts/AdminLayout.vue'),

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
          component: () =>
            import('@/views/admin/UsersView.vue'),
        },

        {
          path: 'products',
          name: 'admin-products',
          component: () =>
            import('@/views/admin/ProductsView.vue'),
        },

        {
          path: 'orders',
          name: 'admin-orders',
          component: () =>
            import('@/views/admin/OrdersView.vue'),
        },

        {
          path: 'orders/:id',
          name: 'admin-order-detail',
          component: () =>
            import('@/views/admin/AdminOrderDetailView.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const authStore = useAuthStore()

  const requiresAuth = to.matched.some(
    (route) => route.meta.requiresAuth,
  )

  const requiresAdmin = to.matched.some(
    (route) => route.meta.requiresAdmin,
  )

  const guestOnly = to.matched.some(
    (route) => route.meta.guestOnly,
  )

  if (
    requiresAuth &&
    !authStore.isAuthenticated
  ) {
    return {
      name: 'login',
    }
  }

  if (
    requiresAdmin &&
    !authStore.isAdmin
  ) {
    return {
      name: 'products',
    }
  }

  if (
    guestOnly &&
    authStore.isAuthenticated
  ) {
    return {
      name: authStore.isAdmin
        ? 'admin-users'
        : 'products',
    }
  }
})

export default router
