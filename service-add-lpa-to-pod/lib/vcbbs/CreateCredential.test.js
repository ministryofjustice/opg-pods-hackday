import CreateCredential from './CreateCredential.js';
const testVerifiableCredential = require("./data/testVC.json");

describe("CreateCredential", () => {
    describe("If I create a credential", () => {
        let credential;
        let result;
        beforeAll(async () => {
            credential = await CreateCredential.Create();
            result = credential.verified.results[0];
        })
        it("it should be verified", async () => {
            expect(credential.verified.verified).toBeTruthy();
        });
        it("it should return 1 result", async () => {
            expect(credential.verified.results.length).toBe(1);
        });
        it("it should return 1 result as verified", async () => {
            expect(result.verified).toBeTruthy();
        });
        it("it should have the correct properties", async () => {
            expect(result.proof).toHaveProperty("@context");
            expect(result.proof).toHaveProperty("type");
            expect(result.proof).toHaveProperty("created");
            expect(result.proof).toHaveProperty("nonce");
            expect(result.proof).toHaveProperty("proofPurpose");
            expect(result.proof).toHaveProperty("proofValue");
            expect(result.proof).toHaveProperty("verificationMethod");
        });

        it("it should return a attorney details", async () => {
            expect(credential.signedDocument.credentialSubject.attorneyGivenName).toBe("Alice");
            expect(credential.signedDocument.credentialSubject.attorneyFamilyName).toBe("Smith");
            expect(credential.signedDocument.credentialSubject.attorneyAddressStreet).toBe("12 Alice Test Street");
            expect(credential.signedDocument.credentialSubject.attorneyAddressTown).toBe("Selly oak");
            expect(credential.signedDocument.credentialSubject.attorneyAddressRegion).toBe("Birmingham");
            expect(credential.signedDocument.credentialSubject.attorneyAddressCountry).toBe("United Kingdom");
            expect(credential.signedDocument.credentialSubject.attorneyAddressPostCode).toBe("BN12 9RQ");
        });

        it("it should return a donors details", async () => {
            expect(credential.signedDocument.credentialSubject.donorGivenName).toBe("Bob");
            expect(credential.signedDocument.credentialSubject.donorFamilyName).toBe("Smith");
            expect(credential.signedDocument.credentialSubject.donorAddressStreet).toBe("24 Bob Terrace");
            expect(credential.signedDocument.credentialSubject.donorAddressTown).toBe("Selly oak");
            expect(credential.signedDocument.credentialSubject.donorAddressRegion).toBe("Birmingham");
            expect(credential.signedDocument.credentialSubject.donorAddressCountry).toBe("United Kingdom");
            expect(credential.signedDocument.credentialSubject.donorAddressPostCode).toBe("BN12 9RW");
        });

        it("it should return instructions and type", async () => {
            expect(credential.signedDocument.credentialSubject.preferencesInstructions).toBe("Some instructions");
            expect(credential.signedDocument.credentialSubject.lpaType).toBe("Health and Welfare");
        });
    });
});

describe("Verify", () => {
    describe("If I verify a credential", () => {
        let credential;
        let result;
        beforeAll(async () => {
            credential = await CreateCredential.Verify(testVerifiableCredential);
            result = credential.verified.results[0];
        })
        it("it should be verified", async () => {
            expect(credential.verified.verified).toBeTruthy();
        });
        it("it should return 1 result", async () => {
            expect(credential.verified.results.length).toBe(1);
        });
        it("it should return 1 result as verified", async () => {
            expect(result.verified).toBeTruthy();
        });
        it("it should have the correct properties", async () => {
            expect(result.proof).toHaveProperty("@context");
            expect(result.proof).toHaveProperty("type");
            expect(result.proof).toHaveProperty("created");
            expect(result.proof).toHaveProperty("nonce");
            expect(result.proof).toHaveProperty("proofPurpose");
            expect(result.proof).toHaveProperty("proofValue");
            expect(result.proof).toHaveProperty("verificationMethod");
        });
    });
});
