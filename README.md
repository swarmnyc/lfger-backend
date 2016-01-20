# lfger-backend
The Backend for the LFGer app, written in Express 4 and Node 5 with a MongoDB backend via Mongoose.

##Requirements
* MongoDB 2.6+
* A REDIS server (for caching)
* Node.js 5.0.0+

##Configuration
The configuration requires the following environment variables to be set (or an appropriate .env file in the project root for development or testing):

DATABASE_URL=<<Mongo db address>
REDIS_HOST=<<Redis server address>>
REDIS_PORT=<<Redis server port>>
CONCURRENT_WORKERS=<<how many simultaneous worker processes to run. Best to set to the number of cores in the CPU>>
NODE_ENV=<<development, test, or production>>
PORT=<<PORT SHOULD LISTEN FOR (Not required if deploying to Azure or use an nginx/iis proxy)>>
NEWRELIC_KEY=<<KEY FOR THE NEW RELIC APM>>

##Run
`git clone` the repository and run `npm install`. Then run `npm run dev` for development or `npm start` for production.

##Test
`npm test`
