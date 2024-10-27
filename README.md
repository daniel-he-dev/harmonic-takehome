# Welcome to the Harmonic Fullstack Jam! :D

Please familiarize yourself with any docs provided to you before continuing.

In this repo, you'll find 2 deployable services:

1. Backend - dockerized deployable that will spin up a Python backend with FastAPI, Postgres SQL DB and some seeded data.
2. Frontend - locally deployable app via Vite with TypeScript/React

Please refer to the individual READMEs in the respective repos to get started!

Enjoy :D

# Written Reflection

## Assumptions

- Two different patterns for copying company references between collections. By checkbox selection, the copying will be reasonably fast. By complete collection copy, these can be arbitrarily large and long-running (the example provided presents a collection of 50000, which throttled to 100ms per is over an hour).
- The user may navigate away from the page while long copying actions are still taking place.
- A company can only exist in a collection at most once. Bulk copying actions will be assumed idempotent. Duplicate company references will ignored and not re-copied. Bulk copies will be like "merging" all companies in collection A into collection B.
- This is not a highly technical nor critical user action. Users do not need fine-grained control over resolving duplicate entries, any complex selection mechanisms, or sub-second feedback.

## Solution

- UX: I think it would be cleaner to present the choice to add companies to other list only after the first row selection has been made. This makes for a cleaner default browsing experience. The "Add all" option is displayed alongside the regular selection copy as a discoverable alternative CTA.
- Backend: An important challenge to managing copy actions that could take >1 hour is reliability. This type of work cannot be managed on the client side. I used a Celery task queue to manage these long-running queries to the postgres db and exposed an API to check on task statuses, in addition the two new endpoints for copying single company references and bulk copying entire collections.
- Frontend: Upon company selection, copy buttons are displayed, with popover menus used to select the target collections. If a regular selection copy is started, an Alert immediately notifies the user of successful copying. If a bulk collection copy is started, a progress bar tracking the status of the long-running Celery task is displayed until the task is finished.

## Next Steps

- If bulk collection copying speed truly cannot be sped-up, more granular percentage progress metadata can be exposed, to give the progress more meaningful updates.
- Currently, the user would lose track of active copy tasks being tracked if they navigated away or reloaded the client. We could instead expose an endpoint to fetch all active or queued copy tasks to prevent this.
- Because of the low performance requirements, I just polled for task status on an interval to obtain status updates. This is quite simple and suitable for our needs. If we wanted faster progress updates, we could establish a Websocket connection for real-time updates, but this stateful connection is more memory intensive for our servers and may not be that useful.
- Also because of low criticality, we don't fuss the user over duplicate entries, and call any duplicate entry a "success" as the intent of copying a company 1 from collection A to collection B is purely for company 1 to exist in collection B. If that is already true, that will be considered a success. We can, however, provide visual feedback as to which rows in a collection are new. This can be done by providing an option to the user "Go to collection" after a successful copy and possibly highlighting new rows.

## Conclusion

When technical limitations are ironclad in the near-term, there are myriad ways to set the right expectations with users to reduce friction and confusion. I would be glad to discuss other designs given different interpretations of the requirements.
