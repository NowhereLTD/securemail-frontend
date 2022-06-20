import {Mail} from "./Mail.class.js";

export class MailHandler {
  constructor(client) {
    this.client = client
    this.mails = {};
    this.timedMails = [];
    this.mailCounter = 0;

    this.indexParent = document.getElementById("mailIndexParent");
    this.paginationParent = document.getElementsByClassName("pagination")[0];
    this.displayedMails = [];
    this.maxDisplayedMails = 10;
    this.page = 0;
    this.mailDisplayCounter = 0;
  }

  createMail(options) {
    this.mailCounter++;
    let mail = new Mail(this.client, this, options);
    this.mails[this.mailCounter] = mail;
    mail.internalId = this.mailCounter;
    if(this.timedMails[mail.createDate] == null) {
      this.timedMails[mail.createDate] = [];
    }
    this.timedMails[mail.createDate].push(mail);
    return this.mails[this.mailCounter];
  }

  async deleteMail(id) {
    await this.mails[id].delete();
    delete(this.mails[id]);
    return true;
  }

  search(text, options = {
    title: true,
    message: true,
    author: true,
    receiver: true,
    tags: true
  }) {
    this.displayedMails = [];
    this.mailDisplayCounter = 0;
    this.indexParent.innerHTML = "";
    for(let id in this.timedMails) {
      for(let mailId in this.timedMails[id]) {
        let mail = this.timedMails[id][mailId];
        text = text.toLowerCase();
        if(
          options.title && mail.title.toLowerCase().match(text) ||
          options.message && mail.message.toLowerCase().match(text) ||
          options.author && mail.author.name.toLowerCase().match(text) ||
          options.author && mail.author.address.toLowerCase().match(text) ||
          options.receiver && mail.receiver.name.toLowerCase().match(text) ||
          options.receiver && mail.receiver.address.toLowerCase().match(text) ||
          options.tags && mail.tags.find(tag => tag.toLowerCase().match(text))
        ) {
          this.mailDisplayCounter++;
          this.displayedMails.unshift(mail);
        }
      }
    }

    this.createAll();
    this.generatePagination();
    return true;
  }

  regenerateDisplayedMails() {
    this.displayedMails = [];
    this.mailDisplayCounter = 0;
    for(let id in this.timedMails) {
      for(let mailId in this.timedMails[id]) {
        this.mailDisplayCounter++;
        this.displayedMails.unshift(this.timedMails[id][mailId]);
      }
    }
  }

  createAll() {
    this.indexParent.innerHTML = "";
    for(let i=0; i<this.maxDisplayedMails; i++) {
      let id = this.maxDisplayedMails * this.page + i;
      let mail = this.displayedMails[id];
      if(mail != null) {
        mail.createIndex();
      }
    }
    return true;
  }

  generatePagination() {
    this.paginationParent.innerHTML = "";
    let allPages = Math.ceil(this.mailDisplayCounter / this.maxDisplayedMails);
    if(this.page > allPages) {
      this.page = allPages;
    }

    if(this.page > 6) {
      let backward = this.createPaginationElement("<a><i class='material-icons'>chevron_left</i></a>");
      this.paginationParent.appendChild(backward);
      backward.addEventListener("click", function() {
        this.changeToPage(this.page-5);
      }.bind(this));
    }else {
      let backward = this.createPaginationElement("<a><i class='material-icons'>chevron_left</i></a>", {enabled: false});
      this.paginationParent.appendChild(backward);
    }

    for(let i=this.page-5; i<allPages && i<this.page+10; i++) {
      if(i > 0) {
        if(i == this.page+1) {
          let element = this.createPaginationElement("<a>" + i + "</a>", {active: true});
          this.paginationParent.appendChild(element);
        }else {
          let element = this.createPaginationElement("<a>" + i + "</a>");
          element.addEventListener("click", function() {
            this.changeToPage(i-1);
          }.bind(this));
          this.paginationParent.appendChild(element);
        }
      }
    }

    if(this.page < allPages - 6) {
      let forward = this.createPaginationElement("<a><i class='material-icons'>chevron_right</i></a>");
      this.paginationParent.appendChild(forward);
      forward.addEventListener("click", function() {
        this.changeToPage(this.page+5);
      }.bind(this));
    }else {
      let forward = this.createPaginationElement("<a><i class='material-icons'>chevron_right</i></a>", {enabled: false});
      this.paginationParent.appendChild(forward);
    }
  }

  createPaginationElement(inner, options = {enabled: true, active: false}) {
    let element = document.createElement("li");
    element.innerHTML = inner;
    if(options.active) {
      element.classList.add("active");
    }else if(options.enabled) {
      element.classList.add("waves-effect", "waves-light");
    }else {
      element.classList.add("disabled");
    }
    return element;
  }

  changeToPage(id) {
    this.page = id;
    this.generatePagination();
    this.createAll();
  }


  /* Open Modals */
  openSendModal(options = {}, active = false) {
    let sendModal = document.getElementById("sendModal");
    let sendModalInstance = M.Modal.getInstance(sendModal);
    document.getElementById("sendModalReceiver").value = options.receiver ? options.receiver : "";
    document.getElementById("sendModalCC").value = options.cc ? options.cc : "";
    document.getElementById("sendModalBCC").value = options.bcc ? options.bcc : "";
    document.getElementById("sendModalTitle").value = options.title ? options.title : "";
    document.getElementById("sendModalText").value = options.text ? options.text : "";
    for(let tag of sendModal.getElementsByTagName("label")) {
      if(active) {
        tag.classList.add("active");
      }else {
        tag.classList.remove("active");
      }
    }
    sendModalInstance.open();
  }
}
