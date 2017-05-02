class Response {

  static compose (head, body) {
    return new Response(head, body)
  }

  constructor (head, body) {
    this._head = head
    this._body = body
  }

  get head () {
    return this._head
  }

  get body () {
    return this._body
  }

  get length () {
    return this._head.length + this._body.length
  }

}

module.exports = Response
