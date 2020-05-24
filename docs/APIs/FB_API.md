# Feedback server API
This document describes working process of feedback (then FB) server and possible interactions with it.

## Common objects
FB server gets FB from clients and writes it in a file.

### FB
Feedback is an object that user sends. It consists of:
- `message` - user's message.
- `SID` - user's Socket ID.
- `userLog`  - client's application logs. 
- `version` - client version.
- `hash` - client hash.

Also, there are **optional** fields for web client:
- `appName` - content of `navigator.appName`.
- `appVersion` - content of `navigator.appVersion`.
- `cookieEnabled` - content of `navigator.cookieEnabled`.
- `platform` - content of `navigator.platform`.
- `product` - content of `navigator.product`.
- `userAgent` - content of `navigator.userAgent`.

## API
All requests must be sent by HTTP method `POST` with only `JSON` containing FB object.