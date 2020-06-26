# Reddit Royale Server

### [View Demo site](https://reddit-royale.netlify.app/)

You can view the frontend code for this site [Here](https://github.com/StevenMcHenry01/Reddit_Royale_Client)

This is a simple web app where one can use their reddit profile to login and then pit various subreddits against one another.

## endpoints:
1. Testing that api is running
```
/api
```
2. For all auth stuffs
to login
```
api/auth/reddit
```
to logout
```
api/auth/logout
```
for the reddit callback
```
api/auth/reddit/callback
```
## installing:
1. install all dependencies
```
npm install
```
or 
```
yarn install
```
2. add .env file with your own provided values
```
CLIENT_ID=
CLIENT_SECRET=
AUTH_URL=https://www.reddit.com/api/v1/authorize
TOKEN_URL=https://www.reddit.com/api/v1/access_token
COOKIE_SECRET=
REDIRECT_URI=
FRONTEND_URL=
REDDIT_API_URL=https://oauth.reddit.com
ACCESS_TOKEN_SECRET=
REFRESH_TOKEN_SECRET=
```

3. run the server locally
```
yarn watch:dev
```

## deployment
I deployed this app using a Ec2 AWS ubuntu server and then creating a reverse proxy using nginx, gaining an ssl cert through certbot, and hosting the domain via hostcheap.

Guide on that coming soon.

