import type { ICredentialType, INodeProperties } from 'n8n-workflow';

export class OceanBaseApi implements ICredentialType {
	name = 'oceanBaseApi';

	displayName = 'OceanBase API';

	documentationUrl = 'https://github.com/xxsc0529/n8n-nodes-oceanbase.git';

	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'localhost',
		},
		{
			displayName: 'Database',
			name: 'database',
			type: 'string',
			default: 'test',
		},
		{
			displayName: 'User',
			name: 'user',
			type: 'string',
			default: 'root@test',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: 2881,
		},
		{
			displayName: 'Connect Timeout',
			name: 'connectTimeout',
			type: 'number',
			default: 10000,
			description:
				'The milliseconds before a timeout occurs during the initial connection to the MySQL server',
		},
		];
}
