import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, ManyToOne} from "typeorm"
import {Marketplace} from "./Marketplace";

@Entity()
export class Product extends BaseEntity {
	@PrimaryGeneratedColumn()
	id!: number;

	@Column()
	name!: string;

	@Column()
	image!: string;

	@Column()
	url!: string;

	@Column()
	price!: string;

	@Column()
	currency!: string;

	@ManyToOne(() => Marketplace, (marketplace) => marketplace.products)
	marketplace!: Marketplace;
}



