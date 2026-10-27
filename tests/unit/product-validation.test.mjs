import test from 'node:test'
import assert from 'node:assert/strict'
import { validateProduct } from '../../src/utils/product-validation.ts'

const product = {
  name: 'Mouse',
  price: 199.5,
  stock: 2,
  category: 'Mouse',
  imageUrl: '',
  description: '',
}

test('valid free/decimal-price products follow the backend contract', () => {
  assert.deepEqual(validateProduct(product), {})
  assert.deepEqual(validateProduct({ ...product, price: 0, stock: 0 }), {})
})

test('blank, negative and nonfinite prices and fractional stock never submit', () => {
  for (const price of ['', '12', -1, NaN, Infinity])
    assert.ok(validateProduct({ ...product, price }).price)
  for (const stock of ['', -1, 0.5, NaN, Infinity])
    assert.ok(validateProduct({ ...product, stock }).stock)
  assert.ok(validateProduct({ ...product, name: '   ' }).name)
})

test('text limits match server schema, after trimming', () => {
  assert.equal(validateProduct({ ...product, name: ' ' + 'a'.repeat(120) + ' ' }).name, undefined)
  for (const [key, length] of [
    ['name', 121],
    ['category', 81],
    ['description', 1001],
    ['imageUrl', 2049],
  ]) {
    assert.ok(validateProduct({ ...product, [key]: 'a'.repeat(length) })[key])
  }
})
