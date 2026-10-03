import { test, expect } from '@playwright/test'

test('unauthenticated visit to /admin redirects to login', async ({ page }) => {
  await page.goto('/admin/artworks')
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('unauthenticated visit to /admin root redirects to login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('/admin/login is accessible without auth', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page).toHaveURL(/\/admin\/login/)
})
