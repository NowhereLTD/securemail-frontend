
export class Mail {
  constructor(client, handler, options) {
    this.client = client;
    this.handler = handler;
    this.id = options.id ? options.id : null;
    this.indexElement = options.indexElement ? options.indexElement : null;
    this.indexTemplate = document.getElementById("mailIndexTemplate");
    this.indexParent = document.getElementById("mailIndexParent");
    this.author = options.author ? options.author : "";
    this.receiver = options.receiver ? options.receiver : "";
    this.cc = options.cc ? options.cc : {};
    this.bcc = options.bcc ? options.bcc : {};
    this.title = options.title ? options.title : "";
    this.message = options.message ? options.message : "";
    this.tags = options.tags ? options.tags : [];
    this.readed = options.readed ? options.readed : false;
    this.createDate = options.date ? options.date : Date.now();
    this.internalId = null;
  }

  addCC(contact) {
    this.cc[contact.address] = contact;
  }

  addBCC(contact) {
    this.bcc[contact.address] = contact;
  }

  async send() {
    let msg = {
      cmd: "mail.send",
      receiver: this.receiver,
      cc: this.cc,
      bcc: this.bcc,
      title: this.title,
      message: this.message
    };

    this.client.send(msg);
  }

  async delete() {
    let msg = {
      cmd: "mail.delete",
      id: this.id
    };

    this.indexElement.remove();
  }

  createIndex() {
    this.indexElement = this.indexTemplate.cloneNode(true);
    this.indexElement.id = "";
    this.indexElement.style.display = "flex";
    if(!this.readed) {
      this.indexElement.classList.add("unread");
    }
    this.indexElement.innerHTML = this.replaceTemplate(this.indexElement.innerHTML);
    this.indexElement.addEventListener("click", function() {
      let mailModalTemplate = document.getElementById("mailModalTemplate");
      let showMailModalTemplate = mailModalTemplate.cloneNode(true);
      showMailModalTemplate.id = "mailModalTemplate" + this.internalId;
      showMailModalTemplate.innerHTML = this.replaceTemplate(showMailModalTemplate.innerHTML);
      document.body.appendChild(showMailModalTemplate);
      M.Modal.init(document.querySelectorAll(".modal"), {});
      M.Chips.init(document.querySelectorAll(".chips"), {});

      showMailModalTemplate.getElementsByClassName("reply-button")[0].addEventListener("click", function() {
        this.handler.openSendModal({
          receiver: this.author.address,
          title: "Re: " + this.title,
          text: "\n\n+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n\nRe to: " + this.message
        }, true);
      }.bind(this));
      let instance = M.Modal.getInstance(showMailModalTemplate);
      instance.open();

      this.readed = true;
      this.indexElement.classList.remove("unread");
    }.bind(this));
    this.indexParent.appendChild(this.indexElement);
  }

  replaceTemplate(template) {
    for(let key in this) {
      template = template.replaceAll("#" + key + "#", this.keyAsHTML(key));
    }
    return template;
  }

  keyAsHTML(key) {
    if(this[key] && this[key] != null && typeof(this[key]) != "function") {
      if(this[key].constructor.name === "Contact") {
        let tag = document.createElement("div");
        tag.classList.add("chip");
        tag.innerText = this[key].name ? this[key].name : this[key].address;
        return tag.outerHTML;
      }
      if(typeof(this[key]) === "object") {
        let tags = document.createElement("div");
        for(let id in this[key]) {
          if(this[key][id] && this[key][id].constructor.name == "Contact") {
            let tag = document.createElement("div");
            tag.classList.add("tag");
            tag.innerText = this[key][id].name;
            tags.appendChild(tag);
          }
        }
        return tags.outerHTML;
      }
      return escape(this[key]);
    }
    return "";
  }
}
