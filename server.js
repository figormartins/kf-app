const puppeteer = require('puppeteer');
require('dotenv').config();

(async () => {
    const browser = await puppeteer.launch({ ignoreDefaultArgs: ['--disable-extensions'], });
    const page = await browser.newPage();
    await page.setViewport({
        width: 1366,
        height: 1650,
        deviceScaleFactor: 1,
    });
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
        /// Bf
        await page.goto("https://int4.knightfight.moonid.net/battleserver/raubzug/")

        while (true) {
            /// search click
            await page.evaluate(() => {
                const inputs = document.querySelectorAll("input[type=image]");
                const len = inputs.length;
                inputs[len - 1].click();
            });
            console.log("Buscando...");
            await page.waitForTimeout(1000);
            //     const timeOutStr = document.querySelector("#counter").innerText;
            //     const times = timeOutStr.split(':');
            //     var seconds = (+times[0]) * 60 * 60 + (+times[1]) * 60 + (+times[2]);
            //     await page.waitForTimeout(seconds);


            /// Attack zombie
            // 0 - Strength
            // 1 - Stamina
            // 2 - Dexterity
            // 3 - Fighting ability
            // 4 - Parry
            const isZombieAttacked = await page.evaluate(() => {
                const zombies = document.querySelectorAll("#enemy-list .fsbox");
                for (const zombie of zombies) {
                    const habArr = [];
                    const status = zombie.querySelectorAll(".fsbint4 tr .fsval .sk4");

                    for (const hab of status) {
                        const habValue = Number(hab.innerHTML);
                        habArr.push(habValue);
                    }
                    const lowDexStr = (habArr[2] <= 190) && (habArr[0] <= 205);
                    if (habArr.every(x => x <= 201) && habArr[1] <= 80) {
                        const btnToAttack = zombie.querySelector(".fsbint4 tr .fs_attack form .fsattackbut");
                        btnToAttack.click();
                        return true;
                    }
                }
                return false;
            });

            if (isZombieAttacked) {
                console.error(`Achou... ${new Date().toString()}`);
                break;
            }
        }
        await page.waitForTimeout((1000 * 60 * 5) + 1000);
    }

    await browser.close();
})();

