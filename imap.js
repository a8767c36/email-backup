import ImapClient from 'emailjs-imap-client';

export
async function connect (host, port, user, pass) {
	const client = new (ImapClient.default)(host, port, { useSecureTransport: true, auth: { user, pass } });
	await client.connect();

	return {
		mailboxes: ()  => mailboxes(client),
		iterate  :  m  => iterate(client, m),
		logout   : ()  => client.logout(),
	};
}

async function mailboxes (client) {
	const mailboxes = [ ];
	const mailboxList = [await client.listMailboxes()];
	for (let i = 0; i < mailboxList.length; i++) {
		let m = mailboxList[i];
		mailboxList.push(...m.children);
		if (!m.root) mailboxes.push(m.path || '/');
	}
	return mailboxes;
}

async function* iterate (client, m) {
	const mailboxInfo = await client.selectMailbox(m);
	const count = mailboxInfo.exists;

	for (let i = 1; i <= count; i++) {
		const list = await client.listMessages(m, i, ['body[]']);
		yield list[0]['body[]'];
	}
}

