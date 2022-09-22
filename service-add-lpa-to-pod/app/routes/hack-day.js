const authn = require('@inrupt/solid-client-authn-node');
const client = require("@inrupt/solid-client");
const access = require('@inrupt/solid-client-access-grants');

const CreateCredential = require('../../lib/vcbbs/CreateCredential.js');
const { brotliDecompressSync } = require('zlib');
const THIS_URL = process.env.THIS_URL || 'http://localhost:3000';

module.exports = router => {

    const lpaData = {
        data: {
            lpa: {
                donor: {
                    fullname: "Alex Saunders" 
                },
                attorney: {
                    fullname: "Alice Smith"
                },
                decisions: {
                    instructions: "I only want my attorneys to move me to a care home if, in my doctor’s opinion, I can no longer live independently.",
                    preferences: "None"
                },
                lpaType: "Health and welfare LPA",
                applicationNumber: 10238756382
            } 
        }
    }

    router.get("/dashboard", function(req, res) {
        res.render("dashboard", lpaData);
    });

    router.get("/lpa/view", function(req, res) {
        res.render("lpa-view", lpaData);
    });

    router.get("/lpa/send-to-pod", async function(req, res) {

        const session = new authn.Session();
        req.session.sessionId = session.info.sessionId;

        //login to session with application credentials.
        await session.login({
            oidcIssuer: "https://login.inrupt.com/",
            clientId: "3441b0c9-e34b-478b-ba2b-63eca9b79207",
            clientSecret: "c01259dd-7c70-4a81-a45e-cb86b58cef89",
        });

        //Get List of available pods
        const availablePods = await client.getPodUrlAll(session.info.webId, { fetch: session.fetch });
        
        //get enpoint for access request
        const accessEndpoint = await access.getAccessApiEndpoint(availablePods[0] + "govuk/lpas/");

        //issue request
        const accessRequest = await access.issueAccessRequest(
            {
            access: {
                read: true,
                write: true,
            },
            purpose: "https://example.com/purposes#print",
            resourceOwner: session.info.webId,
            resources: [availablePods[0] + "/govuk/lpas/"],
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
            clientId: "3441b0c9-e34b-478b-ba2b-63eca9b79207",
            clientSecret: "c01259dd-7c70-4a81-a45e-cb86b58cef89",
            tokenType: 'Bearer'
        });

        //Get available pods
        const mypods = await client.getPodUrlAll(session.info.webId, { fetch: session.fetch });


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
            await client.saveFileInContainer(
                mypods[0] + 'govuk/lpas/',
                Buffer.from(JSON.stringify(lpaCredential.signedDocument)),
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

    router.get("/dashboard-added", async function(req, res) {
        res.render("dashboard-added", lpaData);
    });
};
