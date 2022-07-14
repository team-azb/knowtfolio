function handler(event) {
    var request = event.request;
    request.uri += '.json';
    return request;
}