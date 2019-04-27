const tweetSet = new Set([])
let lastSize = 0
// let test = true

function jon () {
  const tweetList = $('#stream-items-id>li')
  const tweets = []

  if (tweetList.length === lastSize) {
    setTimeout(jon, 200)
    return
  }

  lastSize = tweetList.length

  tweetList.each((key, li) => {
    const $li = $(li)
    const id = $li.data().itemId

    if (tweetSet.has(id)) return null
    tweetSet.add(id)

    // Get text ;(
    const text = $li.find('div.tweet div.js-tweet-text-container p').text()
    // console.log('Got text:', text)
    tweets.push({
      id,
      text
    })

    // if (test) {
    //   $li.css('display', 'none')
    //   // $li.fadeOut(3000)
    // }
    // test = !test
  })
  console.log('Sending: ', tweets)
  $.ajax({
    type: 'POST',
    url: 'http://localhost:5000/classify',
    data: JSON.stringify(tweets),
    contentType: 'application/json',
    success: (res) => {
      console.log('Got response: ', res)
      setTimeout(jon, 200)
    },
    error: (err) => {
      console.error('Failed!!!!!', err)
    },
    dataType: 'json'
  })
}

$(function () {
  jon()
})