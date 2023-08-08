// Utils
import {
	extractLinksFromHtml,
	extractMetadataFromHtml,
	getHtmlContent,
	isValidMetadata,
	saveProduct,
} from "./utils";

// Database
import {START_URL} from "../../config";
import MarketplaceService from "../marketplace";

const visitedUrls = new Set<string>();
const pendingUrls = new Set<string>();


/**
 * Asynchronous function to process web pages for scraping starting from the given URL.
 *
 * @function
 * @name processPage
 * @param {string} url - The URL of the web page to start the scraping process.
 * @returns {Promise<void>} A Promise that resolves after all pages are processed and scraped.
 */
async function processPage(url: string): Promise<void> {
	if (url) {
		await scrapePage(url);
	}

	while (pendingUrls.size > 0) {
		const nextUrl = getNextPendingUrl();
		if (nextUrl) {
			await scrapePage(nextUrl);
			visitedUrls.add(nextUrl);
			pendingUrls.delete(nextUrl);
		}
	}
}

/**
 * Asynchronous function to scrape a web page at the provided URL.
 *
 * @function
 * @name scrapePage
 * @param {string} url - The URL of the web page to be scraped.
 * @returns {Promise<void>} A Promise that resolves after the scraping process is completed.
 * @throws {Error} If there is an error during the scraping process.
 */
async function scrapePage(url: string): Promise<void> {
	try {

		const mkService = new MarketplaceService();
		const marketplace = await mkService.getByURL(START_URL);

		if (!marketplace) {
			return;
		}

		const isProductExists = await mkService.getProductByURL(marketplace.id, url);

		if (visitedUrls.has(url) || isProductExists) {
			console.log(`⭕ -> Producto ignorado: ${isProductExists?.name}`)
			return;
		}

		console.log('\n===================================')
		console.log(`🚬 -> Paginas evaluadas: ${visitedUrls.size} | 🗒️ -> Paginas pendientes: ${pendingUrls.size}`)
		const htmlContent = await getHtmlContent(url);
		await extractLinksFromHtml(htmlContent, pendingUrls, visitedUrls);

		const metadata = await extractMetadataFromHtml(htmlContent);

		if (metadata && isValidMetadata(metadata)) {
			console.log(`📦 -> Producto detectado: ${metadata.name}`);
			await saveProduct(metadata);
			console.log('💾 -> Producto guardado correctamente.');
		}

		console.log('🛫 -> Scrape terminado, continuando...')
		console.log('===================================')
	} catch (error: any) {
		console.error('Error:', error.message);
	}
}

/**
 * Retrieves the next pending URL from the pendingUrls set.
 *
 * @function
 * @name getNextPendingUrl
 * @returns {string|undefined} The next pending URL or 'undefined' if there are no pending URLs.
 */
function getNextPendingUrl(): string | undefined {
	return [...pendingUrls][0];
}

/**
 * Asynchronous function to start the web scraping process.
 *
 * @function
 * @name scraper
 * @returns {Promise<void>} A Promise that resolves after the entire web scraping process is completed.
 * @throws {Error} If there is an error during the web scraping process.
 */
export default async function scraper(): Promise<void> {
	try {
		await processPage(START_URL);
	} catch (error: any) {
		console.error('Error:', error.message);
	}
}