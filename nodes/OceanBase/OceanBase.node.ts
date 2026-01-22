import type {
	ICredentialDataDecryptedObject,
	ICredentialTestFunctions,
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

// eslint-disable-next-line @n8n/community-nodes/no-restricted-imports
import mysql from 'mysql2/promise';

// Interface for mysql2 Connection with execute method
interface ConnectionWithExecute {
	execute(
		query: string,
		params?: unknown[],
	): Promise<[unknown[], unknown[]]>;
	end(): Promise<void>;
}

export class OceanBase implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'OceanBase',
		name: 'oceanBase',
		icon: 'file:oceanbase.svg',
		group: ['input'],
		version: 1,
		description: 'Execute SQL queries in OceanBase database',
		defaults: {
			name: 'OceanBase',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [
			{
				name: 'oceanBaseApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Execute Query',
						value: 'executeQuery',
						description: 'Execute a SQL query statement',
						action: 'Execute query',
					},
					{
						name: 'Insert',
						value: 'insert',
						description: 'Insert data',
						action: 'Insert data',
					},
					{
						name: 'Update',
						value: 'update',
						description: 'Update data',
						action: 'Update data',
					},
					{
						name: 'Delete',
						value: 'delete',
						description: 'Delete data',
						action: 'Delete data',
					},
				],
				default: 'executeQuery',
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				displayOptions: {
					show: {
						operation: ['executeQuery'],
					},
				},
				default: '',
				placeholder: 'SELECT * FROM users WHERE id = ?',
				required: true,
				description: 'SQL query statement to execute',
			},
			{
				displayName: 'Table',
				name: 'table',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['insert', 'update', 'delete'],
					},
				},
				default: '',
				required: true,
				description: 'Name of the table to operate on',
			},
			{
				displayName: 'Columns',
				name: 'columns',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['insert'],
					},
				},
				default: '',
				placeholder: 'id,name,email',
				description: 'Column names to insert, separated by commas',
			},
			{
				displayName: 'Values',
				name: 'values',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				displayOptions: {
					show: {
						operation: ['insert'],
					},
				},
				default: '',
				placeholder: '1,"John","john@example.com"',
				description: 'Values to insert, separated by commas. Supports expressions.',
			},
			{
				displayName: 'Update Key',
				name: 'updateKey',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: '',
				placeholder: 'ID',
				description: 'Key name to find the record',
			},
			{
				displayName: 'Update Value',
				name: 'updateValue',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: '',
				description: 'Key value to find the record',
			},
			{
				displayName: 'Fields to Update',
				name: 'fieldsToUpdate',
				type: 'string',
				typeOptions: {
					rows: 3,
				},
				displayOptions: {
					show: {
						operation: ['update'],
					},
				},
				default: '',
				placeholder: 'name="John",email="john@example.com"',
				description: 'Fields to update, format: field1=value1,field2=value2',
			},
			{
				displayName: 'Delete Key',
				name: 'deleteKey',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['delete'],
					},
				},
				default: '',
				placeholder: 'ID',
				description: 'Key name to find the record to delete',
			},
			{
				displayName: 'Delete Value',
				name: 'deleteValue',
				type: 'string',
				displayOptions: {
					show: {
						operation: ['delete'],
					},
				},
				default: '',
				description: 'Key value to find the record to delete',
			},
			{
				displayName: 'Options',
				name: 'options',
				type: 'collection',
				placeholder: 'Add Option',
				default: {},
				options: [
					{
						displayName: 'Query Parameters',
						name: 'queryParameters',
						type: 'string',
						default: '',
						placeholder: 'param1,param2',
						description: 'SQL query parameters, separated by commas. Use ? as placeholder in query.',
					},
					{
						displayName: 'Return Fields',
						name: 'returnFields',
						type: 'string',
						default: '*',
						description: 'Fields to return, separated by commas. Default returns all fields.',
					},
				],
			},
		],
	};

	async credentialTest(
		this: ICredentialTestFunctions,
		credential: ICredentialDataDecryptedObject,
	): Promise<INodeExecutionData[]> {
		const credentials = credential as ICredentialDataDecryptedObject;

		try {
			const connection = (await mysql.createConnection({
				host: credentials.host as string,
				port: credentials.port as number,
				database: credentials.database as string,
				user: credentials.user as string,
				password: credentials.password as string,
				connectTimeout: credentials.connectionTimeout as number || 10000,
			})) as unknown as ConnectionWithExecute;

			// Test connection by executing a simple query
			await connection.execute('SELECT 1');
			await connection.end();

			return [
				{
					json: {
						success: true,
						message: 'Connection successful',
					},
				},
			];
		} catch (error) {
			return [
				{
					json: {
						success: false,
						message: error instanceof Error ? error.message : String(error),
					},
				},
			];
		}
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const operation = this.getNodeParameter('operation', 0) as string;
		const credentials = (await this.getCredentials('oceanBaseApi')) as ICredentialDataDecryptedObject;

		// Create database connection
		const connection = (await mysql.createConnection({
			host: credentials.host as string,
			port: credentials.port as number,
			database: credentials.database as string,
			user: credentials.user as string,
			password: credentials.password as string,
			connectTimeout: credentials.connectionTimeout as number || 10000,
		})) as unknown as ConnectionWithExecute;

		const returnItems: INodeExecutionData[] = [];

		try {
			for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
				try {
					let result: unknown;
					const options = this.getNodeParameter('options', itemIndex, {}) as {
						queryParameters?: string;
						returnFields?: string;
					};

					switch (operation) {
						case 'executeQuery': {
							const query = this.getNodeParameter('query', itemIndex, '') as string;
							const queryParameters = options.queryParameters
								? options.queryParameters.split(',').map((p) => p.trim())
								: [];

							// Replace expression values
							const processedParams = queryParameters.map((param) => {
								try {
									return this.getNodeParameter(param, itemIndex) || param;
								} catch {
									return param;
								}
							});

							[result] = await connection.execute(query, processedParams);
							break;
						}

						case 'insert': {
							const table = this.getNodeParameter('table', itemIndex, '') as string;
							const columns = this.getNodeParameter('columns', itemIndex, '') as string;
							const values = this.getNodeParameter('values', itemIndex, '') as string;

							const columnList = columns.split(',').map((c) => c.trim()).join(',');
							const valueList = values.split(',').map((v) => v.trim());

							// Process expressions
							const processedValues = valueList.map((val) => {
								try {
									const resolved = this.getNodeParameter(val, itemIndex);
									return resolved !== undefined ? resolved : val;
								} catch {
									return val;
								}
							});

							const placeholders = processedValues.map(() => '?').join(',');
							const query = `INSERT INTO ${table} (${columnList}) VALUES (${placeholders})`;

							[result] = await connection.execute(query, processedValues);
							break;
						}

						case 'update': {
							const table = this.getNodeParameter('table', itemIndex, '') as string;
							const updateKey = this.getNodeParameter('updateKey', itemIndex, '') as string;
							const updateValue = this.getNodeParameter('updateValue', itemIndex, '') as string;
							const fieldsToUpdate = this.getNodeParameter('fieldsToUpdate', itemIndex, '') as string;

							const updateFields = fieldsToUpdate.split(',').map((f) => {
								const [key] = f.split('=').map((s) => s.trim());
								return `${key} = ?`;
							});

							const updateValues = fieldsToUpdate.split(',').map((f) => {
								const [, value] = f.split('=').map((s) => s.trim());
								try {
									const resolved = this.getNodeParameter(value, itemIndex);
									return resolved !== undefined ? resolved : value.replace(/['"]/g, '');
								} catch {
									return value.replace(/['"]/g, '');
								}
							});

							const query = `UPDATE ${table} SET ${updateFields.join(', ')} WHERE ${updateKey} = ?`;
							const queryParams = [...updateValues, updateValue];

							[result] = await connection.execute(query, queryParams);
							break;
						}

						case 'delete': {
							const table = this.getNodeParameter('table', itemIndex, '') as string;
							const deleteKey = this.getNodeParameter('deleteKey', itemIndex, '') as string;
							const deleteValue = this.getNodeParameter('deleteValue', itemIndex, '') as string;

							const query = `DELETE FROM ${table} WHERE ${deleteKey} = ?`;
							[result] = await connection.execute(query, [deleteValue]);
							break;
						}

						default:
							throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
					}

					// Process results
					if (Array.isArray(result)) {
						// SELECT query returns array
						for (const row of result) {
							returnItems.push({
								json: row as IDataObject,
								pairedItem: { item: itemIndex },
							});
						}
					} else {
						// INSERT/UPDATE/DELETE returns result object
						const resultObj = result as {
							affectedRows?: number;
							insertId?: number | null;
							[key: string]: unknown;
						};
						returnItems.push({
							json: {
								affectedRows: resultObj.affectedRows || 0,
								insertId: resultObj.insertId || null,
								...resultObj,
							},
							pairedItem: { item: itemIndex },
						});
					}
				} catch (error) {
					if (this.continueOnFail()) {
						returnItems.push({
							json: this.getInputData(itemIndex)[0].json,
							error,
							pairedItem: { item: itemIndex },
						});
					} else {
						if (error instanceof Error && error.message) {
							throw new NodeOperationError(this.getNode(), error, {
								itemIndex,
							});
						}
						throw error;
					}
				}
			}
		} finally {
			await connection.end();
		}

		return [returnItems];
	}
}
