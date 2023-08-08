declare module 'cheerio' {
	interface Cheerio {
		html(): string;
	}

	interface CheerioAPI {
		load(html: string): Cheerio;
		(selector: string, context?: any, root?: any): Cheerio;
	}

	interface CheerioElement {
		name: string;
		nodeName: string;
	}
}