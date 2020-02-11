import sqlite3    from 'sqlite3';
import { promisify } from 'util';

export
async function open (file) {
	let db = new sqlite3.Database(file);
	return {
		createTable: (name, fields) => createTable(db, name, fields),
		table:        name          => table(db, name),
		close:       ()             => db.close(),
	};
}

async function createTable (db, name, fields) {
	await promisify(db.run.bind(db))(`CREATE TABLE ${name}(${Object.keys(fields).map(k => `${k} ${fields[k]}`).join(', ')})`);
}

function table (db, name) {
	return {
		insert: data => insert(db, name, data),
	};
}

async function insert (db, name, data) {
	var keys = Object.keys(data);
	await promisify(db.run.bind(db))(
		`INSERT INTO ${name}(${keys.join(', ')}) VALUES (${keys.map(() => '?').join(', ')})`,
		keys.map(k => data[k])
	);
	// return db.lastID;
}
