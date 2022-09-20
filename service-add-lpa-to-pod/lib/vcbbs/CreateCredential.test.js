import CreateCredential from './CreateCredential.js';

describe("CreateCredential", () => {
    describe("If I create a credential", () => {
        it("it should return the correct value", async () => {
            expect(await CreateCredential.Create()).not.toBeUndefined();
        });
    });
});
