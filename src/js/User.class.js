import {MailHandler} from "./MailHandler.class.js";

export class User {
  constructor(client) {
    this.client = client;
    this.handler = new MailHandler(client);

    this.username = "JohnDoe";
    this.email = "johndoe@secure-mail.agency";
    this.profileImage = "./assets/images/profile.png";
    this.password = "";
    this.privateKey = "";
    this.publicKey = "";
    this.logined = false;
  }

  replaceTemplate(template) {
    for(let key in this) {
      template = template.replaceAll("#" + key + "#", this.keyAsHTML(key));
    }
    return template;
  }

  keyAsHTML(key) {
    if(this[key] && this[key] != null && typeof(this[key]) != "function") {
      return escape(this[key]);
    }
    return "";
  }

  /* Load settings from local storage */
  loadFromStorage() {
    this.username = localStorage.getItem("client.username") ? localStorage.getItem("client.username") : "JohnDoe";
    this.email = localStorage.getItem("client.email") ? localStorage.getItem("client.email") : "johndoe@secure-mail.agency";
    this.password = localStorage.getItem("client.password") ? localStorage.getItem("client.password") : "";
    this.privateKey = localStorage.getItem("client.privateKey") ? localStorage.getItem("client.privateKey") : "";
    this.publicKey = localStorage.getItem("client.publicKey") ? localStorage.getItem("client.publicKey") : "";
    this.logined = localStorage.getItem("client.logined") ? localStorage.getItem("client.logined") : false;
  }

  /* Save client settings in local storage */
  saveInStorage() {
    localStorage.setItem("client.username", this.username);
    localStorage.setItem("client.email", this.email);
    localStorage.setItem("client.password", this.password);
    localStorage.setItem("client.privateKey", this.privateKey);
    localStorage.setItem("client.publicKey", this.publicKey);
    localStorage.setItem("client.logined", this.logined);
  }

  async login(email, password) {
    /* Send server request */
    /* Get the crypted rs key from server */
    this.email = email;
    this.password = password;

    this.logined = true;
    this.saveInStorage();

    return true;
  }

  async register(email, password) {
    this.email = email;
    this.password = password;

    return true;
  }
}
