const authn = require('@inrupt/solid-client-authn-node');
const client = require("@inrupt/solid-client");
const access = require('@inrupt/solid-client-access-grants');

const CreateCredential = require('../../lib/vcbbs/CreateCredential.js');
const { brotliDecompressSync } = require('zlib');
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
                    lpaType: "Health and welfare LPA",
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

        //login to session with application credentials.
        await session.login({
            oidcIssuer: "https://login.inrupt.com/",
            // clientId: "3441b0c9-e34b-478b-ba2b-63eca9b79207",
            // clientSecret: "c01259dd-7c70-4a81-a45e-cb86b58cef89",
            clientId: '3243eb6f-698d-4d3d-ac55-8884906c96ca',
            clientSecret: 'a4ff1e55-c8e3-46e4-9629-4252b9480645'
        });

        //Get List of available pods
        //const availablePods = await client.getPodUrlAll(session.info.webId, { fetch: session.fetch });
        
        //get enpoint for access request
        const accessEndpoint = await access.getAccessApiEndpoint('https://storage.inrupt.com/b8f7b741-9b95-4dc6-a186-42ab1fb458a6/' + "govuk/lpas/");

        //issue request
        const accessRequest = await access.issueAccessRequest(
            {
            access: {
                read: true,
                write: true,
            },
            purpose: "https://example.com/purposes#print",
            resourceOwner: 'https://id.inrupt.com/lukejolliffe',
            resources: [
                'https://storage.inrupt.com/b8f7b741-9b95-4dc6-a186-42ab1fb458a6/' + "govuk/lpas/",
            ],
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

        const session = new authn.Session();
        req.session.sessionId = session.info.sessionId;

        //Login to session again with application credentials
        await session.login({
            oidcIssuer: "https://login.inrupt.com/",
            // clientId: "3441b0c9-e34b-478b-ba2b-63eca9b79207",
            // clientSecret: "c01259dd-7c70-4a81-a45e-cb86b58cef89",
            clientId: '3243eb6f-698d-4d3d-ac55-8884906c96ca',
            clientSecret: 'a4ff1e55-c8e3-46e4-9629-4252b9480645',
            tokenType: 'Bearer'
        });

        //Get available pods
        //const mypods = await client.getPodUrlAll(session.info.webId, { fetch: session.fetch });


        //Create the verifyable credential
        credentialService = new CreateCredential();

        lpaCredential = await CreateCredential.Create();

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
            accessGrant.credentialSubject.providedConsent.forPersonalData[0];

        //get the file to check for existence
        try {
            var file = await access.getFile(targetResource, accessGrant, {fetch: session.fetch})
        } catch (error) {
           
        }
        
        //Save to container
        try {
            await access.saveFileInContainer(
                'https://storage.inrupt.com/b8f7b741-9b95-4dc6-a186-42ab1fb458a6/' + 'govuk/lpas/',
                Buffer.from(JSON.stringify(lpaCredential.signedDocument)),
                accessGrant,
                { slug: lpaCredential.signedDocument.credentialSubject.donorFamilyName + "lpaVC.json", contentType: "application/json", fetch: session.fetch }
            );
        } catch (error) {
            if (error.statusCode == 409) {
                // Do something to do with file name confliction
            }
            console.log(error.statusCode)
        }
    
        res.render("success",{});
        });

    router.get("/lpa/test-endpoint", async function(req, res) {
        const result = await CreateCredential.Create();
        return res.json(result.signedDocument);
    });

    router.get("/success", async function(req, res) {
        res.render("success", {});
    });

    router.get("/gds/account/login", function(req, res) {
        res.render("login-gds-account", {});
    });

    router.get("/lpa/access-permissions", async function(req, res) {
        res.render("lpa-access-permissions", {});
    });

    router.get("/what-is-a-pod", async function(req, res) {
        res.render("what-is-a-pod", {});
    });
};
