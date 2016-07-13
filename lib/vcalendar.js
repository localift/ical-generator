"use strict"

const stamp = require("stampit")
const Event = require("./vevent")

const Calendar = stamp()
.props({ events: [], language: "EN" })
.methods({
  event(ev) {
    this.events.push(Event(ev))

    return this
  },

  toString() {
    let o = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      `PRODID:-//${this.company}//${this.product}//${this.language}`
    ]

    if (this.name) {
      o.push(`X-WR-CALNAME:${this.name}`)
    }

    if (this.method) {
      o.push(`METHOD:${this.method}`)
    }

    if (this.ttl) {
      o.push(`X-PUBLISHED-TTL:${this.ttl}`)
    }

    for (const ev of this.events) {
      o.push(ev.toString())
    }

    o.push("END:VCALENDAR")

    return o.join("\r\n")
  }
})

module.exports = Calendar
