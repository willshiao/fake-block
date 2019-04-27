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

  chrome.runtime.sendMessage({ data: tweets }, function (response) {
    console.log('Got response:', response)
    const toHide = new Set(response.ids)

    tweetList.each((key, li) => {
      const $li = $(li)
      if ($li.data() && toHide.has($li.data().itemId)) {
        // console.log('Hiding: ', $li.data().itemId)
        // $li.fadeOut(3000)
        $li.css('display', 'none')
      }
    })
    setTimeout(jon, 200)
  })
}

$(function () {
  jon()
})
