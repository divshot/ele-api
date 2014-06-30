# Ele API

Ele (pronounced "ellie") is an online IDE and distribution mechanism for
Web Components (i.e. Custom Elements). This API is what runs at
`https://api.ele.io`.

## Local Development

Create a `.env` file and populate the following variables:

```
GITHUB_KEY=             # GitHub Client ID for your dev app
GITHUB_SECRET=          # GitHub Client Secret for your dev app
ORIGIN=                 # API Origin (e.g. http://localhost:3000)
WEB_ORIGIN=             # Web Origin (e.g. http://localhost:4000)
MONGO_CONN=             # MongoDB connection url
GITHUB_CLIENT_ID=       # Github client id
GITHUB_CLIENT_SECRET=   # Github client secret
```

Next, you'll need Node.js and to run `npm install`. To run the server,
you can simply:

    npm start