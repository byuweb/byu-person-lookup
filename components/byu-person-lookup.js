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
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'
import ByuPersonLookupResults from './byu-person-lookup-results'

export default class ByuPersonLookup extends LitElement {
  static get properties () {
    return {
      search: String,
      results: Object,
      searchPending: Boolean,
      context: String
    }
  }

  _render ({search, results, searchPending, context}) {
    console.log(`search=${search}, context=${context}`)
    const [, , , , searchIconPath] = faSearch.icon
    const [, , , , spinIconPath] = faSpinner.icon
    const css = html`
      <style>
        :host {
          display: inline-block;
        }
        :host([hidden]) {
          display: none;
        }
        * {
         font-family: 'HCo Ringside Narrow SSm', Arial Narrow, Arial, sans-serif;
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
        input[type="search"] {
          font-size: 1.1rem;
          padding: 0.3rem;
          border: thin solid #666666;
          border-radius: 0.2rem;
          margin-right: 0.2rem;
          min-width: 15rem;
        }
        button {
          font-size: 1.1rem;
          padding: 0.3rem 1rem;
          border: thin solid #666666;
          border-radius: 0.05rem;
          background-color: #0057B8;
          color: white;
          cursor: pointer;
        }
        button:hover, button:active {
          box-shadow: inset 0 0 0.2rem rgba(255, 255, 255, 0.5);
          background-color: #5199E1;
        }
        .spin {
          animation: spin 1500ms linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .search-btn-label {
          display: none;
        }
        @media not speech {
          .sr-only { display: none; }
        }
        @media only screen and (min-width: 470px) {
          .search-btn-label {
            display: inline-block;
          }
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
        <svg
          class$="${this.searchPending ? 'spin' : ''}"
          alt="Search" width="14" height="14" viewBox="0 0 512 512">
          ${svg`
            <path
              d$="${this.searchPending ? spinIconPath : searchIconPath}"
              fill="white"
            />
          `}
        </svg>
        <span class="search-btn-label">
          ${this.searchPending ? 'Searching' : 'Search'}
        </span>
      </button>
    </div>
    <slot name="results">
      <byu-person-lookup-results
        results="${results}"
        context="${context}"
        searchPending="${this.searchPending}"
        on-byu-lookup-results-close="${e => this.closeResults()}"
        on-byu-lookup-next-page="${e => this.loadNextPage()}"
        on-byu-lookup-prev-page="${e => this.loadPrevPage()}"
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
    this.addEventListener('byu-lookup-datasource-searching', this.searchBegun)
    this.fetchFromProvider = this.__lookupProvider.performSearch
    this.nextPageFromProvider = this.__lookupProvider.nextPage
    this.prevPageFromProvider = this.__lookupProvider.prevPage
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
        e.stopPropagation()
        this.registerProvider(e.target)
        clearTimeout(timeout)
      })
    }
  }

  searchResults (e) {
    e.stopPropagation() // Don't trigger any other lookup components
    // console.log('search results:\n', e.detail)
    /*
    this.results = Array.isArray(this.results)
    ? this.results.length > 120
    ? this.results.slice(-120)
    : this.results
    : []
    */
    this.results = this.results.concat(e.detail)
    this.searchPending = false
  }

  searchError (e) {
    e.stopPropagation() // Don't trigger any other lookup components
    this.searchPending = false
    window.alert(e.detail)
    console.error('search error:\n', e.detail)
  }

  searchBegun (e) {
    e.stopPropagation() // Don't trigger any other lookup components
    this.searchPending = true
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
    // console.log(`doSearch:search: ${this.search}`)
    this.results = []
    this.fetchFromProvider(this.search)
  }

  loadNextPage () {
    // console.log(`loadNextPage`)
    this.nextPageFromProvider()
  }

  loadPrevPage () {
    // console.log(`loadPrevPage`)
    this.prevPageFromProvider()
  }
}

console.log('registering person lookup')
window.customElements.define('byu-person-lookup', ByuPersonLookup)

console.log('registering person lookup results')
window.customElements.define('byu-person-lookup-results', ByuPersonLookupResults)
