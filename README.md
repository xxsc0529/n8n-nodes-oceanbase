# n8n-nodes-oceanbase

This is an n8n community node that allows you to use OceanBase database in your n8n workflows.

OceanBase is a distributed relational database management system that is compatible with MySQL protocol, supporting high availability, high performance, and elastic scaling.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/sustainable-use-license/) workflow automation platform.

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

This node supports the following operations:

- **Execute Query** - Execute custom SQL query statements
- **Insert** - Insert data into a table
- **Update** - Update data in a table
- **Delete** - Delete data from a table
- **Vector Insert** - Insert vector data with metadata (requires OceanBase with vector support)
- **Vector Search** - Search similar vectors using distance functions
- **Hybrid Search** - Hybrid search combining full-text search and vector similarity search (requires OceanBase 4.4.1.0+ or SeekDB)
- **Hybrid Search** - Hybrid search combining full-text search and vector similarity search (requires OceanBase 4.4.1.0+ or SeekDB)

## Credentials

To use this node, you need to configure OceanBase database connection credentials:

1. Select "Credentials" option in the node configuration
2. Click "Create New" to create new credentials
3. Fill in the following information:
   - **Host**: OceanBase database host address (e.g., localhost)
   - **Port**: Database port number (default: 2883)
   - **Database**: Name of the database to connect to
   - **User**: Database username
   - **Password**: Database password
   - **SSL**: Enable SSL connection (optional)
   - **Connection Timeout**: Connection timeout in milliseconds (default: 10000)

## Compatibility

- **n8n version**: Requires n8n 1.0 or higher
- **OceanBase version**: Supports OceanBase 3.x and 4.x versions
  - **Vector operations**: Require OceanBase 4.4+ or SeekDB with vector support
- **Node.js**: Requires Node.js 14 or higher

## Usage

### Execute Query

Use this operation to execute any SQL query statement:

```sql
SELECT * FROM users WHERE id = ?
```

In the "Query Parameters" option, you can provide query parameters separated by commas. Use `?` as a placeholder in the query.

### Insert

Insert data into a specified table:

- **Table**: Table name
- **Columns**: Column names to insert, separated by commas (e.g., `id,name,email`)
- **Values**: Values to insert, separated by commas (e.g., `1,"John","john@example.com"`)

### Update

Update data in a table:

- **Table**: Table name
- **Update Key**: Key name to find the record (e.g., `id`)
- **Update Value**: Key value to find the record
- **Fields to Update**: Fields to update, format: `field1=value1,field2=value2`

### Delete

Delete data from a table:

- **Table**: Table name
- **Delete Key**: Key name to find the record to delete (e.g., `id`)
- **Delete Value**: Key value to find the record to delete

### Vector Insert

Insert vector data with metadata into a table with vector column:

- **Table**: Table name (must have a VECTOR column)
- **Vector Column**: Name of the vector column (default: `embedding`)
- **Vector Data**: Vector data as JSON array, e.g., `[0.1, 0.2, 0.3]`
- **Metadata Columns**: Additional metadata columns, separated by commas (e.g., `id,text,metadata`)
- **Metadata Values**: Metadata values corresponding to metadata columns, separated by commas

Example:
- Vector Data: `[0.1, 0.2, 0.3, 0.4]`
- Metadata Columns: `id,text`
- Metadata Values: `1,"Document content"`

### Vector Search

Search for similar vectors using distance functions:

- **Table**: Table name with vector column
- **Vector Column**: Name of the vector column (default: `embedding`)
- **Query Vector**: Query vector as JSON array for similarity search
- **Distance Function**: Choose from L2 Distance, Cosine Distance, or Inner Product
- **Top K**: Number of similar vectors to return (default: 10)
- **Filter Condition**: Optional WHERE condition for filtering results (e.g., `category = "document"`)
- **Return Fields**: Fields to return, separated by commas (default: `*`)

Example query vector: `[0.1, 0.2, 0.3, 0.4]`

The search returns results ordered by distance, with the distance value included in the results.

### Hybrid Search

Perform hybrid search that combines full-text search and vector similarity search using Elasticsearch-compatible query syntax:

- **Table**: Table name with both vector and full-text indexes
- **Query Body**: Hybrid search query body in JSON format (Elasticsearch-compatible)

The query body supports:

- **`query`**: Full-text search query with:
  - `bool`: Combine queries with `must`, `must_not`, `should`, `filter`
  - `query_string`: Full-text search with field weights and boost
  - `terms`: Exact match filtering
  - `range`: Range queries (`lt`, `lte`, `gt`, `gte`)
- **`knn`**: Vector similarity search with:
  - `field`: Vector field name
  - `query_vector`: Query vector array
  - `k`: Number of results to return
  - `num_candidates`: Number of candidates to consider
  - `filter`: Optional filter to apply to KNN search
  - `similarity`: Similarity threshold
- **`from`** and **`size`**: Pagination parameters

Example query body:

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "query_string": {
            "fields": ["title^10", "content"],
            "query": "oceanbase 数据 迁移",
            "minimum_should_match": "30%"
          }
        }
      ],
      "filter": [
        {
          "terms": {
            "source_id": ["id1", "id2"]
          }
        }
      ]
    }
  },
  "knn": {
    "field": "vector",
    "k": 10,
    "num_candidates": 100,
    "query_vector": [0.1, 0.2, 0.3],
    "similarity": 0.2
  },
  "from": 0,
  "size": 20
}
```

**Note**: Hybrid search requires OceanBase version >= 4.4.1.0 or SeekDB.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [OceanBase official documentation](https://github.com/oceanbase/oceanbase)
* [OceanBase website](https://www.oceanbase.com/)

## Version history

### 0.1.0

- Initial version
- Support for basic SQL query, insert, update, and delete operations
- Support for OceanBase database connection
