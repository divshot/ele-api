# Ele API

This is the back-end API for [Ele](https://ele.io/), the Web Components editor
created by [Divshot](http://www.divshot.com/). To get more information on
getting the whole application up and running, see the [ele-web](https://github.com/divshot/ele-web)
repository.

## Local Development

Create a `.env` file and populate the following variables:

```
GITHUB_KEY=             # GitHub Client ID for your dev app
GITHUB_SECRET=          # GitHub Client Secret for your dev app
ORIGIN=                 # API Origin (e.g. http://localhost:3000)
WEB_ORIGIN=             # Web Origin (e.g. http://localhost:4000)
MONGO_CONN=             # defaults to mongodb://localhost:27017/ele_development
```

Next, you'll need Node.js and to run `npm install`. To run the server,
you can simply:

```
npm install && bower install
npm start
```