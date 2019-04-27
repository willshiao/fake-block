const tweetSet = new Set([])
let lastSize = 0
let test = true
function jon () {
  // console.log('?')
  const tweetList = $('#stream-items-id>li')
  if (tweetList.length !== lastSize) {
    lastSize = tweetList.length

    tweetList.each((key, li) => {
      const $li = $(li)
      const id = $li.data().itemId
      if (tweetSet.has(id)) return null
      tweetSet.add(id)
      if (test) {
        $li.css('display', 'none')
        // $li.fadeOut(3000)
      }
      test = !test
    })
  }
  setTimeout(jon, 200)
}

$(function () {
  jon()
})