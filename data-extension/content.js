const tweetSet = new Set([])
let lastSize = 0
const particleQueue = []
// let test = true

// function executeQueue (q, idx) {
//   if (idx >= q.length) return false
//   q[idx].disintegrate()
//   setTimeout(() => executeQueue(q, idx + 1), 400)
// }

function doParticle () {
  if (particleQueue.length > 0) {
    particleQueue[0].disintegrate()
    particleQueue.shift()
  }
}

function jon () {
  const tweetList = $('#stream-items-id>li')
  const tweets = []
  // console.log('Got tweet list size:', tweetList.length)

  if (tweetList.length === lastSize) {
    setTimeout(jon, 200)
    return
  }

  lastSize = tweetList.length

  tweetList.each((key, li) => {
    const $li = $(li)
    const id = $li.data().itemId
    console.log('Found tweet: ', id)

    if (tweetSet.has(id)) return null
    tweetSet.add(id)

    // Get text ;(
    const text = $li.find('div.tweet div.js-tweet-text-container p').text()
    // console.log('Got text:', text)
    tweets.push({
      id,
      text
    })
  })
  console.log('Sending: ', tweets)

  if (tweets.length === 0) {
    setTimeout(jon, 200)
    return
  }

  chrome.runtime.sendMessage({ data: tweets }, function (response) {
    console.log('Got response:', response)
    if (response === undefined) {
      setTimeout(jon, 200)
      return
    }
    const toHide = new Set(response.ids)

    tweetList.each((key, li) => {
      const $li = $(li)
      if ($li.data() && toHide.has($li.data().itemId)) {
        const particles = new Particles(li, {
          direction: 'left',
          color: 'black',
          complete () {
            $li.css('display', 'none')
            $li.parent().parent().remove()
          }
        })
        particleQueue.push(particles)
        // particles.disintegrate()
        // console.log('Hiding: ', $li.data().itemId)
        // $li.fadeOut(3000)
        // $li.css('display', 'none')
      }
    })
    // executeQueue(particleQueue, 0)
    setTimeout(jon, 200)
  })
}

$(function () {
  jon()
  setInterval(doParticle, 400)
})
