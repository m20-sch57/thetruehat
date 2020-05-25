# HTTP server API
This document describes working process of main HTTP server and possible interactions with it.

## Common objects
TODO

## API
Mark `GET`/`POST` means that all following functions are requests by `HTTP` protocol with `GET`/`POST` method respectively.

All data is delivered in request body in `JSON` format to address `http://<document.domain>/api/<function name>`.

1. `GET` <a name="getRoomInfo">`getRoomInfo`</a> - function for getting room's info by the room's key.

    Request:

    - `key` - key of room which info is needed.

    Response:

    - `success (bool)` - is request successful. If room's key is invalid, `success` is `false`, else `success` is `true`.
    - `state (string)` - room's state. Possible values are:
        - `wait` - means that room isn't created, or the recruitment is going.
        - `play` - means that game is going. You can join only with some vacant name in the room.
        - `end` - game ended.
    - `playerList` - (Defined when `status` is `wait` or `play`.) List of players. Any player consists of:
      - `username (string)` - player's name.
      - `online (bool)` - is player online or not.
    - `host (string)` - (Defined when `status` is `wait` or `play`.) Room host's name.
    - `results (Array)` - (Defined when `status` is `wait` or `play`.) Descending list of records. Every record contains:
        - `username (string)` - player's name.
        - `scoreExplained (int)` - count of explained words.
        - `scoreGuessed (int)` - count of guessed words.

1. `GET` <a name="getFreeKey">`getFreeKey`</a> - function for getting vacant room's key. 

    Response:
    
    - `key (string)` - room's key