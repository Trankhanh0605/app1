const { test, expect, beforeEach, describe } = require("@playwright/test")

describe('Note app', () => {
  beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5173')
  })

  test('front page can be opened', async ({ page }) => {
    const locator = page.getByText('Notes')
    await expect(locator).toBeVisible()
    await expect(page.getByText('Tran Nguyen Khanh, learning web dev')).toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    await page.getByRole('button', { name: 'login' }).click()
    const textboxes = await page.getByRole('textbox').all()
    await textboxes[0].fill('Khanh')
    await textboxes[1].fill('khanh060506')
    await page.getByRole('button', { name: 'login' }).click()
    await expect(page.getByText('TranKhanh logged in')).toBeVisible()
  })

  describe('when logged in', ()=>{
    beforeEach(async({page})=>{
      await page.getByRole('button', {name:'login'}).click()
      await page.getByLabel('username').fill('Khanh')
      await page.getByLabel('password').fill('khanh060506')
      await page.getByRole('button', {name: 'login'}).click()
    })
    test('a new note can be created', async({page})=>{
      await expect(page.getByText('TranKhanh logged in')).toBeVisible()
      await page.getByRole('button', {name:'new note'}).click()
      await page.getByRole('textbox').fill('a note created by playwright')
      await page.getByRole('button', {name:'save'}).click()
      await expect(page.getByText('a note created by playwright')).toBeVisible()
    })
  })
})

