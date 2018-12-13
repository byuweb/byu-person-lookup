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

import get from 'lodash.get'

const pickFirst = (acc, curr) => acc || curr

function parseLinks (links) {
  const next = get(links, 'persons__next.href')
  const prev = get(links, 'persons__prev.href')
  return {next, prev}
}

function parseAddresses (addresses) {
  if (addresses.metadata.validation_response.code !== 200) {
    return null
  }
  return addresses.values
      .filter(address => address.metadata.validation_response.code === 200)
      .reduce((all, c) => {
    const data = [
      get(c, 'address_line_1.value', ''),
      get(c, 'address_line_2.value', ''),
      get(c, 'address_line_3.value', ''),
      get(c, 'address_line_4.value', '')
    ].filter(l => l.trim().length > 0)
    const key = {
      'MAL': 'mailing',
      'RES': 'residential',
      'WRK': 'work',
      'PRM': 'permanent'
    }[c.address_type.value] || c.address_type.value
    return Object.assign({}, all, { [key]: data })
  }, {})
}

function parseBasic (basic) {
  const name = get(basic, 'name_lnf.value', '')
  const byuId = get(basic, 'byu_id.value', '')
  const netId = get(basic, 'net_id.value', '')
  const personId = get(basic, 'person_id.value', '')
  return {
    name,
    byuId,
    netId,
    personId
  }
}

function parseEmailAddresses (emailAddresses) {
  if (emailAddresses.metadata.validation_response.code !== 200) {
    return null
  }
  return emailAddresses.values.map(e => get(e, 'email_address.value', ''))
    .filter(e => !!e)
    .reduce(pickFirst, '')
}

function parsePhones (phones) {
  if (phones.metadata.validation_response.code !== 200) {
    return null
  }
  return phones.values.map(p => get(p, 'phone_number.value', ''))
    .filter(p => !!p)
    .reduce(pickFirst, '')
}

function parseEmployeeSummaries (employeeSummaries) {
  if (employeeSummaries.metadata.validation_response.code !== 200) {
    return null
  }
  return {
    employeeType: get(employeeSummaries, 'employee_type.value'),
    department: get(employeeSummaries, 'department.value'),
    jobTitle: get(employeeSummaries, 'job_title.description')
  }
}

function parseStudentSummaries (studentSummaries) {
  if (studentSummaries.metadata.validation_response.code !== 200) {
    return null
  }
  const studentStatus = get(studentSummaries, 'student_status.value')
  return { studentStatus }
}

function parsePerson (data) {
  return Object.assign({
    addresses: parseAddresses(data.addresses),
    email: parseEmailAddresses(data.email_addresses),
    phone: parsePhones(data.phones)
  },
  parseBasic(data.basic),
  parseEmployeeSummaries(data.employee_summary),
  parseStudentSummaries(data.student_summary)
  )
}

export default function (data) {
  const people = data.values.map(parsePerson)
  const {next, prev} = parseLinks(data.links)
  return {next, prev, people}
}
