import {Client} from "./Client.class.js";
import {User} from "./User.class.js";
import {Contact} from "./Contact.class.js";

const sentences = ["Be careful.", "Be careful driving.", "Can you translate this for me?", "Chicago is very different from Boston.", "Don't worry.", "Everyone knows it.", "Everything is ready.", "Excellent.", "From time to time.", "Good idea.", "He likes it very much.", "Help!", "He's coming soon.", "He's right.", "He's very annoying.", "He's very famous.", "How are you?", "How's work going?", "Hurry!", "I ate already.", "I can't hear you.", "I'd like to go for a walk.", "I don't know how to use it.", "I don't like him.", "I don't like it.", "I don't speak very well.", "I don't understand.", "I don't want it.", "I don't want that.", "I don't want to bother you.", "I feel good.", "If you need my help, please let me know.", "I get off of work at 6.", "I have a headache.", "I hope you and your wife have a nice trip.", "I know.", "I like her.", "I'll call you when I leave.", "I'll come back later.", "I'll pay.", "I'll take it.", "I'll take you to the bus stop.", "I lost my watch.", "I love you.", "I'm an American.", "I'm cleaning my room.", "I'm cold.", "I'm coming to pick you up."];

document.addEventListener("DOMContentLoaded", function() {
  M.Sidenav.init(document.querySelectorAll(".sidenav"), {});
  M.FloatingActionButton.init(document.querySelectorAll(".fixed-action-btn"), {});
  M.Modal.init(document.querySelectorAll(".modal"), {});
  M.Chips.init(document.querySelectorAll(".chips"), {});
  M.Tabs.init(document.querySelectorAll(".tabs")[0], {});
  M.updateTextFields();

});

window.escape = function(text) {
  let escaper = document.createElement("div");
  escaper.innerText = text;
  return escaper.innerHTML;
}


addEventListener("load", async function() {
  let client = await new Client();
  await client.init();

  let user = new User(client);
  await user.loadFromStorage();

  loginModalButton.addEventListener("click", async function() {
    if(!user.logined) {
      let email = document.getElementById("loginModalEmail").value;
      let password = document.getElementById("loginModalPassword").value;
      await user.login(email, password)

      document.getElementById("loginModalEmail").value = "";
      document.getElementById("loginModalPassword").value = "";
      document.getElementsByTagName("main")[0].style.display = "";

      let loginModalTemplate = document.getElementById("loginModalTemplate");
      let loginModalInstance = M.Modal.getInstance(loginModalTemplate);
      loginModalInstance.close();
      document.getElementById("userOverviewModalTemplate").innerHTML = user.replaceTemplate(document.getElementById("userOverviewModalTemplate").innerHTML);
      document.getElementById("userView").innerHTML = user.replaceTemplate(document.getElementById("userView").innerHTML);
    }else {
      M.toast({html: "Please logout first!"});
    }
  });

  registerModalButton.addEventListener("click", async function() {
    if(!user.logined) {
      let email = document.getElementById("registerModalEmail").value;
      let password1 = document.getElementById("registerModalPassword").value;
      let password2 = document.getElementById("registerSecondModalPassword").value;
      if(password1 != password2) {
        M.toast({html: "Repeat password is not the same then the password!"});
        return;
      }
      await user.register(email, password1)

      document.getElementById("registerModalEmail").value = "";
      document.getElementById("registerModalPassword").value = "";
      document.getElementById("registerSecondModalPassword").value = "";
      document.getElementsByTagName("main")[0].style.display = "";

      let loginModalTemplate = document.getElementById("loginModalTemplate");
      let loginModalInstance = M.Modal.getInstance(loginModalTemplate);
      loginModalInstance.close();

      document.getElementById("userOverviewModalTemplate").innerHTML = user.replaceTemplate(document.getElementById("userOverviewModalTemplate").innerHTML);
      document.getElementById("userView").innerHTML = user.replaceTemplate(document.getElementById("userView").innerHTML);
    }else {
      M.toast({html: "Please logout first!"});
    }
  });


  if(!user.logined) {
    let loginModalTemplate = document.getElementById("loginModalTemplate");
    let loginModalInstance = M.Modal.getInstance(loginModalTemplate);
    document.getElementsByTagName("main")[0].style.display = "none";
    loginModalInstance.open();
  }else {
    /*
      Init user by replace user in html data
    */
    document.getElementById("userView").innerHTML = user.replaceTemplate(document.getElementById("userView").innerHTML);
  }


  /*
    Set page changes
  */
  document.getElementById("sendModalText").style.height = "160px";


  document.getElementById("openSendModalButton").addEventListener("click", function() {
    user.handler.openSendModal();
  });
  document.getElementById("sendModalButton").addEventListener("click", async function() {
    let receiverAddress = escape(document.getElementById("sendModalReceiver").value);
    let receiver = new Contact({
      address: receiverAddress
    });
    let author = new Contact({
      name: "John Doe",
      address: "johndoe@secure-mail.agency"
    });

    let ccElement = document.getElementById("sendModalCC");
    let ccChips = M.Chips.getInstance(ccElement);
    let ccList = {};
    for(let id in ccChips.$chips) {
      let parsedId = parseInt(id);
      if(parsedId == parsedId) {
        let chip = ccChips.$chips[id];
        let cc = new Contact({
          address: escape(chip.innerText)
        });
        ccList[cc.address] = cc;
      }
    }

    let bccElement = document.getElementById("sendModalBCC");
    let bccChips = M.Chips.getInstance(bccElement);
    let bccList = {};
    for(let id in bccChips.$chips) {
      let parsedId = parseInt(id);
      if(parsedId == parsedId) {
        let chip = bccChips.$chips[id];
        let bcc = new Contact({
          address: escape(chip.innerText)
        });
        bccList[bcc.address] = bcc;
      }
    }

    let title = escape(document.getElementById("sendModalTitle").value);
    let message = escape(document.getElementById("sendModalText").value);

    let mail = user.handler.createMail({
      author: author,
      receiver: receiver,
      cc: ccList,
      bcc: bccList,
      title: title,
      message: message,
      tags: ["outbox"],
      readed: true
    });

    await mail.send();
    user.handler.regenerateDisplayedMails();
    user.handler.createAll();
    user.handler.generatePagination();

    M.toast({html: "the mail was sent successfully!"});
    return true;
  });

  for(let i=0; i<20; i++) {
    let author = new Contact({name: "John Doe", address: "john-doe@securemail.agency"});
    let receiver = new Contact({address: "CariCornish@gmail.com"});
    let mail = user.handler.createMail({
      id: i,
      author: author,
      receiver: receiver,
      title: generateSentences(),
      message: generateSentences(10),
      tags: ["inbox"],
      readed: true
    });
  }

  user.handler.regenerateDisplayedMails();
  user.handler.createAll();

  for(let i=20; i<320; i++) {
    let author = new Contact({name: "John Doe", address: "john-doe@securemail.agency"});
    let receiver = new Contact({address: "CariCornish@gmail.com"});
    let mail = user.handler.createMail({
      id: i,
      author: author,
      receiver: receiver,
      title: generateSentences(),
      message: generateSentences(10),
      tags: i > 50 ? ["inbox"] : ["outbox"],
      readed: i < 315
    });
  }

  user.handler.regenerateDisplayedMails();
  user.handler.generatePagination();

  let searchLock = false;
  for(let searchInput of document.getElementsByClassName("search")) {
    searchInput.addEventListener("keyup", function() {
      if(this.value.length >= 3 && !searchLock) {
        searchLock = true;
        user.handler.search(this.value);
        searchLock = false;
      }else if(this.value == "") {
        searchLock = true;
        user.handler.regenerateDisplayedMails();
        user.handler.createAll();
        user.handler.generatePagination();
        searchLock = false;
      }
    });
  }

  for(let filterElement of document.getElementsByClassName("filter")) {
    filterElement.addEventListener("click", function() {
      searchLock = true;
      user.handler.search(this.getAttribute("search"), JSON.parse(this.getAttribute("types")));
      searchLock = false;
    });
  }
});

function generateSentences(count = 1) {
  let sentencesData = "";
  for(let i=0; i<count; i++) {
    sentencesData = sentencesData + " " + sentences[Math.round(Math.random() * sentences.length)];
  }
  return sentencesData;
}
