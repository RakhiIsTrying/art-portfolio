import { test, expect } from '@playwright/test'

test('home page loads with key sections', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('nav')).toBeVisible()
  await expect(page.getByText(/View My Work/i)).toBeVisible()
  await expect(page.getByText(/Featured Work/i)).toBeVisible()
  await expect(page.getByText(/Browse Collections/i)).toBeVisible()
})

test('nav links navigate to correct pages', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Gallery' }).click()
  await expect(page).toHaveURL('/gallery')
  await expect(page.getByText(/Collections/i)).toBeVisible()
})
