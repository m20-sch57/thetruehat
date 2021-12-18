import {random} from "lodash";

export const io = {}

io.connect = function (uri, {path}) {
    return new MockSocket(uri, path)
}

class MockSocket {
    constructor(uri, path) {
        this.id = random().toString()
        this.uri = uri
        this.path = path
        this.eventCallbacks = {}
        console.log(`New socket: id = ${this.id}, ri = ${uri}, path = ${path}`)
    }

    on(event, callback) {
        this.eventCallbacks[event] = callback
        console.log(`Socket ${this.id}: new event: ${event}`)
    }

    emit(event, data) {
        console.log(`Socket ${this.id}: emitted event ${event} with data ${data}`)
    }
}