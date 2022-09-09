const puppeteer = require('puppeteer');
const { timeToSeconds } = require('./helpers/date');
require('dotenv').config();

(async () => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'], 
    });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1366,
        height: 1650,
        deviceScaleFactor: 1,
    });
    const allStatus = Number(process.env.KF_ALL_STATUS ?? 201);
    console.log("Iniciando...");
    await page.goto('https://moonid.net/account/login/?next=/api/account/connect/193/');

    /// Login
    await page.click("form table tbody #id_username");
    await page.type('input#id_username', process.env.KF_USER);
    await page.click("form table tbody #id_password");
    await page.type('input#id_password', process.env.KF_PWD);
    await page.click("form table tbody [type='submit']");
    console.log("Logou...");
    await page.waitForNavigation();

    while (true) {
        while (true) {
            /// Bf
            await page.goto("https://int4.knightfight.moonid.net/battleserver/raubzug/");
            const time = await page.evaluate(() => {
                const counter = document.querySelector("#counter"); 
                const time = counter?.innerHTML;
                return time;
            });

            if (!time) break;

            const milSeconds = timeToSeconds(time) * 1000;
            console.log("Waiting... ", time);
            await page.waitForTimeout(milSeconds + 1000);
        }

        while (true) {
            /// search click
            await page.waitForSelector("form[name='enemysearch'] > div > input[type=image]");
            await page.click("form[name='enemysearch'] > div > input[type=image]");
            console.log("Buscando...");
            await page.waitForSelector("form[name='enemysearch'] > div > input[type=image]");

            /// Attack zombie
            // 0 - Strength
            // 1 - Stamina
            // 2 - Dexterity
            // 3 - Fighting ability
            // 4 - Parry
            const isZombieAttacked = await page.evaluate((allStatus) => {
                const zombies = document.querySelectorAll("#enemy-list .fsbox");
                for (const zombie of zombies) {
                    const habArr = [];
                    const status = zombie.querySelectorAll(".fsbint4 tr .fsval .sk4");

                    for (const hab of status) {
                        const habValue = Number(hab.innerHTML);
                        habArr.push(habValue);
                    }
                    
                    if (habArr.every(x => x <= allStatus)) {
                        const btnToAttack = zombie.querySelector(".fsbint4 tr .fs_attack form .fsattackbut");
                        btnToAttack.click();
                        return true;
                    }
                }
                return false;
            }, allStatus);

            if (isZombieAttacked) {
                console.log(`Achou... ${new Date().toString()}`);
                break;
            }
        }
        await page.waitForTimeout((1000 * 60 * 5) + 1000);
    }
})();

