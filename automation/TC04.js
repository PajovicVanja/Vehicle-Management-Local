// automation/TC04.js

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

// CONFIGURATION
const APP_URL = 'http://localhost:3000';
const DRIVER_EMAIL = 'drivertest@a.com';
const DRIVER_PASS = '123123';

describe('TC-04: Driver Vehicle Reservation & Date Rules', function () {
    this.timeout(60000); 
    let driver;

    // --- HELPERS ---

    function getDate(offsetDays) {
        const d = new Date();
        d.setDate(d.getDate() + offsetDays);
        return d;
    }

    async function selectDateOnCalendar(driver, targetDate) {
        const currentMonthStr = await driver.findElement(By.className('react-calendar__navigation__label__labelText')).getText();
        const targetMonthStr = targetDate.toLocaleString('default', { month: 'long', year: 'numeric' });

        if (currentMonthStr !== targetMonthStr) {
            const nextBtn = await driver.findElement(By.className('react-calendar__navigation__next-button'));
            await nextBtn.click();
        }

        const day = targetDate.getDate();
        const dayXpath = `//button[contains(@class, 'react-calendar__tile') and not(contains(@class, '--neighboringMonth')) and .//abbr[text()='${day}']]`;
        const dayBtn = await driver.wait(until.elementLocated(By.xpath(dayXpath)), 2000);
        await dayBtn.click();
    }

    // ROBUST CLEANUP FUNCTION
    async function cleanupReservation(driver) {
        try {
            // 1. Ensure we are on the List Page to find the button
            const currentUrl = await driver.getCurrentUrl();
            // If we are stuck on the "Reserve Vehicle" form, go back
            const headers = await driver.findElements(By.tagName('h2'));
            if (headers.length > 0 && (await headers[0].getText()).includes('Reserve Vehicle')) {
                const backBtn = await driver.findElement(By.className('goto-vehicle-select-button'));
                await backBtn.click();
                await driver.wait(until.elementLocated(By.xpath("//h2[text()='List of All Vehicles']")), 5000);
            }

            // 2. Look for "Remove Reserve" button
            // It might take a second to load after a redirect
            await driver.sleep(1000);
            const removeBtns = await driver.findElements(By.xpath("//button[text()='Remove Reserve']"));
            
            if (removeBtns.length > 0) {
                console.log("   [Cleanup] Found stuck reservation. Removing...");
                await driver.executeScript("arguments[0].scrollIntoView(true);", removeBtns[0]);
                await removeBtns[0].click();
                
                // Wait for it to disappear
                await driver.wait(until.stalenessOf(removeBtns[0]), 5000);
                console.log("   [Cleanup] Reservation removed successfully.");
            }
        } catch (e) {
            console.log("   [Cleanup Info] Cleanup skipped or failed: " + e.message);
        }
    }

    before(async function () {
        let options = new chrome.Options();
        options.addArguments('--remote-allow-origins=*');
        options.addArguments('--disable-search-engine-choice-screen');
        options.addArguments('--start-maximized');

        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    });

    after(async function () {
        if (driver) {
            // Final Safety Net Cleanup
            await cleanupReservation(driver);
            await driver.quit();
        }
    });

    it('Step 1: Login as Driver', async function () {
        await driver.get(APP_URL);
        const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
        await emailInput.sendKeys(DRIVER_EMAIL);
        await driver.findElement(By.css('input[type="password"]')).sendKeys(DRIVER_PASS);
        await driver.findElement(By.className('login-button')).click();
        await driver.wait(until.elementLocated(By.xpath("//button[text()='Reserve Vehicle']")), 10000);
    });

    it('Step 2: Navigate to Vehicle List', async function () {
        const reserveBtn = await driver.findElement(By.xpath("//button[text()='Reserve Vehicle']"));
        await reserveBtn.click();
        await driver.wait(until.elementLocated(By.xpath("//h2[text()='List of All Vehicles']")), 10000);
        await driver.wait(until.elementLocated(By.className('vehicle-table')), 10000);
    });

    // --- TEST CASES ---
    const testCases = [
        { desc: '1. Valid: Start Today, End Tomorrow', daysOffset: 1, expected: 'success' },
        { desc: '2. Valid: Start Today, End +30 days', daysOffset: 30, expected: 'success' },
        { desc: '3. Invalid: Start Today, End Today (0 days)', daysOffset: 0, expected: 'error' }, 
        { desc: '4. Invalid: Start Today, End +31 days', daysOffset: 31, expected: 'error' }
    ];

    testCases.forEach((tc) => {
        it(`Step 3: ${tc.desc} -> Expect: ${tc.expected}`, async function () {
            // TRY-FINALLY BLOCK TO GUARANTEE CLEANUP
            try {
                // 1. Initial Cleanup (ensure previous test didn't leave a mess)
                await cleanupReservation(driver);

                // 2. Find an Available Vehicle
                const reserveBtns = await driver.findElements(By.className('reserve-button'));
                if (reserveBtns.length === 0) {
                    throw new Error("No available vehicles to reserve! Previous cleanup might have failed.");
                }

                // Click the first one
                const firstReserveBtn = reserveBtns[0];
                await driver.executeScript("arguments[0].scrollIntoView(true);", firstReserveBtn);
                await firstReserveBtn.click();

                // 3. Wait for Reservation Form
                await driver.wait(until.elementLocated(By.xpath("//h2[text()='Reserve Vehicle']")), 5000);

                // 4. Set Date
                const targetDate = getDate(tc.daysOffset);
                await selectDateOnCalendar(driver, targetDate);

                // 5. Submit
                const submitBtn = await driver.findElement(By.xpath("//button[text()='Reserve']"));
                await submitBtn.click();

                // 6. Verification
                if (tc.expected === 'success') {
                    try {
                        // Expect redirect back to list
                        await driver.wait(until.elementLocated(By.xpath("//h2[text()='List of All Vehicles']")), 5000);
                        // Verify "Remove Reserve" button appears
                        await driver.wait(until.elementLocated(By.xpath("//button[text()='Remove Reserve']")), 5000);
                    } catch (err) {
                        // Check if stuck on form
                        const pageSource = await driver.getPageSource();
                        if (pageSource.includes("Reserve Vehicle")) {
                             let msg = "Unknown";
                             try { msg = await driver.findElement(By.className('profile-message')).getText(); } catch(e){}
                             throw new Error(`Expected SUCCESS but stayed on form. Msg: ${msg}`);
                        }
                        throw err;
                    }
                } else {
                    // EXPECTED ERROR
                    await driver.sleep(1000);
                    const headers = await driver.findElements(By.tagName('h2'));
                    let headerText = headers.length > 0 ? await headers[0].getText() : "";

                    if (headerText.includes('List of All Vehicles')) {
                        // BUG FOUND: It redirected (Success) when it should have failed.
                        throw new Error(`Bug Found: App allowed invalid reservation duration (${tc.daysOffset} days).`);
                    } else {
                        // Correct: Stayed on page, show error
                        const msgEl = await driver.wait(until.elementLocated(By.className('profile-message')), 2000);
                        expect(await msgEl.getText()).to.not.be.empty;
                        
                        // Manual Reset back to list so next test can run
                        const backBtn = await driver.findElement(By.className('goto-vehicle-select-button'));
                        await backBtn.click();
                        await driver.wait(until.elementLocated(By.xpath("//h2[text()='List of All Vehicles']")), 5000);
                    }
                }
            } finally {
                // --- THIS RUNS EVERY TIME, EVEN IF BUG FOUND ---
                // If we ended up with a reservation (validly OR via bug), remove it now.
                if (tc.expected === 'success') {
                    await cleanupReservation(driver);
                } else {
                    // If it was an error test case, check if it accidentally created a reservation anyway
                    // We pause briefly to let any redirects finish
                    await driver.sleep(500);
                    await cleanupReservation(driver);
                }
            }
        });
    });
});