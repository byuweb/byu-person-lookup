/*
 * Copyright 2018 Brigham Young University
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *    http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as authn from './node_modules/@byuweb/browser-oauth/byu-browser-oauth.mjs'

const observer = authn.onStateChange(({state, token, user, error}) => {
  // React to change
});

function nameParams (search) {
  let surname = ''
  let restOfName = ''
  if (/,/.test(search)) {
    // Assume 'Last, First'
    [surname, restOfName] = search.split(',').map(s => s.trim())
  } else {
    // Assume 'First Middle Last'
    const words = search.split(' ')
    surname = words.slice(-1)
    restOfName = words.join(' ')
  }
  return `?surname=${surname}&rest_of_name=${restOfName}`
}

export function resolveSearchType (search) {
  return search.length < 1
  ? { q: `?surname=${search}`, label: '' }
  : /^\d{3-9}$/.test(search)
  ? { q: `?byu_id=${search}`, label: 'BYU ID' }
  : /^[a-z][a-z0-9]{2,7}$/.test(search)
  ? { q: `?net_id=${search}`, label: 'Net ID' }
  : /^[^@]+@.+$/.test(search)
  ? { q: `?email_address=${search}`, label: 'Email' }
  : /^[^ ]+ +[^ ]+[^0-9]*$/
  ? { q: `${nameParams(search)}`, label: 'Name' }
  : { q: `?surname=${search}`, label: 'Name' }
}

export function search (searchText) {
  if (!authn.hasToken()) {
    throw new Error('Not authenticated!')
  }
  const {q, label} = resolveSearchType(searchText)
  const apiBase = 'https://api.byu.edu:443/byuapi/persons/v2/'
  const init = {
    method: 'GET',
    headers: new window.Headers(authn.authorizationHeader())
  }
  return window.fetch(`${apiBase}${q}&contexts=contact&page_start=1&page_size=25`, init)
  .then(response => {
    if (response.ok) {
      return response.json()
    } else if (response.status === 404) {
      return null
    }

    console.error(`Error ${response.status} while querying personsv2`)
  })
  .then(json => {
    // Parse json
  })
}

//in disconnectedCallback():
export function disconnect () {
  observer.disconnect();
}
