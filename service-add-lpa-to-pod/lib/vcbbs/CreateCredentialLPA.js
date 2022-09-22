const {
    Bls12381G2KeyPair,
    BbsBlsSignature2020,
    BbsBlsSignatureProof2020,
    deriveProof,
} = require("@mattrglobal/jsonld-signatures-bbs");
const { extendContextLoader, sign, verify, purposes } = require("jsonld-signatures");

const inputDocument = require("./data/inputDocumentLPA.json");
const keyPairOptions = require("./data/keyPair.json");
const exampleControllerDoc = require("./data/controllerDocument.json");
const bbsContext = require("./data/bbs.json");
const revealDocument = require("./data/deriveProofFrame.json");
const LPAVocab = require("./data/LPAVocab.json");
const credentialContext = require("./data/credentialsContext.json");
const suiteContext = require("./data/suiteContext.json");

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const documents = {
    "did:opgverifiablecredential:489398593#test": keyPairOptions,
    "did:opgverifiablecredential:489398593": exampleControllerDoc,
    "https://w3id.org/security/bbs/v1": bbsContext,
    "https://w3id.org/citizenship/v1": LPAVocab,
    "https://www.w3.org/2018/credentials/v1": credentialContext,
    "https://w3id.org/security/suites/jws-2020/v1": suiteContext,
};

const customDocLoader = (url) => {
    const context = documents[url];

    if (context) {
        return {
            contextUrl: null, // this is for a context via a link header
            document: context, // this is the actual document that was loaded
            documentUrl: url, // this is the actual context URL after redirects
        };
    }

    console.log(
        `Attempted to remote load context : '${url}', please cache instead`
    );
    throw new Error(
        `Attempted to remote load context : '${url}', please cache instead`
    );
};

const documentLoader = extendContextLoader(customDocLoader);

module.exports = class CreateCredentialLPA {
    static async Create() {
        //Import the example key pair
        const keyPair = await new Bls12381G2KeyPair(keyPairOptions);

        console.log("Input document");
        console.log(JSON.stringify(inputDocument, null, 2));

        //Sign the input document
        const signedDocument = await sign(inputDocument, {
            suite: new BbsBlsSignature2020({ key: keyPair }),
            purpose: new purposes.AssertionProofPurpose(),
            documentLoader,
        });

        console.log("Input document with proof");
        console.log(JSON.stringify(signedDocument, null, 2));

        //Verify the proof
        let verified = await verify(signedDocument, {
            suite: new BbsBlsSignature2020(),
            purpose: new purposes.AssertionProofPurpose(),
            documentLoader,
        });

        console.log("Verification result");
        console.log(JSON.stringify(verified, null, 2));

        //Derive a proof
        const derivedProof = await deriveProof(signedDocument, revealDocument, {
            suite: new BbsBlsSignatureProof2020(),
            documentLoader,
        });

        console.log(JSON.stringify(derivedProof, null, 2));

        console.log("Verifying Derived Proof");
        //Verify the derived proof
        verified = await verify(derivedProof, {
            suite: new BbsBlsSignatureProof2020(),
            purpose: new purposes.AssertionProofPurpose(),
            documentLoader,
        });

        console.log("Verification result");
        console.log(JSON.stringify(verified, null, 2));
        return { verified: verified, deriveProof:  deriveProof, signedDocument: signedDocument };
    }

    static async Verify(signedDocument) {

        console.log("Input document with proof");
        console.log(JSON.stringify(signedDocument, null, 2));

        //Verify the proof
        let verified = await verify(signedDocument, {
            suite: new BbsBlsSignature2020(),
            purpose: new purposes.AssertionProofPurpose(),
            documentLoader,
        });

        console.log("Verification result");
        console.log(JSON.stringify(verified, null, 2));

        //Derive a proof
        const derivedProof = await deriveProof(signedDocument, revealDocument, {
            suite: new BbsBlsSignatureProof2020(),
            documentLoader,
        });

        console.log(JSON.stringify(derivedProof, null, 2));

        console.log("Verifying Derived Proof");
        //Verify the derived proof
        verified = await verify(derivedProof, {
            suite: new BbsBlsSignatureProof2020(),
            purpose: new purposes.AssertionProofPurpose(),
            documentLoader,
        });

        console.log("Verification result");
        console.log(JSON.stringify(verified, null, 2));
        return { verified: verified, deriveProof:  deriveProof };
    }
}
