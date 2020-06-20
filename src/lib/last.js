Array.prototype.last = function() {
    console.assert(this.length >= 1,
        "Attempt to get last element of empty array");
    return this[this.length - 1];
}
