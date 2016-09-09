"use strict"

const stamp = require("stampit")
const moment = require("moment")

const fmt = "YYYYMMDD[T]HHmmss[Z]"

const EventOrganizer = stamp()
.methods({
  toString() {
    if (this.email) {
      return `ORGANIZER;CN=${this.name}:mailto:${this.email}`
    }

    return `ORGANIZER:${this.name}`
  }
})

const EventAttendee = stamp()
.methods({
  toString() {
    const o = ["ATTENDEE"]

    if (this.type) {
      o.push(`CUTYPE=${this.type}`)
    }

    o.push(`ROLE=${this.role || "REQ-PARTICIPANT"}`)
    o.push(`PARTSTAT=${this.status || "NEEDS-ACTION"}`)

    if (this.name) {
      o.push(`CN=${this.name}`)
    }

    if (this.email) {
      return `${o.join(";")}:mailto:${this.email}`
    }

    return `${o.join(";")}:`
  }
})

const EventAlarm = stamp()
.props()
.methods({
  toString() {
    const o = [
      "BEGIN:VALARM",
      `TRIGGER:-PT${this.trigger}`,
      `ACTION:${this.action}`
    ]

    if (this.duration) {
      o.push(`DURATION:PT${this.duration}`)
    }

    if (this.repeat) {
      o.push(`REPEAT:${this.repeat}`)
    }

    if (this.description) {
      o.push(`DESCRIPTION:${this.description}`)
    }

    o.push("END:VALARM")

    return o.join("\r\n")
  }
})

const Event = stamp()
.props({ attendees: [] })
.methods({
  toString() {
    const o = [
      "BEGIN:VEVENT",
      `UID:${this.uid}`
    ]

    if (this.organizer) {
      o.push(EventOrganizer(this.organizer).toString())
    }

    if (this.start) {
      o.push(`DTSTART:${moment(this.start).utc().format(fmt)}`)
    }

    if (this.end) {
      o.push(`DTEND:${moment(this.start).utc().format(fmt)}`)
    }

    if (this.summary) {
      o.push(`SUMMARY:${this.summary}`)
    }

    if (this.attendees) {
      for (const at of this.attendees) {
        o.push(EventAttendee(at).toString())
      }
    }

    const description = this.url
        ? `${this.description || ""}\n\nURL: ${this.url}`.trim()
        : this.description

    if (description) {
      o.push(`DESCRIPTION:${description.replace(/\n/g, "\\n")}`)
    }

    if (this.url) {
      o.push(`URL:${this.url}`)
    }

    if (this.location) {
      o.push(`LOCATION:${this.location.replace(/,/g, "\\,")}`)
    }

    if (this.geo) {
      o.push(`GEO:${this.geo[0]};${this.geo[1]}`)
      o.push(`X-APPLE-STRUCTURED-LOCATION;VALUE=URI;X-APPLE-RADIUS=72;X-TITLE="${this.location || ""}":geo:${this.geo[0]},${this.geo[1]}`)
    }

    o.push(`DTSTAMP:${moment(this.timestamp).utc().format(fmt)}`)

    if (this.alarm) {
      o.push(EventAlarm(this.alarm).toString())
    } else {
      o.push("X-APPLE-TRAVEL-ADVISORY-BEHAVIOR:DISABLED")
      // Force on alarm to be set on iOS
      // o.push("BEGIN:VALARM\nTRIGGER;VALUE=DATE-TIME:19760401T005545Z\nX-APPLE-TRAVEL-DEFAULT-ALARM:TRUE\nX-APPLE-DEFAULT-ALARM:TRUE\nACTION:NONE\nEND:VALARM")
    }

    o.push("END:VEVENT")

    return o.join("\r\n")
  }
})

module.exports = Event
