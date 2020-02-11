import * as imap     from './imap.js';
import * as sqlite3  from './sqlite3.js';

(async function () {

if (process.argv.length < 7) {
	console.error(`Usage: node ${process.argv[1].split('/').pop()} host port user pass output.`);
	process.exit(1);
}
const [ , , host, port, user, pass, output] = process.argv;


const client = await imap.connect(host, port, user, pass);
const db     = await sqlite3.open(output);

await db.createTable('mail', {
	id: 'integer',
	mailbox: 'text',
	mail: 'blob',
});
let count = 0;

for (let m of await client.mailboxes()) {
	for await (let msg of client.iterate(m)) {
		await db.table('mail').insert({
			id: ++count,
			mailbox: m,
			mail: msg,
		});
	}
}

await client.logout();
await db.close();

})();
