// Dependencies
import dotenv from 'dotenv';

// DotEnv
dotenv.config();

// Database
import {AppDataSource} from "../src/data-source";

// Services
import scraper from '../src/services/scraper';
import MarketplaceService from "../src/services/marketplace";

// Config
import {MARKETPLACE_COUNTRY, MARKETPLACE_NAME, START_URL} from "../src/config";


(async () => {
	console.log('===================================')
	console.log(`WEB SCRAPER FOR SUPERMARKETS ANALYTICS`)
	console.log('===================================')
	console.log(`Configuration:`)
	console.log(`Store: ${process.env.MARKETPLACE_NAME}`)
	console.log(`Country: ${process.env.MARKETPLACE_COUNTRY}`)
	console.log(`URL: ${process.env.START_URL}`)
	console.log('-----------------------------------')
	console.log(`DATABASE: ${process.env.DATABASE_USERNAME}@${process.env.DATABASE_NAME}:${process.env.DATABASE_PORT} (Using Password: ${process.env.DATABASE_PASSWORD ? 'Yes' : 'No'})`);

	await AppDataSource.initialize();

	const mkService = new MarketplaceService();
	let marketplace = await mkService.getByURL(START_URL);

	if (!marketplace) {
		marketplace = await mkService.create(MARKETPLACE_NAME, MARKETPLACE_COUNTRY, START_URL);
	}

	if (marketplace) {
		await scraper();
	}
})();