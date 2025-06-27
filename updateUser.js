const {
    CognitoIdentityProviderClient,
    AdminUpdateUserAttributesCommand,
    AdminSetUserPasswordCommand
} = require("@aws-sdk/client-cognito-identity-provider");

const client = new CognitoIdentityProviderClient();

exports.handler = async (event) => {
    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "POST,OPTIONS",
    };

    if (event.httpMethod === "OPTIONS") {
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: "CORS preflight handled" }),
        };
    }

    try {
        const body = JSON.parse(event.body || "{}");
        const { username, firstName, lastName, title, role, email, password } = body;

        if (!username) {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ error: "Username is required" }),
            };
        }

        const attributes = [];

        if (firstName) attributes.push({ Name: "given_name", Value: firstName });
        if (lastName) attributes.push({ Name: "family_name", Value: lastName });
        if (email) attributes.push({ Name: "email", Value: email });
        if (title) attributes.push({ Name: "custom:title", Value: title });
        if (role) attributes.push({ Name: "custom:role", Value: role });

        if (attributes.length > 0) {
            const updateAttrsCommand = new AdminUpdateUserAttributesCommand({
                UserPoolId: process.env.USER_POOL_ID,
                Username: username,
                UserAttributes: attributes,
            });
            await client.send(updateAttrsCommand);
        }

        // Update password if provided
        if (password) {
            const setPasswordCommand = new AdminSetUserPasswordCommand({
                UserPoolId: process.env.USER_POOL_ID,
                Username: username,
                Password: password,
                Permanent: true
            });
            await client.send(setPasswordCommand);
        }

        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify({ message: "User updated successfully" }),
        };
    } catch (err) {
        console.error("UpdateUser error:", err);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: err.message }),
        };
    }
};
