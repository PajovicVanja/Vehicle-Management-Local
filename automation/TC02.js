// automation/TC02.js

const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const path = require('path');
const { expect } = require('chai');
const fs = require('fs');

// CONFIGURATION
const APP_URL = 'http://localhost:3000'; 
const DRIVER_EMAIL = 'drivertest@a.com';
const DRIVER_PASS = '123123';

// ASSETS PATH
const ASSETS_DIR = path.resolve(__dirname, '../tests/assets');

describe('TC-02: Company Vehicle Management - Driver License Upload', function () {
    this.timeout(60000); 
    let driver;

    before(async function () {
        let options = new chrome.Options();
        options.addArguments('--remote-allow-origins=*'); 
        options.addArguments('--disable-search-engine-choice-screen'); 
        options.addArguments('--start-maximized');

        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(options)
            .build();
    });

    after(async function () {
        if (driver) await driver.quit();
    });

    it('Step 1: Login as Driver', async function () {
        await driver.get(APP_URL);
        
        const emailInput = await driver.wait(until.elementLocated(By.css('input[type="email"]')), 10000);
        const passInput = await driver.findElement(By.css('input[type="password"]'));
        
        await emailInput.sendKeys(DRIVER_EMAIL);
        await passInput.sendKeys(DRIVER_PASS);
        
        const loginBtn = await driver.findElement(By.className('login-button'));
        await loginBtn.click();

        await driver.wait(until.elementLocated(By.xpath("//button[text()='View Profile']")), 10000);
    });

    it('Step 2: Navigate to Profile', async function () {
        const profileBtn = await driver.findElement(By.xpath("//button[text()='View Profile']"));
        await profileBtn.click();
        await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Update Driver’s License')]")), 10000);
    });

    // --- TEST CASE LOOP ---
    const testCases = [
        { 
            file: '1mb.docx', 
            expected: 'error', 
            desc: 'docx 300 KB – error, disallowed file type' 
        },
        { 
            file: '5mb.png', 
            expected: 'success', 
            desc: 'png 5 MB – success' 
        },
        { 
            file: '6mb.png', 
            expected: 'error', 
            desc: 'png > 5 MB – error (Expected to FAIL in this report due to app bug)' 
        },
        { 
            file: 'jpg1kb.jpeg', 
            expected: 'success', 
            desc: 'jpg 1 KB – success' 
        },
        { 
            file: 'png300kb.png', 
            expected: 'success', 
            desc: 'png 300 KB – success' 
        }
    ];

    testCases.forEach((tc) => {
        it(`Step 3: Upload ${tc.file} -> Expect: ${tc.expected}`, async function () {
            const filePath = path.join(ASSETS_DIR, tc.file);
            
            if (!fs.existsSync(filePath)) throw new Error(`Asset missing: ${filePath}`);

            // 1. Locate and Upload
            const fileInput = await driver.findElement(By.css('input[type="file"]'));
            await fileInput.sendKeys(filePath);

            const uploadBtn = await driver.findElement(By.className('upload-button'));
            await uploadBtn.click();

            // 2. Wait for message
            const messageEl = await driver.wait(until.elementLocated(By.className('profile-message')), 15000);
            await driver.sleep(1000); // Allow text to update
            const messageText = await messageEl.getText();

            // 3. Assertions
            if (tc.expected === 'success') {
                expect(messageText).to.include('License uploaded successfully');
            } else {
                expect(messageText).to.not.include('License uploaded successfully', `Bug Found: App allowed ${tc.file}`);
            }

            // 4. CLEANUP: Reset UI State (Do NOT Refresh)
            // Click "Back to Dashboard"
            const backBtn = await driver.findElement(By.xpath("//button[text()='Back to Dashboard']"));
            await backBtn.click();

            // Wait for Dashboard
            const viewProfileBtn = await driver.wait(until.elementLocated(By.xpath("//button[text()='View Profile']")), 5000);
            
            // Go back to Profile for next test
            await viewProfileBtn.click();
            await driver.wait(until.elementLocated(By.xpath("//h3[contains(text(), 'Update Driver’s License')]")), 5000);
        });
    });
});