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
    await page.goto("/signup");

    //layout link test
    const logoLink = page.getByRole("link", { name: /Nodebase/i });
    await logoLink.click();
    await page.waitForURL("/", { timeout: 10000 });

    await page.goto("/signup");
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password", { exact: true }).fill(user.password);
    await page.getByLabel("Confirm Password").fill(user.password);
    await page.getByRole("button", { name: /Register/i }).click();

    //redirects to home after registeration succeeds
    await page.waitForURL("/", { timeout: 10000 });

    //logout
    await page.context().clearCookies();

    //login test
    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    const loginButton = page.getByRole("button", { name: /Login/i });
    await Promise.all([
      loginButton.click(),
      page.waitForURL("/", { timeout: 10000 }),
    ]);
  });
});
