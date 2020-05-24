Code | Signal | Description
:---: | :---: | ---
`0` | `all` | Invalid format
||
`100` | `cJoinRoom` | Player in room
`101` | `cJoinRoom` | Empty room key
`102` | `cJoinRoom` | Empty username
`103` | `cJoinRoom` | Username is already used
`104` | `cJoinRoom` | Game have started, only logging in can be performed
`105` | `cJoinRoom` | Failed to join the room
||
`200` | `cLeaveRoom` | Player not in room
`201` | `cLeaveRoom` | Failed to leave room
||
`300` | `cStartGame` | Game ended
`301` | `cStartGame` | Game have already started
`302` | `cStartGame` | Not enough online users
`303` | `cStartGame` | Only host can start the game
`304` | `cStartGame` | You are not in the room
||
`400` | `cSpeakerReady` | Game ended
`401` | `cSpeakerReady` | Game state isn't `play`
`402` | `cSpeakerReady` | Game substate isn't `wait`
`403` | `cSpeakerReady` | Sender is not speaker
`404` | `cSpeakerReady` | Speaker is already ready
`405` | `cSpeakerReady` | You are not in the room
||
`500` | `cListenerReady` | Game ended
`501` | `cListenerReady` | Game state isn't `play`
`502` | `cListenerReady` | Game substate isn't `wait`
`503` | `cListenerReady` | Sender is not listener
`504` | `cListenerReady` | Listener is already ready
`505` | `cListenerReady` | You are not in the room
||
`600` | `cEndWordExplanation` | Game ended
`601` | `cEndWordExplanation` | Game state isn't `play`
`602` | `cEndWordExplanation` | Game substate isn't `explanation`
`603` | `cEndWordExplanation` | Sender is not speaker
`604` | `cEndWordExplanation` | Too early
`605` | `cEndWordExplanation` | You are not in the room
||
`700` | `cWordsEdited` | Game ended
`701` | `cWordsEdited` | Game state isn't `play`
`702` | `cWordsEdited` | Game substate isn't `edit`
`703` | `cWordsEdited` | Sender is not speaker
`704` | `cWordsEdited` | Incorrect word set
`705` | `cWordsEdited` | You are not in the room