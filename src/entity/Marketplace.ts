import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, OneToMany} from "typeorm"
import {Product} from "./Product";

@Entity()
export class Marketplace extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	name!: string;

	@Column()
	country!: string;

	@Column()
	url!: string;

	@OneToMany(() => Product, (product) => product.marketplace)
	products!: Product[];
}



