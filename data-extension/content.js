const tweetSet = new Set([])
let lastSize = 0
let thanosMode = true
const particleQueue = []

chrome.storage.sync.get('isThanos', (data) => {
  console.log('Got value of isThanos:', data)
  if (data) thanosMode = data.isThanos
})

// let test = true

// function executeQueue (q, idx) {
//   if (idx >= q.length) return false
//   q[idx].disintegrate()
//   setTimeout(() => executeQueue(q, idx + 1), 400)
// }

function doParticle () {
  if (particleQueue.length > 0 && thanosMode) {
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
        if (thanosMode) {
          const particles = new Particles(li, {
            direction: 'left',
            color: 'black',
            complete () {
              $li.css('display', 'none')
              $li.parent().parent().remove()
            }
          })

          particleQueue.push(particles)
        } else {
          $li.css('display', 'none')
        }
      } else if (!($li.hasClass('spam-container'))) {
        const spamButton = $('<button class="spamButton" />')
          .text('Spam?')

        spamButton.click(function () {
          if (thanosMode) {
            const particles = new Particles(li, {
              direction: 'left',
              color: 'black',
              complete () {
                $li.css('display', 'none')
                $li.parent().parent().remove()
              }
            })
            particleQueue.push(particles)
          } else {
            $li.css('display', 'none')
          }
        })
        spamButton.prependTo($li)
        $li.addClass('spam-container')
      }
    })
    // executeQueue(particleQueue, 0)
    setTimeout(jon, 200)
  })
}

$(function () {
  // chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  //   if (msg.data !== undefined) {
  //     thanosMode = msg.data
  //   }
  // })
  chrome.storage.onChanged.addListener(function (changes, namespace) {
    for (let key in changes) {
      if (key !== 'isThanos') continue
      thanosMode = changes[key].newValue
    }
  })
  jon()
  setInterval(doParticle, 400)
})
