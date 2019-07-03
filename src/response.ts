export default class Response {
  public _head: any;
  public _body: any;

  static compose(head: any, body: any) {
    return new Response(head, body)
  }

  constructor(head: any, body: any) {
    this._head = head
    this._body = body
  }

  get head() {
    return this._head
  }

  get body() {
    return this._body
  }

  get length() {
    return this._head.length + this._body.length
  }
}
