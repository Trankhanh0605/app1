const { test, expect } = require("@playwright/test")

test('front page can be opened', async ({ page }) => {
  await page.goto('http://localhost:5173')
  const locator = page.getByText('Notes')
  await expect(locator).toBeVisible()
  await expect(page.getByText('Tran Nguyen Khanh, learning web dev')).toBeVisible()
})