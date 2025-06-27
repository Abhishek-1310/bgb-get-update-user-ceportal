const {
    CognitoIdentityProviderClient,
    ListUsersCommand,
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient();

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "GET,OPTIONS",
    };

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: "CORS preflight handled" }),
        };
    }

    try {
        const command = new ListUsersCommand({
            UserPoolId: process.env.USER_POOL_ID,
            Limit: 60,
        });

        const response = await client.send(command);

        const users = response.Users.map(user => {
            const attributes = {};
            user.Attributes.forEach(attr => {
                attributes[attr.Name] = attr.Value;
            });
            return {
                username: user.Username,
                firstName: attrs["given_name"] || "",
                lastName: attrs["family_name"] || "",
                email: attrs["email"] || "",
                title: attrs["custom:title"] || "",
                role: attrs["custom:role"] || ""
            };
        });

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ users }),
        };
    } catch (err) {
        console.error("ListUsers error:", err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
