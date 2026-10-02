import { test, expect } from '@playwright/test'

test('inquire form shows validation errors on empty submit', async ({ page }) => {
  await page.goto('/inquire')
  await page.getByRole('button', { name: /send/i }).click()
  await expect(page.getByText(/name is required/i)).toBeVisible()
})

test('inquire form pre-fills piece from query param', async ({ page }) => {
  await page.goto('/inquire?piece=My+Cool+Artwork')
  await expect(page.locator('#piece')).toHaveValue('My Cool Artwork')
})
