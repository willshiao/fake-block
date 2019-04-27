// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict'

chrome.runtime.onMessage.addListener(
  function (request, sender, sendResponse) {
    console.log('HITTO - Will')
    const url = 'https://fakeblock.org/classify'
    fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request.data)
    })
      .then(res => res.json())
      .then(resJson => {
        console.log('Got res:', resJson)
        return sendResponse(resJson)
      })
      .catch(error => console.error(error))
    return true // Will respond asynchronously.
  })
