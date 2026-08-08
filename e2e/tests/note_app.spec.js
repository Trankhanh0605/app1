const { test, expect } = require("@playwright/test")
const { describe } = require("node:test")

describe('Note app', () => {
  test('front page can be opened', async ({ page }) => {
    await page.goto('http://localhost:5173')
    const locator = page.getByText('Notes')
    await expect(locator).toBeVisible()
    await expect(page.getByText('Tran Nguyen Khanh, learning web dev')).toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.getByRole('button', { name: 'login' }).click()
    const textboxes = await page.getByRole('textbox').all()
    await textboxes[0].fill('Khanh')
    await textboxes[1].fill('khanh060506')
    await page.getByRole('button', { name: 'login' }).click()
    await expect(page.getByText('TranKhanh logged in')).toBeVisible()
  })
})

