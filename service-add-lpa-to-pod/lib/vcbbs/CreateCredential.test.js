import CreateCredential from './CreateCredential.js';

describe("CreateCredential", () => {
    describe("If I create a credential", () => {
        let credential;
        let result;
        beforeAll(async () => {
            credential = await CreateCredential.Create();
            result = credential.results[0];
        })
        it("it should be verified", async () => {
            expect(credential.verified).toBeTruthy();
        });
        it("it should return 1 result", async () => {
            expect(credential.results.length).toBe(1);
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
