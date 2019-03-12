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

import * as personsv2Source from '../lib/personsv2LookupDataSource'
import { LitElement, html } from '@polymer/lit-element'

const { CustomEvent } = window

const executePersonsv2Request = async (search, target, pageLink) => {
  try {
    const results = await personsv2Source.search(search, pageLink)
    if (!results) {
      console.error('results is null or undefined!')
      return {}
    }
    const { next, prev, people } = results
    target.dispatchEvent(new CustomEvent('byu-lookup-datasource-result', {
      bubbles: true,
      detail: people
    }))
    return { next, prev }
  } catch (err) {
    console.error(err)
    target.dispatchEvent(new CustomEvent('byu-lookup-datasource-error', {
      bubbles: true,
      detail: err
    }))
    return {}
  }
}

const setPendingSearch = (target) => {
  const evtType = 'byu-lookup-datasource-searching'
  const evt = new CustomEvent(evtType, { bubbles: true })
  target.dispatchEvent(evt)
}

class ByuPersonsv2Datasource extends LitElement {
  connectedCallback () {
    super.connectedCallback()
    personsv2Source.connect()
    const evt = new CustomEvent('byu-lookup-datasource-register', { bubbles: true })
    this.dispatchEvent(evt)
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    personsv2Source.disconnect()
  }

  static get properties () {
    return {
      search: { type: String },
      next: { type: String },
      prev: { type: String }
    }
  }

  render () {
    if (!this.search) {
      this.search = ''
    }
    const { label } = personsv2Source.resolveSearchType(this.search)
    return html`${label}`
  }

  async performSearch (search) {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(async () => {
      setPendingSearch(this)
      const results = await executePersonsv2Request(this.search, this) || {}
      if (results) {
        const { next, prev } = results
        this.next = next
        this.prev = prev
      }
    }, 100)
  }

  async nextPage () {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(async () => {
      if (this.next) {
        setPendingSearch(this)
        const results = await executePersonsv2Request(this.search, this, this.next) || {}
        if (results) {
          const { next, prev } = results
          this.next = next
          this.prev = prev
        }
      }
    }, 100)
  }

  async prevPage () {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
    this.timeout = setTimeout(async () => {
      if (this.prev) {
        setPendingSearch(this)
        const results = await executePersonsv2Request(this.search, this, this.prev) || {}
        const { next, prev } = results
        this.next = next
        this.prev = prev
      }
    }, 100)
  }
}

console.log('registering personsv2 datasource')
window.customElements.define('byu-personsv2-datasource', ByuPersonsv2Datasource)
