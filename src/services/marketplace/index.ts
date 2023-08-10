// Database
import {AppDataSource} from "../../data-source";
import {Marketplace} from "../../entity/Marketplace";

/**
 * Represents a service for interacting with the Marketplace entity.
 * This class provides methods to retrieve and create marketplace data.
 *
 * @class
 * @name MarketplaceService
 */
export default class MarketplaceService {
	/**
	 * Retrieves a marketplace by its ID.
	 *
	 * @method
	 * @name getById
	 * @param {number} id - The ID of the marketplace to retrieve.
	 * @returns {Promise<Marketplace | undefined>} A Promise that resolves to the found marketplace entity or undefined if not found.
	 */
	async getById(id: number): Promise<Marketplace | null> {
		return await AppDataSource.manager.findOne(Marketplace, {
			where: {
				id
			}
		})
	}

	/**
	 * Retrieves a marketplace by its URL.
	 *
	 * @method
	 * @name getByURL
	 * @param {string} url - The URL of the marketplace to retrieve.
	 * @returns {Promise<Marketplace | undefined>} A Promise that resolves to the found marketplace entity or undefined if not found.
	 */
	async getByURL(url: string): Promise<Marketplace | null> {
		return await AppDataSource.manager.findOne(Marketplace, {
			where: {
				url
			}
		});
	}

	/**
	 * Creates a new marketplace entity with the given name and URL.
	 *
	 * @method
	 * @name create
	 * @param {string} name - The name of the new marketplace.
	 * @param {string} country - The country of the marketplace.
	 * @param {string} url - The URL of the new marketplace.
	 * @returns {Promise<void>} A Promise that resolves after the new marketplace is created.
	 */
	async create(name: string, country: string, url: string): Promise<Marketplace> {
		const marketplace = new Marketplace();

		marketplace.name = name;
		marketplace.country = country;
		marketplace.url = url;

		await AppDataSource.manager.save(marketplace);
		return marketplace;
	}
}