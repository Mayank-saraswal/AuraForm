const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://neondb_owner:npg_Tsjt9O1dxlDR@ep-gentle-surf-aqjbi75k-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require' });
client.connect().then(() => client.query("SELECT column_name FROM information_schema.columns WHERE table_name = 'users'"))
  .then(res => console.log(res.rows.map(r => r.column_name)))
  .catch(console.error)
  .finally(() => client.end());
