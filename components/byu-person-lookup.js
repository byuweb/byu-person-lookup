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

import { LitElement, html, css, svg } from '@polymer/lit-element'
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch'
import faSpinner from '@fortawesome/fontawesome-free-solid/faSpinner'
import faBan from '@fortawesome/fontawesome-free-solid/faBan'
import faExclamationTriangle from '@fortawesome/fontawesome-free-solid/faExclamationTriangle'
import ByuPersonLookupResults from './byu-person-lookup-results'

class ByuPersonLookup extends LitElement {
  static get properties () {
    return {
      context: { type: String, reflect: true },
      compact: { type: Boolean },
      noAutoselect: { type: Boolean, attribute: 'no-autoselect' }
    }
  }

  static get styles () {
    return [
      css` :host { display: inline-block; } :host([hidden]) { display: none; } `,
      css` div { position: relative; padding: 1rem; } `,
      css` .small-padding { padding: 0.25rem; } `,
      css` label { position: absolute; left: 1rem; top: -0.1rem; font-size: 0.7rem; color: #999; } `,
      css` input[type="search"] {
        padding: 0.3rem;
        border: thin solid #666666;
        border-radius: 0.2rem;
        margin-right: 0.2rem;
        min-width: 15rem;
        font-size: 1.1rem;
      } `,
      css` button {
        padding: 0.3rem 1rem;
        border: thin solid #666666;
        border-radius: 0.05rem;
        background-color: #0057B8;
        color: white;
        cursor: pointer;
        font-size: 1.1rem;
      } `,
      css` button:hover, button:active { box-shadow: inset 0 0 0.2rem rgba(255, 255, 255, 0.5); background-color: #5199E1; } `,
      css` .spin { animation: spin 1500ms linear infinite; } `,
      css` .container { position: relative; font-size: 1.1rem; } `,
      css` .hidden { display: none; } `,
      css` .error-display {
        background-color: rgba(179, 4, 26, 0.8);
        color: white;
        position: absolute;
        top: 3.7rem;
        box-shadow: 0rem 0.1rem 0.1rem rgba(0, 0, 0, 0.2);
      } `,
      css` .error-handle { position: absolute; top: -10px; } `,
      css` @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } .search-btn-label { display: none; } `,
      css` .compact { display: flex; padding: 0; }`,
      css` .compact > label { position: static; font-size: 0.9rem; align-self: center; margin: 0rem 0.2rem; } `,
      css` .compact > input[type="search"] { border-radius: 0; margin-right: 0; min-width: 10rem; font-size: 0.9rem; }`,
      css` .compact > button { border-radius: 0; font-size: 0.9rem; }`,
      css` .compact > button .search-btn-label { display: none; } `,
      css` @media not speech { .sr-only { display: none; } } `,
      css` @media only screen and (min-width: 470px) { .search-btn-label { display: inline-block; } } `
    ]
  }

  constructor () {
    super()
    this.context = 'directory'
    this.compact = false
    this.noAutoselect = false
    this.errorMessage = ''
    this.errorType = ''
    this.results = null
    this.search = ''
    this.searchPending = false
  }

  render () {
    const {
      context,
      results,
      search
    } = this
    // console.log(`search=${search}, context=${context}`)
    const [, , , , searchIconPath] = faSearch.icon
    const [, , , , spinIconPath] = faSpinner.icon
    const [, , , , banIconPath] = faBan.icon
    const [, , , , warnIconPath] = faExclamationTriangle.icon

    return html`
    <div class=${this.compact ? 'compact container' : 'container'}>
      <label for="search">
        <slot>
          No Data Provider
        </slot>
      </label>
      <input
        id="search"
        type="search"
        size="12"
        .value=${search}
        @input=${this.searchChange}
        @search=${this.doSearch}
      >
      <button @click=${this.doSearch}>
        <svg class=${this.searchPending ? 'spin' : ''} alt="Search" width="14" height="14" viewBox="0 0 512 512">
          ${svg`
            <path
              d=${this.searchPending ? spinIconPath : searchIconPath}
              fill="white"
            />
          `}
        </svg>
        <span class="search-btn-label">
          ${this.searchPending ? 'Searching' : 'Search'}
        </span>
      </button>
      <slot name="error">
        <div class=${this.errorType === '' ? 'hidden' : 'error-display'}>
          <svg class="error-handle" width="10" height="10" viewBox="0 0 100 100">
            <path d="M50,0 L100,100 L0,100 Z" fill="rgba(179, 4, 26, 0.8)">
          </svg>
          <svg alt=${this.errorType} width="14" height="14" viewBox="0 0 578 512">
          ${svg`
            <path
              d=${this.errorType === 'No Results' ? banIconPath : warnIconPath}
              fill="white"
            />
          `}
          </svg>
          ${this.errorType === 'No Results' ? this.errorMessage : html`
          Oops! Something went wrong. <div class="small-padding"><small>${this.errorMessage}</small></div>
          `}
        </div>
      </slot>
    </div>
    <slot name="results">
      <byu-person-lookup-results
        class=${results && results.length > 0 ? '' : 'hidden'}
        .results=${results}
        .context=${context}
        .searchPending=${this.searchPending}
        .noAutoselect=${this.noAutoselect}
        @byu-lookup-results-close=${this.closeResults}
        @byu-lookup-next-page=${this.loadNextPage}
        @byu-lookup-prev-page=${this.loadPrevPage}
      ></byu-person-lookup-results>
    </slot>
    `
  }

  closeResults () {
    this.results = null
    this.requestUpdate()
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
    this.searchPending = false
    if (e.detail.length === 0 && this.results.length === 0) {
      this.errorMessage = 'Hmmm, we couldn\'t find anyone.'
      this.errorType = 'No Results'
      this.requestUpdate()
      return
    }
    this.results = this.results.concat(e.detail)
    this.requestUpdate()
  }

  searchError (e) {
    e.stopPropagation() // Don't trigger any other lookup components
    this.searchPending = false
    // window.alert(e.detail)
    this.errorMessage = e.detail
    this.errorType = 'Service Error'
    console.error('search error:\n', e.detail)
    this.requestUpdate()
  }

  searchBegun (e) {
    e.stopPropagation() // Don't trigger any other lookup components
    this.searchPending = true
    this.requestUpdate()
  }

  searchChange (e) {
    this.errorMessage = ''
    this.errorType = ''
    this.search = e.target.value
    // console.log(`search=${this.search}`)
    if (this.__lookupProvider) {
      const search = this.search
      this.__lookupProvider.search = search
    }
    this.requestUpdate()
  }

  doSearch () {
    // console.log(`doSearch:search: ${this.search}`)
    this.errorMessage = ''
    this.errorType = ''
    this.results = []
    if (this.search.length > 0) {
      this.fetchFromProvider(this.search)
    }
    this.requestUpdate()
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
