---
title: How to set up CRM lifecycle stages for a B2B services company
excerpt: Six stages, one owner each, and the workflows that move contacts between them without anyone editing a property by hand.
category: guides
tags: [CRM, Reporting]
date: 2026-11-18
featured: true
tools: [n8n, whatconverts]
---

## Why lifecycle stages break

Most CRMs we audit have lifecycle stages that nobody trusts. Contacts sit in Lead for months, sales skips stages by hand, and the funnel report shows numbers that don't match the pipeline.

The fix is less about CRM settings and more about agreeing what each stage means, who moves a contact into it, and which event triggers the move.

## The six stages we use

For service businesses we use six stages. Each one has a single owner and a single entry rule.

1. **Subscriber** Opted in to content. Owner: marketing.
2. **Lead** Left contact details on a form or a call. Owner: marketing.
3. **MQL** Matches the ideal customer profile and showed buying intent. Owner: marketing.
4. **SQL** Accepted by sales after a first conversation. Owner: sales.
5. **Opportunity** A deal exists with an amount and a close date. Owner: sales.
6. **Customer** Deal closed won. Owner: account team.

## Automating the hand-offs

Every stage change should happen in a workflow, not by hand. MQL is set by a score threshold plus a fit check; SQL is set when sales logs the outcome of the first meeting.

Lock the lifecycle stage field for everyone except admins. If a contact needs to move backwards, it happens through the deal stage, not by editing the contact.

If your CRM's own workflows can't do this on your plan, an automation tool such as n8n can listen for the event (a form, a meeting logged, a deal created) and update the stage for you.

## Reporting on stage velocity

Once stages are reliable, report on time in stage, not only on counts. A rising median time from MQL to SQL is the earliest sign that hand-offs are slipping.

Make sure every Lead carries its source. Calls and chats are the leads most often lost here, which is where call tracking earns its place.

## Tools for the job

Your CRM does most of the work above. Add an automation layer only for the moves it can't make on its own, and a tracking tool if a large share of your leads arrive by phone.
