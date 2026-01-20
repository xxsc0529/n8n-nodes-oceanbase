import type {
	ICredentialType,
	Icon,
	INodeProperties,
} from 'n8n-workflow';

export class OceanBaseApi implements ICredentialType {
	name = 'oceanBaseApi';

	displayName = 'OceanBase API';

	icon: Icon = 'file:../nodes/OceanBase/oceanbase.svg';

	documentationUrl = 'https://github.com/oceanbase/oceanbase';

	testedBy = 'oceanBase';

	properties: INodeProperties[] = [
		{
			displayName: 'Host',
			name: 'host',
			type: 'string',
			default: 'localhost',
			required: true,
			description: 'OceanBase database host address',
		},
		{
			displayName: 'Port',
			name: 'port',
			type: 'number',
			default: 2883,
			required: true,
			description: 'OceanBase database port number',
		},
		{
			displayName: 'Database',
			name: 'database',
			type: 'string',
			default: '',
			required: true,
			description: 'Name of the database to connect to',
		},
		{
			displayName: 'User',
			name: 'user',
			type: 'string',
			default: '',
			required: true,
			description: 'Database username',
		},
		{
			displayName: 'Password',
			name: 'password',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Database password',
		},
		{
			displayName: 'SSL',
			name: 'ssl',
			type: 'boolean',
			default: false,
			description: 'Enable SSL connection',
		},
		{
			displayName: 'Connection Timeout',
			name: 'connectionTimeout',
			type: 'number',
			default: 10000,
			description: 'Connection timeout in milliseconds',
		},
	];
}
