﻿# **API Documentation**

# **Base URL: http://localhost:3001**

# **Endpoints**

1) Sign Out User
Endpoint: /api/users/signout

Method: POST

2) Create a Team
Endpoint: /api/teams

Method: POST

3) Update a Team
Endpoint: /api/teams/updateTeam

Method: PATCH

4) Delete a Team
Endpoint: /api/teams

Method: DELETE

5) Fetch Teams
Endpoint: /api/teams

Method: GET

6) Join a Team
Endpoint: /api/teams/join

Method: POST

7) Fetch Users
Endpoint: /api/users

Method: GET

8) Get Current User ID
Endpoint: /api/users/current-user

Method: GET

9) Fetch Team Details (and Member Details)
Endpoint 1: /api/teams/[teamId]

Method: GET

Endpoint 2: /api/users/[memberId]

Method: GET

10) Remove Member from Team
Endpoint: /api/teams/[teamId]/remove-member

Method: POST

11) Sign Up User
Endpoint: /api/users/signup

Method: POST

12) Sign In User
Endpoint: /api/users/signin

Method: POST

Ensure to meticulously review the API endpoints to guarantee accurate and secure data interactions between client and server.

# **Configuration:**

Create a .env file in your project root and set up the environment variables. You can find an example in the .env.sample file.

1) Place the provided firebase-service-account.json in the root of the project directory (or a secure known path). Set the "FIREBASE_KEY_PATH' in your .env to point to this file.

Under production circumstances, such credentials should never be included in a public repo or shared.

These credentials are shared exceptionally for the review purposes of this code challenge. Firestore rules in production should also be improved for their current form.

2) The API_URL points to the base URL of your backend API. For local development, you can set it as follows: API_URL="http://localhost:3001"

3) Generate a secure, random string to be used as your JWT secret key.
  
You could generate a secure key in Node.js as follows:

```
const crypto = require('crypto');

const secret = crypto.randomBytes(64).toString('hex');
console.log(secret);
```

Then set the 'secret' in your .env file
  
# **Run on local machine:**
  
Prerequisites: Node.js, npm.

```
git clone https://github.com/carlo190101martin/codeChallenge.git

cd codeChallenge via CL ///in other words, the directory
```

1) npm install
  
2) Run via CL: ```node src/index.js```, then visit http://localhost:3001

3) Test via CL: ```npm test```


# **Run on Docker:**

```
git clone https://github.com/carlo190101martin/codeChallenge.git

cd codeChallenge ///in  other words the directory
```

1) Configure docker-compose.yml:

    Edit the volume path to point to your firebase-service-account.json file directory on your local machine.
    Add a secret key under the environment section. Please refer to point 3 in the env section of this documentation for details.

Please note again that having the firebase-service-account.json in this repo is to enable easy review of my project. This should otherwise never be included in a repo or shared.

2) Run in CL: ```docker-compose up```


# **How to delete/reject a user as Team Owner:**

Click on Details under Team Information. If you are the owner, there will be a remove button next to users' names.

# **Final note on production:**

In production, MongoDB should probably be used instead of firebase for scalability. Swagger or a similar product should also be used for API documentation best practices.
  
  
  
  





   
   













