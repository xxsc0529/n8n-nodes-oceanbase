import mysql2 from 'mysql2/promise';
import type {
	ICredentialDataDecryptedObject,
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from 'n8n-workflow';

export async function createConnection(
	credentials: ICredentialDataDecryptedObject,
): Promise<mysql2.Connection> {
	const {caCertificate, clientCertificate, clientPrivateKey, ...baseCredentials } =
		credentials;
	return await mysql2.createConnection(baseCredentials);
}

/**
 * @TECH_DEBT Explore replacing with handlebars
 */
export function getResolvables(expression: string): string[] {
	if (!expression) return [];

	const resolvables: string[] = [];
	const resolvableRegex = /({{[\s\S]*?}})/g;
	let match: RegExpExecArray | null;

	do {
		match = resolvableRegex.exec(expression);
		if (match !== null && match[1]) {
			resolvables.push(match[1]);
		}
	} while (match !== null);

	return resolvables;
}


export async function searchTables(
	this: ILoadOptionsFunctions,
	tableName?: string,
): Promise<INodeListSearchResult> {
	const credentials = await this.getCredentials('mySql');
	const connection = await createConnection(credentials);
	const sql = `SELECT table_name
FROM   information_schema.tables
WHERE  table_schema = ?
AND table_name LIKE ?
ORDER  BY table_name`;

	const values = [credentials.database, `%${tableName ?? ''}%`];
	const [rows] = await connection.query(sql, values);
	const results = (rows as IDataObject[]).map((table) => ({
		name: (table.table_name as string) || (table.TABLE_NAME as string),
		value: (table.table_name as string) || (table.TABLE_NAME as string),
	}));
	await connection.end();
	return { results };
}
