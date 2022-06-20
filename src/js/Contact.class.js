
export class Contact {
  constructor(options) {
    this.name = options.name ? options.name : "";
    this.address = options.address ? options.address : "";
    this.publicKey = options.publicKey ? options.publicKey : "";
  }
}
