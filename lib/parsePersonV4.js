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
  return { next, prev }
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
    employeeStatus: get(employeeSummaries, 'employee_role.value'),
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

function pickAddress (addrs) {
  if (!addrs) return []
  if (addrs.mailing) return addrs.mailing
  if (addrs.residential) return addrs.mailing
  if (addrs.permanent) return addrs.permanent
  return []
}

function isEmployee (results) {
  if (results.employeeStatus) {
    return /ACT|LEV/.test(results.employeeStatus)
  }
  return results.department && results.jobTitle
}

function buildAdditionalInfo (results) {
  const workAddress = results.addresses.work ? results.addresses.work : []
  return [
    results.department,
    results.jobTitle,
    ...workAddress
  ]
}

function parsePerson (data) {
  const results = Object.assign(
    {
      addresses: parseAddresses(data.addresses),
      email: parseEmailAddresses(data.email_addresses),
      phone: parsePhones(data.phones)
    },
    parseBasic(data.basic),
    parseEmployeeSummaries(data.employee_summary),
    parseStudentSummaries(data.student_summary)
  )
  const address = pickAddress(results.addresses)
  const {
    email,
    phone,
    name,
    byuId,
    netId,
    employeeStatus,
    studentStatus
  } = results
  const showAdditionalInfo = isEmployee(results)
  const additionalInfo = showAdditionalInfo ? buildAdditionalInfo(results) : []
  return {
    address,
    email,
    phone,
    name,
    byuId,
    netId,
    employeeStatus,
    studentStatus,
    showAdditionalInfo,
    additionalInfo
  }
}

export default function (data) {
  const people = data.values.map(parsePerson)
  const { next, prev } = parseLinks(data.links)
  return { next, prev, people }
}
