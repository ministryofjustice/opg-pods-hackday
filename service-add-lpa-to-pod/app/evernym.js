const EventEmitter = require("events");
const uuid = require("uuid");
const axios = require("axios");

const verityUrl = process.env.VERITY_URL;
const domainDid = process.env.DOMAIN_DID;
const xApiKey = process.env.X_API_KEY;
const webhookUrl = process.env.WEBHOOK_URL;

const events = new EventEmitter();

function enabled() {
    return Boolean(webhookUrl);
}

async function send(
    qualifier,
    msgFamily,
    msgFamilyVersion,
    msgName,
    message,
    threadId
) {
    // Add @type and @id fields to the message
    // Field @type is dinamycially constructed based on the function arguments and added into the message payload
    message["@type"] = `did:sov:${qualifier};spec/${msgFamily}/${msgFamilyVersion}/${msgName}`;
    message["@id"] = uuid.v4();
    if (!threadId) {
        threadId = uuid.v4();
    }
    
    const url = `${verityUrl}/api/${domainDid}/${msgFamily}/${msgFamilyVersion}/${threadId}`;
    console.log(`Posting message to ${url}`);
    console.log(message);

    return axios({
        method: "POST",
        url: url,
        data: message,
        headers: {
            "X-API-key": xApiKey, 
        },
    });
}

async function issuer() {
    const webhookMessage = {
        comMethod: {
            id: 'webhook',
            type: 2,
            value: webhookUrl,
            packaging: {
                pkgType: 'plain'
            }
        }
    };
    
    await new Promise((resolve, reject) => {
        events.once('webhookUpdated', resolve);
        send('123456789abcdefghi1234', 'configs', '0.6', 'UPDATE_COM_METHOD', webhookMessage);
    });

    const [issuerDid, issuerVerkey] = await new Promise((resolve, reject) => {
        events.once('publicIdentifier', (did, verkey) => {
            resolve([did, verkey]);
        });
        send('123456789abcdefghi1234', 'issuer-setup', '0.6', 'create', {});
    })

    const sovrinResponse = await registerDid(issuerDid, issuerVerkey);
    console.log(`DID registration response from Sovrin SelfServe portal:\n${sovrinResponse.data.body}`);
}

async function invite() {
    const [relationshipDid, relThreadId] = await new Promise((resolve, reject) => {
        events.once('relationshipCreated', (did, threadId) => {
            resolve([did, threadId]);
        });
        send('123456789abcdefghi1234', 'relationship', '1.0', 'create', {
            label: 'Office of the Public Guardian',
            logoUrl: 'https://robohash.org/65G.png'
        });
    });

    const inviteUrl = await new Promise(function (resolve, reject) {
        events.once('relationshipInviteUrl', resolve);
        send('123456789abcdefghi1234', 'relationship', '1.0', 'connection-invitation', {'~for_relationship': relationshipDid}, relThreadId);
    });

    return { inviteUrl, relationshipDid };
}

async function handle(message) {
    console.log('RECEIVED', message);

    switch (message["@type"]) {
    case 'did:sov:123456789abcdefghi1234;spec/configs/0.6/COM_METHOD_UPDATED':
        events.emit('webhookUpdated');
        break

    case 'did:sov:123456789abcdefghi1234;spec/issuer-setup/0.6/public-identifier-created':
        events.emit('publicIdentifier', message.identifier.did, message.identifier.verKey);
        break;
        
    case 'did:sov:123456789abcdefghi1234;spec/issuer-setup/0.6/public-identifier':
        events.emit('publicIdentifier', message.did, message.verKey);
        break;

    case 'did:sov:123456789abcdefghi1234;spec/relationship/1.0/created':
        events.emit('relationshipCreated', message.did, message['~thread'].thid);
        break;
    case 'did:sov:123456789abcdefghi1234;spec/relationship/1.0/invitation':
        events.emit('relationshipInviteUrl', message.inviteURL);
        break;
    case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/request-received':
        break;
    case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/connections/1.0/response-sent':
        events.emit('relationshipConnected', message.myDID);
        break;
    case 'did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/trust_ping/1.0/sent-response':
        break;
        
    case 'did:sov:123456789abcdefghi1234;spec/issuer-setup/0.6/problem-report':
        switch (message.message) {
        case 'Issuer Identifier is already created or in the process of creation':
            await send('123456789abcdefghi1234', 'issuer-setup', '0.6', 'current-public-identifier', {});
            break;
        }
        
    default:
        console.log(`Unexpected message type ${message["@type"]}`);
    }
}

async function registerDid (issuerDid, issuerVerkey) {
    return axios.post('https://selfserve.sovrin.org/nym', {
        network: 'stagingnet',
        did: issuerDid,
        verkey: issuerVerkey,
        paymentaddr: ''
    });
}

module.exports = { enabled, issuer, handle, invite, events };
