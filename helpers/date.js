function timeToSeconds(time) {
    var arr = time.split(':'); // split it at the colons
    var seconds = (+arr[0]) * 60 * 60 + (+arr[1]) * 60 + (+arr[2]);
    return seconds;
}

module.exports = { timeToSeconds };