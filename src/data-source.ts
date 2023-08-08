// Dependencies
import "reflect-metadata"
import { DataSource } from "typeorm"

// Models
import {Product} from "./entity/Product";
import {Marketplace} from "./entity/Marketplace";

export const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    synchronize: true,
    logging: false,
    entities: [
      Marketplace,
      Product,
    ],
    migrations: [],
    subscribers: [],
})
