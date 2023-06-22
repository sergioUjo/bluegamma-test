import puppeteer from "puppeteer";
import * as cheerio from "cheerio";

const SWAP_RATE_SITE = "https://sebgroup.com/our-offering/prospectuses-and-downloads/rates/swap-rates"

interface Swap {
    currency: string;
    maturity: number;
    price: number;
    datetime: string;
    change: number;
}


async function clientSideDownload(): Promise<string> {
    try {

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        // Navigate to the webpage
        await page.goto(SWAP_RATE_SITE);

        // Wait for client-side code to run (e.g., wait for an element to appear)
        await page.waitForSelector('table');

        // Extract the content or perform any other actions after the code has run
        const content = await page.content();

        // Close the browser
        await browser.close();
        return content;
    } catch (error) {
        console.log("Website connectivity error", error)
        //Throw specific error
        throw new Error("Website connectivity error")
    }
}

function isDate(date: string) {
    // @ts-ignore
    return (new Date(date) !== "Invalid Date") && !isNaN(new Date(date));
}

function validateSwapThrow(swap: Swap) {
    if (swap.currency === "" || isNaN(swap.maturity) || isNaN(swap.price) || isNaN(swap.change) || !isDate(swap.datetime)) {
        //Throw specific error
        throw new Error("Error parsing swap rate")
    }
}

function parseRow(row: cheerio.Element, currency: string): Swap {
    const $ = cheerio.load(row);
    const cells = $('td');
    const maturity = parseInt(cells.eq(0).text().trim());
    const price = parseFloat(cells.eq(1).text().trim());
    const change = parseFloat(cells.eq(2).text().trim());
    const time = cells.eq(3).text().trim();
    const date = cells.eq(4).text().trim();
    const datetime = `${date}T${time}:00.000Z`;
    const swap = {
        currency,
        maturity,
        price,
        change,
        datetime
    }
    validateSwapThrow(swap);
    return swap;
}

function extractCurrency(currency: string): string {
    const regex = /\[(.*?)\]/;
    const matches = currency.match(regex);
    return matches ? matches[1] : "";
}

function parseTable(table: cheerio.Element): Swap[] {
    const $ = cheerio.load(table)
    const currency = extractCurrency($('caption').text());
    const rows = $('tr');
    return rows.toArray().slice(1).map((row) => parseRow(row, currency))
}

async function parseSwapRates(): Promise<Swap[]> {
    const page = await clientSideDownload()
    const $ = cheerio.load(page);
    const tables = $('table');
    return tables.toArray().map(parseTable).flat();
}

async function swapRate(currency: string, maturity: number): Promise<number | undefined> {
    const swapRates = await parseSwapRates();
    return swapRates.find((swap) => swap.currency === currency && swap.maturity === maturity)?.price;
}
if (process.argv.length < 4) {
    console.log("Usage: npm run ts -- <currency> <maturity>")
    process.exit(1)
}else{
    const currency = process.argv[2].toUpperCase()
    const maturity = parseInt(process.argv[3])
    console.log(`Getting swap rate for ${currency} with maturity ${maturity}`)
    swapRate(currency, maturity).then(console.log)
}
