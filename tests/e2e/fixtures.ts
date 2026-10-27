import type { Page } from '@playwright/test'

export async function mockShop(page: Page, role: 'user' | 'admin' | 'guest' = 'user') {
  const user = {
    _id: '000000000000000000000001',
    username: 'tester',
    role: role === 'admin' ? 'admin' : 'user',
    status: 'approved',
  }
  if (role !== 'guest') {
    await page.addInitScript((value) => {
      localStorage.setItem('token', 'synthetic-test-token')
      localStorage.setItem('user', JSON.stringify(value))
    }, user)
  }
  const state = {
    products: Array.from({ length: 30 }, (_, index) => ({
      _id: (index + 10).toString(16).padStart(24, '0'),
      name: `${index % 2 ? 'Keyboard' : 'Mouse'} ${String(index + 1).padStart(2, '0')}`,
      category: index % 2 ? 'Keyboard' : 'Mouse',
      description: 'ข้อมูลจำลองสำหรับทดสอบการเลือกสินค้า',
      imageUrl: '',
      price: 3000 - index * 50,
      stock: index % 5 ? 10 : 0,
      createdAt: '2026-10-26T00:00:00.000Z',
      updatedAt: '2026-10-26T00:00:00.000Z',
    })),
    users: [
      {
        ...user,
        role: 'user',
        status: 'pending',
        username: 'pending-user',
        createdAt: '2026-10-26T00:00:00.000Z',
      },
    ],
    requests: [] as string[],
    writes: [] as string[],
    failProducts: 0,
    failDelete: 0,
    failSave: 0,
    failApproval: 0,
    delaySearch: '',
  }
  await page.route('**/api/v1/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname.replace('/api/v1', '')
    state.requests.push(url.pathname + url.search)
    const method = request.method()
    const respond = (data: unknown, status = 200, message = 'success') =>
      route.fulfill({
        status,
        json: { status, message, data },
      })
    if (method !== 'GET') state.writes.push(method + ' ' + path)
    if (path === '/login') return respond({ token: 'synthetic-login-token', user })
    if (path === '/cart') return respond({ userId: user._id, items: [] })
    if (path === '/admin/users') return respond(state.users)
    if (path.endsWith('/approve')) {
      if (state.failApproval-- > 0) return respond(null, 500, 'อนุมัติไม่สำเร็จ กรุณาลองอีกครั้ง')
      state.users[0]!.status = 'approved'
      return respond(state.users[0])
    }
    if (path === '/products' && method === 'GET') {
      if (state.failProducts-- > 0) return respond(null, 500, 'โหลดสินค้าไม่สำเร็จ')
      const search = url.searchParams.get('search') ?? ''
      if (search && search === state.delaySearch)
        await new Promise((resolve) => setTimeout(resolve, 800))
      const category = url.searchParams.get('category') ?? ''
      const pageNumber = Number(url.searchParams.get('page') ?? 1)
      const limit = Number(url.searchParams.get('limit') ?? 12)
      const all = state.products.filter(
        (product) =>
          product.name.toLowerCase().includes(search.toLowerCase()) &&
          (!category || product.category === category),
      )
      return respond({
        products: all.slice((pageNumber - 1) * limit, pageNumber * limit),
        pagination: {
          page: pageNumber,
          limit,
          total: all.length,
          totalPages: Math.ceil(all.length / limit),
        },
      })
    }
    if (path === '/products' && method === 'POST') {
      if (state.failSave-- > 0) return respond(null, 500, 'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง')
      const product = {
        ...state.products[0]!,
        ...request.postDataJSON(),
        _id: '000000000000000000000999',
      }
      state.products.unshift(product)
      return respond(product, 201)
    }
    if (path.startsWith('/products/')) {
      const id = path.split('/').at(-1)
      const index = state.products.findIndex((product) => product._id === id)
      if (index < 0) return respond(null, 400, 'ไม่พบสินค้า')
      if (method === 'DELETE') {
        if (state.failDelete-- > 0) return respond(null, 500, 'ลบสินค้าไม่สำเร็จ กรุณาลองอีกครั้ง')
        return respond(state.products.splice(index, 1)[0])
      }
      if (method === 'PUT') {
        if (state.failSave-- > 0) return respond(null, 500, 'บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง')
        state.products[index] = { ...state.products[index]!, ...request.postDataJSON() }
      }
      return respond(state.products[index])
    }
    return respond(null, 404, 'Unexpected test API route')
  })
  return state
}
