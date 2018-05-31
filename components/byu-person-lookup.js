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

import {LitElement, html} from '@polymer/lit-element'
import {svg} from 'lit-html/lib/lit-extended'
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch'
import ByuPersonLookupResults from './byu-person-lookup-results'

export default class ByuPersonLookup extends LitElement {
  static get properties () {
    return {
      search: String,
      results: Object,
      context: String
    }
  }

  static debounce (f, t) {
    // console.log(`debounce::f=${f}, t=${t}`)
    let timeout
    return (...args) => {
      if (timeout) {
        clearTimeout(timeout)
      }
      const cb = ( () => f(...args) ).bind(target)
      timeout = setTimeout(cb, t)
    }
  }

  _render ({search, results, context}) {
    console.log(`search=${search}, context=${context}`)
    const [iconH, iconW, , , iconPath] = faSearch.icon
    const css = html`
      <style>
        :host {
        }
        * {
         font-family: 'Gotham A', 'Gotham B', Helvetica Nue, Helvetica, sans-serif; 
        }
        div {
          position: relative;
          padding: 1rem;
        }
        label {
          position: absolute;
          left: 1rem;
          top: -0.1rem;
          font-size: 0.7rem;
          color: #999;
        }
        @media not speech {
          .sr-only { display: none }
        }
        input[type="search"] {
          font-size: 1.1rem;
          padding: 0.3rem;
          border: thin solid #333333;
          border-radius: 0.2rem;
          margin-right: 0.2rem;
          min-width: 15rem;
        }
        button {
          font-size: 1.1rem;
          padding: 0.3rem 0.7rem;
          border: thin solid #333333;
          border-radius: 0.2rem;
          background-color: #1e61a4;
          color: white;
        }
      </style>
    `

    return html`
    ${css}
    <div>
      <label for="search">
        <slot>
          No Data Provider
        </slot>
      </label>
      <input
        id="search"
        type="search"
        size="12"
        value$="${search}"
        on-input="${e => this.searchChange(e)}"
        on-search="${e => this.doSearch(e)}"
      >
      <button on-click="${e => this.doSearch(e)}">
        <svg alt="Search" width="14" height="14" viewBox="0 0 512 512">
          ${svg`<path d$="${iconPath}" fill="white" />`}
        </svg>
      </button>
    </div>
    <slot name="results">
      <byu-person-lookup-results
        results="${results}"
        context="${context}"
        on-byu-lookup-results-close="${e => this.closeResults()}"
      ></byu-person-lookup-results>
    </slot>
    `
  }

  closeResults () {
    this.results = null
  }

  registerProvider (provider) {
    this.__lookupProvider = provider
    this.addEventListener('byu-lookup-datasource-result', this.searchResults)
    this.addEventListener('byu-lookup-datasource-error', this.searchError)
    this.fetchFromProvider = this.__lookupProvider.performSearch
  }

  connectedCallback () {
    super.connectedCallback()
    const provider = this.firstElementChild
    if (provider && provider.performSearch) {
      this.registerProvider(provider)
    } else {
      const providerErrorFn = () => { throw new Error('No valid lookup provider found!') }
      const timeout = setTimeout(providerErrorFn, 10000)
      this.addEventListener('byu-lookup-datasource-register', (e) => {
        this.registerProvider(e.target)
        clearTimeout(timeout)
      })
    }
  }

  searchResults (e) {
    e.stopPropagation() // Don't trigger any other lookup components
    console.log('search results:\n', e.detail)
    this.results = e.detail
  }

  searchError (e) {
    e.stopPropagation() // Don't trigger any other lookup components
    console.log('search error:\n', e.detail)
  }

  searchChange (e) {
    this.search = e.target.value
    // console.log(`search=${this.search}`)
    if (this.__lookupProvider) {
      const search = this.search
      this.__lookupProvider.search = search
    }
  }

  doSearch () {
    console.log(`doSearch:search: ${this.search}`)
    this.fetchFromProvider(this.search)
    const s = this.search
  }
}

console.log('registering person lookup')
window.customElements.define('byu-person-lookup', ByuPersonLookup)
