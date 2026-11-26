---
title: UTM conventions that survive a CRM migration
excerpt: A naming scheme for source, medium and campaign that still makes sense two tools later.
category: guides
tags: [Reporting, Tracking]
date: 2026-10-21
tools: [whatconverts]
---

## The problem with ad-hoc UTMs

UTM parameters are usually added by whoever launches the campaign, on the day it launches. A year later the CRM holds "facebook", "Facebook", "fb" and "meta" as four different sources, and nobody can say which channel brought last quarter's customers.

The problem gets worse when you change CRM: the migration copies the mess across, and the new reports inherit it.

## Five rules we use

1. **Lowercase** Every value is lowercase. Most tools treat case as different values.
2. **Fixed source list** Source is the platform: google, meta, linkedin, newsletter. Nothing else.
3. **Fixed medium list** Medium is the type of traffic: cpc, paid-social, email, organic-social, referral.
4. **Dated campaigns** Campaign names start with the year and month, such as 2026-11-webinar-crm.
5. **One owner** One person approves new source and medium values. Everyone else picks from the list.

## Store the first touch, not only the last

Save the UTMs a visitor arrived with on their first visit and send them with every form, not only the ones from the visit when they converted. That first touch is the value you'll want when you ask which channel brings customers.

## Calls and chats

Forms carry UTMs easily. Calls and chats don't, which is why they often show up as "direct" or with no source at all. A call-tracking tool can tie each call back to the campaign that produced it.

## Before you migrate

Export every distinct source, medium and campaign value from the old CRM, map each one to the new convention, and clean the data before the import, not after. It takes an afternoon and saves months of unreliable reports.
