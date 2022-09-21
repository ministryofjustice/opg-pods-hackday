const authn = require('@inrupt/solid-client-authn-node');
const client = require("@inrupt/solid-client");
const access = require('@inrupt/solid-client-access-grants');
const CreateCredential = require('../../lib/vcbbs/CreateCredential.js');
const THIS_URL = process.env.THIS_URL || 'http://localhost:3000';

module.exports = router => {

    router.get("/dashboard", function(req, res) {
        res.render("dashboard", {
            data: {
                lpa: {
                    donor: {
                        fullname: "Alex Saunders" 
                    },
                    attorney: {
                        fullname: "Bob Smith"
                    },
                    attorney2: {
                        fullname: "Bobbette Smith"
                    },
                    replacementAttorney: {
                        fullname: "Bobbetta Smith"
                    },
                    decisions: {
                        instructions: "Be good",
                        preferences: "Do what I ask"
                    },
                    lpaType: "Property and Finance",
                    applicationNumber: 10238756382
                } 
            } 
        });
    });

    router.get("/lpa/view", function(req, res) {
        res.render("lpa-view", {
            data: {
                lpa: {
                    donor: {
                        fullname: "Alex Saunders" 
                    },
                    attorney: {
                        fullname: "Bob Smith"
                    },
                    attorney2: {
                        fullname: "Bobbette Smith"
                    },
                    replacementAttorney: {
                        fullname: "Bobbetta Smith"
                    },
                    decisions: {
                        instructions: "Be good",
                        preferences: "Do what I ask"
                    },
                    lpaType: "Property and Finance",
                    applicationNumber: 10238756382
                } 
            } 
        });
    });

    router.get("/lpa/send-to-pod", async function(req, res) {

        const session = new authn.Session();
        req.session.sessionId = session.info.sessionId;

        await session.login({
            oidcIssuer: "https://login.inrupt.com/",
            clientId: "3441b0c9-e34b-478b-ba2b-63eca9b79207",
            clientSecret: "c01259dd-7c70-4a81-a45e-cb86b58cef89",
        });

        const mypods = await client.getPodUrlAll(session.info.webId, { fetch: fetch });
        
        //verify existence
        const accessEndpoint = await access.getAccessApiEndpoint(mypods[0] + "govuk/lpas/");

        const accessRequest = await access.issueAccessRequest(
            {
            access: {
                read: true,
            },
            purpose: "https://example.com/purposes#print",
            resourceOwner: session.info.webId,
            resources: [mypods[0] + "/govuk/lpas/"],
            },
            {
            fetch: session.fetch,
            accessEndpoint,
            }
        );

        /**
         * Redirect to Access Management application:
         */
        await access.redirectToAccessManagementUi(accessRequest.id, `${THIS_URL}/lpa/add-to-pod-success`, {
            redirectCallback: (url) => {
            res.redirect(url);
            },
            fallbackAccessManagementUi: "https://podbrowser.inrupt.com/privacy/access/requests/",
            fetch: session.fetch,
        });

    });

    router.get("/lpa/add-to-pod-success", async function(req,res) {

        credentialService = new CreateCredential();

        lpaCredential = CreateCredential.Create();

        console.log("FOUND")
        const session = new authn.Session();
        
        await session.login({
            oidcIssuer: "https://login.inrupt.com/",
            clientId: "3441b0c9-e34b-478b-ba2b-63eca9b79207",
            clientSecret: "c01259dd-7c70-4a81-a45e-cb86b58cef89",
        });

        /**
         * Retrieve an Access Grant issued to the application.
         */
        const accessGrant = await access.getAccessGrant(req.query.accessGrantUrl, {
            fetch: session.fetch,
        });

        /**
         * Retrieve the URL of a resource to which access was granted.
         */
        const targetResource =
            accessGrant.
            credentialSubject.providedConsent.forPersonalData[0];

        // /**
        //  * Retrieve a resource using an Access Grant.
        //  */
        // const file = await access.getFile(targetResource, accessGrant, {
        //     fetch: session.fetch,
        // });

        client.saveFileInContainer(
            accessGrant.
            credentialSubject.providedConsent.forPersonalData[0],
            new blob.Blob(["This is a plain piece of text"], { type: "plain/text" }),
            { slug: "mylpa.txt", contentType: "text/plain", fetch: session.fetch }
        );

        return res.ok();
        });

    router.get("/lpa/test-endpoint", async function(req, res) {
        const result = await CreateCredential.Create();
        return res.json(result.signedDocument);
    });

    router.get("/success", async function(req, res) {
        res.render("success", {});
    });
};
