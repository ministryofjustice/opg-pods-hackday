const CreateCredential = require('../../lib/vcbbs/CreateCredential.js');

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

    router.get("/lpa/send-to-pod", function(req, res) {
        res.render("send-to-pod", {});
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
