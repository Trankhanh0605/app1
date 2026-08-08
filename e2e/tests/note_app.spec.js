const { test, expect, beforeEach, describe } = require("@playwright/test")
const {loginWith}=require('./helper')

describe('Note app', () => {
  beforeEach(async ({ page, request }) => {
    await request.post('http://localhost:3001/api/testing/reset')
    await request.post('http://localhost:3001/api/users', {
      data: {
        name: 'Khanh',
        username: 'TranKhanh',
        password: 'khanh060506'
      }
    })

    await page.goto('http://localhost:5173')
  })

  test('front page can be opened', async ({ page }) => {
    const locator = page.getByText('Notes')
    await expect(locator).toBeVisible()
    await expect(page.getByText('Tran Nguyen Khanh, learning web dev')).toBeVisible()
  })

  test('user can log in', async ({ page }) => {
    await loginWith(page, 'TranKhanh', 'khanh060506')
    await expect(page.getByText('Khanh logged in')).toBeVisible()
  })

  test('login fails with wrong password', async ({ page }) => {
    await loginWith(page, 'TranKhanh', 'wrong')

    const errorDiv = page.locator('.error')
    await expect(errorDiv).toContainText('wrong credentials')
    await expect(errorDiv).toHaveCSS('border-style', 'solid')
    await expect(errorDiv).toHaveCSS('color', 'rgb(255, 0, 0)')
    await expect(page.getByText('Khanh logged in')).not.toBeVisible()
  })

  test('user can log in with correct credentials', async({page})=>{
    await page.getByRole('button', {name:'login'}).click()
    await page.getByLabel('username').fill('TranKhanh')
    await page.getByLabel('password').fill('khanh060506')
    await page.getByRole('button', {name:'login'}).click()
    await expect(page.getByText('Khanh logged in')).toBeVisible()
  })

  describe('when logged in', () => {
    beforeEach(async ({ page }) => {
      await loginWith(page, 'TranKhanh', 'khanh060506')
    })
    test('a new note can be created', async ({ page }) => {
      await expect(page.getByText('Khanh logged in')).toBeVisible()
      await page.getByRole('button', { name: 'new note' }).click()
      await page.getByRole('textbox').fill('a note created by playwright')
      await page.getByRole('button', { name: 'save' }).click()
      await expect(page.getByText('a note created by playwright')).toBeVisible()
    })

    describe('and a note exists', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'new note' }).click()
        await page.getByRole('textbox').fill('another note by playwright')
        await page.getByRole('button', { name: 'save' }).click()
      })

      test('importance can be changed', async ({ page }) => {
        await page.getByRole('button', { name: 'make not important' }).click()
        await expect(page.getByText('make important')).toBeVisible()
      })
    })

  })
})

