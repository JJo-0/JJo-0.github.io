import fs from 'node:fs';
import path from 'node:path';
import { loadActsDashboards } from '../src/lib/acts-dashboard-source.mjs';
const destination=path.resolve(process.argv[2] || '.acts-dashboard-preview');
fs.mkdirSync(destination,{recursive:true});
for(const [name,html] of Object.entries(loadActsDashboards())) fs.writeFileSync(path.join(destination,name),html);
console.log(`Extracted three checksum-verified, editable HTML files to ${destination}`);
