'use strict'

let isThanos = true

chrome.storage.sync.get('isThanos', (data) => {
  console.log('Got value of isThanos:', data)
  if (data) isThanos = data.isThanos
})

$(function() {
  $('#toggleSwitch').prop('checked', isThanos)
})

$('#toggleSwitch').change(function (element) {
  console.log('Setting isThanos to', $('#toggleSwitch').prop('checked'))
  chrome.storage.sync.set({'isThanos': $('#toggleSwitch').prop('checked')})
  // isThanos = !isThanos
  // chrome.tabs.query({
  //   active: true,
  //   currentWindow: true
  // }, function (tabs) {
  //   chrome.tabs.sendMessage(tabs[0].id, {
  //     data: isThanos
  //   })
  // })
})
