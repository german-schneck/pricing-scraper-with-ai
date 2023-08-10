// Dependencies
import dotenv from 'dotenv';

// DotEnv
dotenv.config();

// Database
import {AppDataSource} from "../src/data-source";

// Services
import scraper from '../src/services/scraper';
import MarketplaceService from "../src/services/product";

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



	if (marketplace) {
		await scraper();
	}
})();