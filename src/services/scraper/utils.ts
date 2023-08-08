// Dependencies
import puppeteer from "puppeteer";
import cheerio from 'cheerio';
import {decode} from 'html-entities';

// Database
import {AppDataSource} from "../../data-source";
import {Product} from "../../entity/Product";

// Services
import MarketplaceService from "../marketplace";

// Config
import {START_URL} from "../../config";
import {promptToBody} from "../prompter";
import {CheerioWebBaseLoader} from "langchain/document_loaders/web/cheerio";
import {RecursiveCharacterTextSplitter} from "langchain/text_splitter";
import {HtmlToTextTransformer} from "langchain/document_transformers/html_to_text";

/**
 * Retrieves the HTML content of a web page.
 *
 * @function
 * @name getHtmlContent
 * @param {string} url - The URL of the web page.
 * @returns {Promise<string>} A Promise that resolves to the HTML content of the web page.
 * @throws {Error} If there is an error while obtaining the HTML content.
 */
export async function getHtmlContent(url: string): Promise<string> {
	try {
		const browser = await puppeteer.launch({ headless: 'new' });
		const page = await browser.newPage();

		console.log(`🛬 -> Arrivando a: ${url}`);

		await page.goto(url, { waitUntil: 'networkidle0' });

		await page.waitForTimeout(2000);

		const htmlContent = await page.content();
		await browser.close();

		return htmlContent;
	} catch (error) {
		console.log(error);
		throw new Error('Error al obtener el contenido HTML de la página.');
	}
}

export interface IProduct {
	name?: string;
	price?: string;
	currency?: string;
	image?: string;
	url?: string;
	code?: string;
	description?: string;
}

/**
 * Extracts metadata from the HTML content.
 *
 * @function
 * @name extractMetadataFromHtml
 * @param {string} htmlContent - The HTML content of the web page.
 * @returns {Promise<void>}
 */
interface MetaData {
	[key: string]: string;
}

export async function extractMetadataFromHtml(tags: object[], htmlContent: string): Promise<IProduct | null> {
	const $ = cheerio.load(htmlContent);

	const metaData: MetaData[] = [];

	const excludedMetaNames = ['viewport', 'googlebot', 'theme-color', 'generator', 'keywords', 'robots', 'canonical'];

	$('meta').each((index, element) => {
		const metaName = $(element).attr('name');
		const metaProperty = $(element).attr('property');
		const metaContent = $(element).attr('content');

		if ((metaName && !excludedMetaNames.includes(metaName)) || (metaProperty && !excludedMetaNames.includes(metaProperty))) {
			const meta: MetaData = {};

			if (metaName) {
				meta['name'] = metaName;
			}

			if (metaProperty) {
				meta['property'] = metaProperty;
			}

			if (metaContent) {
				meta['content'] = metaContent;
			}

			metaData.push(meta);
		}
	});

	$('html').find('meta[itemprop]').each((index, element) => {
		const itemprop = $(element).attr('itemprop');
		const content = $(element).attr('content');

		if (itemprop && content) {
			metaData.push({
				[itemprop]: content,
			});
		}
	});

	const response: IProduct | undefined = await promptToBody(JSON.stringify([...tags, ...metaData]).toString())

	if (!response || hasUndefinedValue(response)) {
		return null;
	}

	return {
		name: response.name,
		description: response.description,
		image: response.image,
		currency: response.currency,
		price: response.price,
		code: response.code,
	}
}

/**
 * Extracts links from the HTML content of a web page.
 *
 * @function
 * @name extractLinksFromHtml
 * @param {string} htmlContent - The HTML content of the web page.
 * @param {Set<string>} pendingUrls - A set of pending URLs that need to be visited.
 * @param {Set<string>} visitedUrls - A set of URLs that have already been visited.
 * @returns {Promise<string[]>} A Promise that resolves to an array of extracted links.
 */
export async function extractLinksFromHtml(
	htmlContent: string,
	pendingUrls: Set<string>,
	visitedUrls: Set<string>
): Promise<string[]> {
	const $ = cheerio.load(htmlContent);

	const links: string[] = [];
	$('a').each((index, element) => {
		let link = $(element).attr('href');

		if (link && link !== '/') {
			link = formatUrl(START_URL, link);
			if (isSameDomain(link, START_URL) && (!visitedUrls.has(link) && !pendingUrls.has(link))) {
				pendingUrls.add(link);
				links.push(link);
			}
		}
	});

	console.log(`🏷️ -> Extraidas ${links.length} URLs`);
	return links;
}

/**
 * Checks if the given URL belongs to the same domain as the start URL.
 *
 * @function
 * @name isSameDomain
 * @param {string} url - The URL to check.
 * @param {string} startUrl - The start URL used as a reference for comparison.
 * @returns {boolean} 'true' if the URL belongs to the same domain as the start URL, 'false' otherwise.
 */
export function isSameDomain(url: string, startUrl: string): boolean {
	const urlDomain = new URL(url).hostname;
	const startUrlDomain = new URL(startUrl).hostname;
	return urlDomain === startUrlDomain;
}

	/**
 * Formats a URL by combining it with an optional link.
 *
 * @function
 * @name formatUrl
 * @param {string} url - The base URL.
 * @param {string} [link] - An optional link to be combined with the base URL.
 * @returns {string} The formatted URL.
 */
export const formatUrl = (url: string, link?: string): string => {
	const baseUrl = new URL(url).origin;
	return link ? new URL(link, baseUrl).href : baseUrl;
}

/**
 * Truncates a given text by removing characters from both the start and the end and adding ellipsis '...'.
 *
 * @function
 * @name truncateText
 * @param {string} text - The original text to be truncated.
 * @param {number} start - The number of characters to remove from the start of the text.
 * @param {number} end - The number of characters to remove from the end of the text.
 * @returns {string} The truncated text with ellipsis.
 */
export function truncateText(text: string, start: number, end: number): string {
	return text.slice(0, start) + '...' + text.slice(-end);
}

/**
 * Checks whether an object has any property value that is 'undefined'.
 *
 * @function
 * @name hasUndefinedValue
 * @param {Object.<string, string>} obj - The object to be checked.
 * @returns {boolean} 'true' if all property values are not 'undefined', 'false' otherwise.
 */
export function hasUndefinedValue<T extends {}>(obj: T): boolean {
	return Object.values(obj).every((value) => value === undefined);
}

/**
 * Checks if the provided metadata object contains all the required properties for valid product information.
 *
 * @function
 * @name isValidMetadata
 * @param {IProduct} metadata - The metadata object to be validated.
 * @returns {boolean} 'true' if the metadata object has all the required properties with truthy values, 'false' otherwise.
 */
export function isValidMetadata(metadata: IProduct): boolean {
	const requiredProperties: (keyof IProduct)[] = [
		'name',
		'price',
		'currency'
	];

	return requiredProperties.every((prop) => !!metadata[prop]);
}

export async function saveProduct(metadata: IProduct): Promise<void> {

	const mkService = new MarketplaceService();
	const marketplace = await mkService.getByURL(START_URL);

	if (!marketplace) {
		return;
	}

	const product = new Product();
	Object.assign(product, {
		...metadata,
		marketplace: {
			id: marketplace?.id
		}
	});

	await AppDataSource.manager.save(product);
}