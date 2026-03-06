// Lambda Function: Authentication Handler
// Handles user authentication, token validation, and user management

const { 
  CognitoIdentityProviderClient,
  AdminGetUserCommand,
  AdminUpdateUserAttributesCommand,
  AdminDeleteUserCommand,
  ListUsersCommand
} = require('@aws-sdk/client-cognito-identity-provider');
const jwt = require('jsonwebtoken');

const cognitoClient = new CognitoIdentityProviderClient({ 
  region: process.env.AWS_REGION 
});

const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;

/**
 * Lambda handler for authentication operations
 */
exports.handler = async (event) => {
  console.log('Auth Handler Event:', JSON.stringify(event, null, 2));

  const { httpMethod, path, headers, body } = event;
  const parsedBody = body ? JSON.parse(body) : {};

  try {
    // Route based on path and method
    if (path === '/auth/validate' && httpMethod === 'POST') {
      return await validateToken(parsedBody.token);
    }
    
    if (path === '/auth/user' && httpMethod === 'GET') {
      return await getUserInfo(headers.authorization);
    }
    
    if (path === '/auth/user' && httpMethod === 'PUT') {
      return await updateUserAttributes(headers.authorization, parsedBody);
    }
    
    if (path === '/auth/user' && httpMethod === 'DELETE') {
      return await deleteUser(headers.authorization);
    }
    
    if (path === '/auth/users' && httpMethod === 'GET') {
      return await listUsers(headers.authorization);
    }

    return {
      statusCode: 404,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Route not found' }),
    };
  } catch (error) {
    console.error('Auth Handler Error:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
};

/**
 * Validate JWT token
 */
async function validateToken(token) {
  try {
    // Decode token without verification (Cognito tokens are already verified by API Gateway)
    const decoded = jwt.decode(token);
    
    if (!decoded) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valid: false, error: 'Invalid token' }),
      };
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) {
      return {
        statusCode: 401,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valid: false, error: 'Token expired' }),
      };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        valid: true, 
        userId: decoded.sub,
        email: decoded.email,
        role: decoded['custom:role'] || 'user'
      }),
    };
  } catch (error) {
    return {
      statusCode: 401,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valid: false, error: error.message }),
    };
  }
}

/**
 * Get user information from Cognito
 */
async function getUserInfo(authHeader) {
  const username = await getUsernameFromToken(authHeader);
  
  const command = new AdminGetUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: username,
  });

  const response = await cognitoClient.send(command);
  
  const attributes = {};
  response.UserAttributes?.forEach(attr => {
    attributes[attr.Name] = attr.Value;
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: response.Username,
      email: attributes.email,
      name: attributes.name,
      role: attributes['custom:role'] || 'user',
      emailVerified: attributes.email_verified === 'true',
      createdAt: response.UserCreateDate,
      enabled: response.Enabled,
    }),
  };
}

/**
 * Update user attributes
 */
async function updateUserAttributes(authHeader, updates) {
  const username = await getUsernameFromToken(authHeader);
  
  const attributes = [];
  if (updates.name) attributes.push({ Name: 'name', Value: updates.name });
  if (updates.phone) attributes.push({ Name: 'phone_number', Value: updates.phone });
  if (updates.role) attributes.push({ Name: 'custom:role', Value: updates.role });

  const command = new AdminUpdateUserAttributesCommand({
    UserPoolId: USER_POOL_ID,
    Username: username,
    UserAttributes: attributes,
  });

  await cognitoClient.send(command);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'User attributes updated successfully' }),
  };
}

/**
 * Delete user account
 */
async function deleteUser(authHeader) {
  const username = await getUsernameFromToken(authHeader);
  
  const command = new AdminDeleteUserCommand({
    UserPoolId: USER_POOL_ID,
    Username: username,
  });

  await cognitoClient.send(command);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'User deleted successfully' }),
  };
}

/**
 * List all users (admin only)
 */
async function listUsers(authHeader) {
  // Verify admin role
  const token = authHeader?.replace('Bearer ', '');
  const decoded = jwt.decode(token);
  
  if (decoded['custom:role'] !== 'admin') {
    return {
      statusCode: 403,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Forbidden: Admin access required' }),
    };
  }

  const command = new ListUsersCommand({
    UserPoolId: USER_POOL_ID,
    Limit: 60,
  });

  const response = await cognitoClient.send(command);
  
  const users = response.Users?.map(user => {
    const attributes = {};
    user.Attributes?.forEach(attr => {
      attributes[attr.Name] = attr.Value;
    });
    
    return {
      username: user.Username,
      email: attributes.email,
      name: attributes.name,
      role: attributes['custom:role'] || 'user',
      enabled: user.Enabled,
      status: user.UserStatus,
      createdAt: user.UserCreateDate,
    };
  });

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ users }),
  };
}

/**
 * Extract username from JWT token
 */
async function getUsernameFromToken(authHeader) {
  const token = authHeader?.replace('Bearer ', '');
  if (!token) {
    throw new Error('No authorization token provided');
  }
  
  const decoded = jwt.decode(token);
  return decoded['cognito:username'] || decoded.sub;
}
