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
  const data = fs.readFileSync('data/NLP+CSS_2016.tsv', 'utf8')
    .split('\n')
    .map(line => line.split('\t'))
    .slice(1)
  const csvWriter = createObjectCsvWriter({
    path: 'data/cleaned.csv',
    header: [
        {id: 'id', title: 'TweetID'},
        {id: 'text', title: 'Text'},
        {id: 'class', title: 'Class'}
    ]
  });

  const tweetPieces = await Promise.map(_.chunk(data, 100), getTweetData, { concurrency: 3 })
  const output = Object.values(_.assign({}, ...tweetPieces))
  await csvWriter.writeRecords(output)
  console.log('...Done!')
}

async function getTweetData(chunk) {
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
  tweets.forEach(tweet => {
    classMap[tweet.id_str].text = tweet.text
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