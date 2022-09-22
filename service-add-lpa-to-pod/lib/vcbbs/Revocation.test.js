import Revocation from './Revocation.js';

describe("Revocation", () => {
    describe("If I create a credential", () => {
        let result;
        beforeAll(async () => {
            result = await Revocation.Add("http://something.com/lol", "2019-12-03T12:19:52Z", "2029-12-03T12:19:52Z");
        })
        it("it should be verified", async () => {
            expect(result).toBeTruthy();
        });
    });
});
