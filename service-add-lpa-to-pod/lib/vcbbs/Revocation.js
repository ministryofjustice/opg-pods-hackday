const fetch = require('node-fetch');
const URI = "https://m4i5gaf6g5c57avrlxi2kzaula.appsync-api.eu-west-1.amazonaws.com";
const URI_PATH = "/graphql";
const HEADERS = {
    'Content-Type': 'application/graphql',
    'Accept': 'application/json',
    'x-api-key': 'da2-suhwh2qplna55luyjftow4bjgm',
};

module.exports = class Revocation {

    static async Add(id, issuedDate, expirationDate) {
        //var query = `mutation createVCRevocation($input)`;
        var query = `mutation MyMutation {
            createVCRevocation(input: {id: "did:opgverifiablecredential:b34ca6cd37bbf23", expirationDate: "2029-12-03T12:19:52Z", issuanceDate: "2019-12-03T12:19:52Z"}) {
              id
              expirationDate
              issuanceDate
            }
          }`;
        const result = await fetch(`${URI}${URI_PATH}`, {
            method: 'POST',
            headers: HEADERS,
            //body: JSON.stringify({ query: `{ id: ${id}, issuedDate: ${issuedDate}, expirationData: ${expirationData} }` })
            body: JSON.stringify({
                query,
                variables: { input: { id, issuedDate, expirationDate }},
            })
        })
            .then(r => r.json())
            .then(data => {
                console.log(data)
                return data;
            })
            .catch(error => {
                console.error(error);
            });
        return result;
    }

    static async Get(id) {
        const result = await fetch(`${URI}${URI_PATH}`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify({ query: `{ id: ${id}, issuedDate: ${issuedDate}, expirationData: ${expirationData} }` })
        })
            .then(r => r.json())
            .then(data => {
                return data;
            })
            .catch(error => {
                console.error(error);
            });
        return result;
    }
}
