import { test, expect } from "@playwright/test";
import { faker } from "@faker-js/faker";
import prisma from "@/lib/db";

test.describe("Auth System Flow", () => {
  const user = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.person.fullName(),
  };

  test.afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: user.email },
    });
  });

  test("Full Auth Lifecycle: Register -> Logout -> Login", async ({ page }) => {
    //redirects unauthorized users to login
    await page.goto("/");
    await page.waitForURL("**/login", { timeout: 10000 });

    //Signup
    await page.getByRole("link", { name: /Sign up/i }).click();
    await page.waitForURL("**/signup", { timeout: 10000 });
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(user.password);
    await page.getByLabel("Confirm Password").fill(user.password);
    await page.getByRole("button", { name: /Register/i }).click();

    //redirects to home after registeration succeeds
    await page.waitForURL("**/workflows", { timeout: 10000 });
    //homepage logo
    await expect(page.getByRole("link", { name: /Nodebase/i })).toBeVisible();
    const workflowLink = page.getByRole("link", { name: /Workflows/i });
    await expect(workflowLink).toHaveAttribute("data-active", "true");

    //logout
    // We clear cookies to simulate logout (or you could click your Sign Out button)
    await page.context().clearCookies();
    await page.reload();

    //redirects to logout when user is npt authenticated
    await page.waitForURL("**/login", { timeout: 10000 });
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    const loginButton = page.getByRole("button", { name: /Login/i });
    await Promise.all([
      loginButton.click(),
      page.waitForURL("**/workflows", { timeout: 10000 }),
    ]);
    //homepage logo
    await expect(page.getByRole("link", { name: /Nodebase/i })).toBeVisible();
  });
});
