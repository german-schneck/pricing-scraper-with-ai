// Database
import {AppDataSource} from "../../data-source";
import {Product} from "../../entity/Product";

interface CreateProductProps {
	url: string;
	name: string;
	code: string;
	price: string;
	image: string;
	currency: string;
	description: string;
	marketplaceId: number;
}

export default class ProductService {
	async getById(id: number): Promise<Product | null> {
		return await AppDataSource.manager.findOne(Product, {
			where: {
				id
			}
		})
	}

	async getByURL(url: string): Promise<Product | null> {
		return await AppDataSource.manager.findOne(Product, {
			where: {
				url
			}
		});
	}

	async edit(id: number, data: Product): Promise<boolean> {
		try {
			const repository = AppDataSource.getRepository(Product);

			const productToUpdate = await repository.findOne({
				where: {
					id
				}
			});

			if (!productToUpdate) {
				return false;
			}

			Object.assign(productToUpdate, data);
			await repository.save(productToUpdate);

			return true;
		} catch (error) {
			console.error('Error al editar el producto:', error);
			return false;
		}
	}

	async create({
		url,
		name,
		code,
		price,
		image,
		currency,
		description,
		marketplaceId,
}: CreateProductProps): Promise<Product> {
		const product = new Product();

		product.url = url;
		product.name = name;
		product.code = code;
		product.price = price;
		product.image = image;
		product.currency = currency;
		product.description = description;
		product.marketplace.id = marketplaceId;

		await AppDataSource.manager.save(product);
		return product;
	}

	async delete(id: number): Promise<boolean> {
		const repository = AppDataSource.getRepository(Product);
		const productToDelete = await repository.findOne({
			where: {
				id,
			}
		});

		if (!productToDelete) {
			return false;
		}

		await repository.remove(productToDelete);
		return true;
	}
}