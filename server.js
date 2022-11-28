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
    const allStatus = Number(process.env.KF_ALL_STATUS ?? 540);
    const maxParrry = Number(process.env.KF_MAX_PARRY ?? 788);
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
    console.log("Status:", allStatus);

    while (true) {
        try {
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
                console.log("Waiting:", time, "|", new Date().toString());
                await page.waitForTimeout(milSeconds + 1000);
            }

            let qtdS = 0;
            while (true) {
                if (qtdS > 200) throw 'Max searches done!';
                /// Waiting for search click
                await page.waitForSelector("form[name='enemysearch'] > div > input[type=image]");
                await page.click("form[name='enemysearch'] > div > input[type=image]");
                console.log(++qtdS, "Buscando...");
                await page.waitForSelector("form[name='enemysearch'] > div > input[type=image]");
                await page.waitForTimeout(500);
    
                /// Attack zombie
                // 0 - Strength
                // 1 - Stamina
                // 2 - Dexterity
                // 3 - Fighting ability
                // 4 - Parry
                const isZombieAttacked = await page.evaluate((allStatus, maxParrry) => {
                    const zombies = document.querySelectorAll("#enemy-list .fsbox");
                    for (const zombie of zombies) {
                        const habArr = [];
                        const skillArr = [];
                        const profileArr = [];
                        const status = zombie.querySelectorAll(".fsbint4 tr .fsval .sk4");
                        const skills = zombie.querySelectorAll(".fsbint .fs_stats .fsbint3 .fsval div");
                        const profiles = zombie.querySelectorAll(".fsbint .fs_stats .fsbint2 .fsval div");
    
                        for (const hab of status) {
                            const habValue = Number(hab.innerHTML);
                            habArr.push(habValue);
                        }
    
                        for (const skill of skills) {
                            const skillValue = Number(skill.innerHTML);
                            skillArr.push(skillValue);
                        }
                        
                        for (const profile of profiles) {
                            const profileValue = Number(profile.innerHTML);
                            profileArr.push(profileValue);
                        }
                            
                        if ((habArr[3] >= allStatus || habArr[4] >= allStatus) && habArr[4] < maxParrry) {
                            const btnToAttack = zombie.querySelector(".fsbint4 tr .fs_attack form .fsattackbut");
                            btnToAttack.click();
                            return true;
                        }
                    }
                    return false;
                }, allStatus, maxParrry);
    
                if (isZombieAttacked) {
                    await page.waitForSelector("#page > div > div:nth-child(4) > div > div > div.batrep-grid2 > div.kf-bi-thin.pos-rel.f-cinz.atk");
                    const win = await page.evaluate(() => {
                        const attacker = document.querySelector("#page > div > div:nth-child(4) > div > div > div.batrep-grid2 > div.kf-bi-thin.pos-rel.f-cinz.atk");
                        const isWinner = attacker.textContent.includes("Winner");
                        return isWinner;
                    });
    
                    console.log(`${win ? "⚡Win" : "☠️Def"}... ${new Date().toString()}`);
                    break;
                }
            }
            await page.waitForTimeout(1000 * 60 * 5);
        } catch (error) {
            console.log("Error:", error.message);
        }
    }
})();
