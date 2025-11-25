// automation/TC03.js

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');

// CONFIGURATION
const APP_URL = 'http://localhost:3000';
const ADMIN_EMAIL = 'admin@a.com';
const ADMIN_PASS = '123123';

describe('TC-03: Admin Add Vehicle & Filtering Validation', function () {
    this.timeout(60000); 
    let driver;

    // Define Data Globally
    const testCases = [
        { desc: '1. Lower Boundaries (Valid)', data: { name: 'A', color: 'black', year: '1990', hp: '40', engine: 'I4' }, expected: 'success' },
        { desc: '2. Upper Boundaries (Valid)', data: { name: 'X'.repeat(50), color: 'gray', year: '2050', hp: '1500', engine: 'V8' }, expected: 'success' },
        { desc: '3. Invalid Year (1989)', data: { name: 'TestYear', color: 'white', year: '1989', hp: '100', engine: 'V6' }, expected: 'error' },
        { desc: '4. Invalid HP (39)', data: { name: 'TestHP', color: 'blue', year: '2020', hp: '39', engine: 'V6' }, expected: 'error' },
        { desc: '5. Missing Field (Color)', data: { name: 'NoColor', color: '', year: '2022', hp: '200', engine: 'V6' }, expected: 'error' },
        { desc: '6. Capitalized Color (Valid + Filter Check)', data: { name: 'BigBlack', color: 'Black', year: '2022', hp: '200', engine: 'V6' }, expected: 'success' }
    ];

    before(async function () {
        let options = new chrome.Options();
        options.addArguments('--remote-allow-origins=*');
        options.addArguments('--disable-search-engine-choice-screen');
        options.addArguments('--start-maximized');

        driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
    });

    // --- AGGRESSIVE CLEANUP HOOK ---
    // Runs regardless of pass/fail
    after(async function () {
        if (!driver) return;
        console.log('\n   [Cleanup] Starting "Search & Destroy" Sequence...');

        try {
            // 1. Force Reset to Dashboard to ensure we aren't stuck on an Error page
            await driver.get(APP_URL);
            await driver.sleep(1000);

            // 2. Safety Net: Re-login if session was lost
            const loginInputs = await driver.findElements(By.css('input[type="email"]'));
            if (loginInputs.length > 0) {
                console.log("   [Cleanup] Session lost. Re-logging in...");
                await loginInputs[0].sendKeys(ADMIN_EMAIL);
                await driver.findElement(By.css('input[type="password"]')).sendKeys(ADMIN_PASS);
                await driver.findElement(By.className('login-button')).click();
                await driver.sleep(1000);
            }

            // 3. Navigate to List
            const viewBtn = await driver.wait(until.elementLocated(By.xpath("//button[text()='View Vehicles']")), 5000);
            await viewBtn.click();
            
            // 4. Wait for Table to Render
            await driver.wait(until.elementLocated(By.className('vehicle-table')), 5000);

            // 5. DELETE LOOP
            for (const tc of testCases) {
                const name = tc.data.name;
                // Loop until no rows with this name exist
                while (true) {
                    try {
                        // Find row with name
                        const xpath = `//tr[td[contains(text(), '${name}')]]//button[text()='Delete']`;
                        const btns = await driver.findElements(By.xpath(xpath));

                        if (btns.length === 0) break; // Clean!

                        // Delete found instance
                        const btn = btns[0];
                        await driver.executeScript("arguments[0].scrollIntoView(true);", btn);
                        await btn.click();
                        console.log(`   [Cleanup] Deleted residual: ${name}`);
                        
                        // Wait for refresh
                        await driver.sleep(1500);
                    } catch (e) {
                        break; // Move to next name on error
                    }
                }
            }

        } catch (e) {
            console.error("   [Cleanup Error] Could not complete cleanup:", e.message);
        } finally {
            await driver.quit();
        }
    });

    it('Step 1: Login as Admin', async function () {
        await driver.get(APP_URL);
        const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
        const passInput = await driver.findElement(By.css('input[type="password"]'));
        await emailInput.sendKeys(ADMIN_EMAIL);
        await passInput.sendKeys(ADMIN_PASS);
        const loginBtn = await driver.findElement(By.className('login-button'));
        await loginBtn.click();
        await driver.wait(until.elementLocated(By.xpath("//button[text()='View Vehicles']")), 10000);
    });

    it('Step 2: Navigate to Vehicle List', async function () {
        const viewVehiclesBtn = await driver.findElement(By.xpath("//button[text()='View Vehicles']"));
        await viewVehiclesBtn.click();
        await driver.wait(until.elementLocated(By.xpath("//h2[text()='List of All Vehicles']")), 10000);
    });

    // --- TEST EXECUTION ---
    testCases.forEach((tc) => {
        it(`Step 3: ${tc.desc} -> Expect: ${tc.expected}`, async function () {
            
            // Navigate to Add Page (Handle potential redirect loops)
            const addVehicleBtn = await driver.wait(until.elementLocated(By.xpath("//button[text()='Add Vehicle']")), 10000);
            await driver.sleep(200);
            await addVehicleBtn.click();
            await driver.wait(until.elementLocated(By.xpath("//h2[text()='Add vehicle']")), 5000);

            // Fill Form
            if (tc.data.name) await driver.findElement(By.css('input[placeholder="Vehicle Name"]')).sendKeys(tc.data.name);
            if (tc.data.color) await driver.findElement(By.css('input[placeholder="Vehicle Color"]')).sendKeys(tc.data.color);
            if (tc.data.year) await driver.findElement(By.css('input[placeholder="Vehicle Year"]')).sendKeys(tc.data.year);
            if (tc.data.engine) await driver.findElement(By.css('input[placeholder="Engine"]')).sendKeys(tc.data.engine);
            if (tc.data.hp) await driver.findElement(By.css('input[placeholder="HP"]')).sendKeys(tc.data.hp);

            // Submit
            const submitBtn = await driver.findElement(By.xpath("//button[text()='Add vehicle']"));
            await submitBtn.click();

            // Logic
            if (tc.expected === 'success') {
                // Success: Expect table
                try {
                    await driver.wait(until.elementLocated(By.className('vehicle-table')), 10000);
                    const tableText = await driver.findElement(By.className('vehicle-table')).getText();
                    expect(tableText).to.include(tc.data.name);
                } catch (err) {
                    const pageSource = await driver.getPageSource();
                    if (pageSource.includes("Add vehicle")) throw new Error(`Expected SUCCESS but remained on form.`);
                    throw err;
                }
            } else {
                // Error: Expect NO table (stay on Add page)
                await driver.sleep(1000);
                const tables = await driver.findElements(By.className('vehicle-table'));
                
                if (tables.length > 0) {
                    throw new Error(`Bug Found: System accepted invalid data (${tc.desc}). Vehicle was created.`);
                } else {
                    // Stayed on Add Page (Correct)
                    try {
                        const errorMsgEl = await driver.wait(until.elementLocated(By.className('error-message')), 2000);
                        expect(await errorMsgEl.getText()).to.not.be.empty;
                        
                        // Reset for next loop
                        const backBtn = await driver.findElement(By.className('goto-vehicle-select-button'));
                        await backBtn.click();
                        await driver.wait(until.elementLocated(By.className('vehicle-table')), 5000);
                    } catch (e) {
                        throw new Error(`Expected error message not found.`);
                    }
                }
            }
        });
    });
});