'use strict'

const Promise = require('bluebird')
const config = require('config')
const Twitter = require('twitter')
Promise.promisifyAll(Twitter.prototype)
const fs = Promise.promisifyAll(require('fs'))
const _ = require('lodash')
const {createObjectCsvWriter} = require('csv-writer')
const client = new Twitter(config.get('twitter'))

function getClassification (row) {
  return row[1]
}

async function main () {
  if (process.argv.length < 3) process.exit(1)
  // const data = fs.readFileSync('data/NLP+CSS_2016.tsv', 'utf8')
  const data = fs.readFileSync(process.argv[2], 'utf8')
    .split('\n')
    .map(line => line.split(','))
    // .map(line => line.split('\t'))
    .slice(1)
  const csvWriter = createObjectCsvWriter({
    path: `data/cleaned_${Date.now()}.csv`,
    header: [
      { id: 'id', title: 'TweetID' },
      { id: 'text', title: 'Text' },
      { id: 'screenName', title: 'ScreenName' },
      { id: 'favCnt', title: 'FavCount' },
      { id: 'rtCnt', title: 'RtCount' },
      { id: 'verified', title: 'Verified' },
      { id: 'class', title: 'Class' }
    ]
  })

  const tweetPieces = await Promise.map(_.chunk(data, 100), getTweetData, { concurrency: 3 })
  const output = Object.values(_.assign({}, ...tweetPieces))
  await csvWriter.writeRecords(output)
  console.log('...Done!')
}

async function getTweetData (chunk) {
  const classMap = {}
  const ids = []
  chunk.forEach(row => {
    ids.push(row[0])
    classMap[row[0]] = {
      id: row[0],
      text: null,
      class: getClassification(row)
    }
  })

  const tweets = await client.getAsync('statuses/lookup', { id: ids.join(',') })
  console.log(`Getting ${tweets.length} tweets`)
  tweets.forEach(tweet => {
    // console.log(tweet)
    const storedTweet = classMap[tweet.id_str]
    storedTweet.text = tweet.text
    if (tweet.user) {
      storedTweet.screenName = tweet.user.screen_name
      storedTweet.verified = (tweet.user.verified === 'false') ? '0' : '1'
    }
    storedTweet.favCnt = tweet.favorite_count
    storedTweet.rtCnt = tweet.retweet_count
  })

  console.log(`Got: ${tweets.length}/100 tweets`)
  for (let key in classMap) {
    if (classMap[key].text === null) {
      delete classMap[key]
    }
  }
  return Promise.resolve(classMap)
}

main()
  // .then(tweets => {
  // })