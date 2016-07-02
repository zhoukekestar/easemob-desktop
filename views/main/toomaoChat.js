!(function(){

  /*
  **** CHAT MOCK ****
  namespace + 'chatOwner': {
    nickname: '',
    headimage: ''
  }
  namespace + 'chatSession':
  [
      {
          "id": "561c5c460cf2d633c032da5f",
          "nickname": "nick-abc",
          "headimage": "imageurl",
          "read": true,
          "dialog": [
              {
                  "data": "吃饭高峰",
                  "mine": false,
                  "time": 1445405475377
              },
              {
                  "data": "nandslf\n",
                  "mine": true,
                  "time": 1445405483603
              }
          ]
      },
      {
          "id": "561c5c460cf2d633c032da5e",
          "nickname": "nick-abc",
          "headimage": "imageurl"
          "read": false,
          "dialog": [
              {
                  "data": "123",
                  "mine": false,
                  "time": 1445407494560
              }
          ]
      }
  ]

  */


  /* save message & save & get */
  var namespace   = 'hxchat_',
      storage     = window.sessionStorage,
      // Chat Session List.
      chatSession = storage[namespace + 'chatSession'] ? JSON.parse(storage[namespace + 'chatSession']) : [],
      // Current Session.
      session,
      // Dialog template.
      tmplDialog,
      // Session template.
      tmplSession,
      // Owner
      owner;

  var findSessionByID = function(id) {

    var session = null;
    for (var i = 0, max = chatSession.length; i < max; i++) {
      if (chatSession[i].id === id) {
        session = chatSession[i];
        return session;
      }
    }
    return session;
  }

  var updateStorage = function() {
    storage[namespace + 'chatSession'] = JSON.stringify(chatSession);
    tmplSession._updateBy({list:chatSession});
  }

  var showDialog = function() {
    try {
      // remove notify
      // updateSessionNotify(session);

      // update dialog
      tmplDialog._updateBy({session: session, owner: owner});

      // show dialog && scroll to bottom
      var holder = document.querySelector(tmplDialog.getAttribute('data-holder'))
      holder.classList.add('show');
      holder.querySelector('.dialog-list').scrollTop = Number.MAX_VALUE;
    } catch (e) {
      console.log(e);
    }
  }




  var save = function(id, msg, nickname, headimage, read) {


    var session = findSessionByID(id)
    // push current msg to dialog.
    // Update session nickname & headimage
    if (session) {

      session['dialog'].push(msg);
      session.nickname = nickname;
      session.headimage = headimage;
      session.read = read;

    // New session and init with first msg as dialog is empty.
    } else {

      session = { id: id, read: read, nickname: nickname, headimage: headimage, dialog: [msg] };
      chatSession.push(session);
    }

    // Update Storage.
    updateStorage();
    return session;
  }

  /* init function */
  var init = function () {
    var toomaoChat  = document.querySelector('[data-role="toomaoChat"]');
    if (!toomaoChat) return;

    var config      = toomaoChat.getAttribute('data-config'),
        config      = JSON.parse(config.replace(/'/g, '"')),

        user        = config.user,
        password    = config.password,
        shopId      = config.shopId,
        nickname    = config.nickname,
        headimage   = config.headimage,

        conn        = new Easemob.im.Connection();

    // Set owner
    owner = {};
    owner.nickname = nickname;
    owner.headimage = headimage;
    owner.shopId = shopId;

    // Get tmplate.
    tmplSession = config.tmplSession;
    tmplDialog  = config.tmplDialog;
    // Convert string to object.
    typeof tmplSession === 'string' && (tmplSession = document.querySelector(tmplSession));
    typeof tmplDialog  === 'string' && (tmplDialog  = document.querySelector(tmplDialog ));

    // Init session list.
    updateStorage();

    conn.init({
      https: true,
      onOpened : function() {
        console.log("成功登录");
        conn.setPresence();
      },
      onTextMessage: function(msg) {

        console.log(msg)

        try {

          // If received message is current session. Update dialog.
          // If not, just receive message.
          if (session && msg.from === session.id) {

            // Save message & set read true
            session = save(msg.from, {
              data: msg.data,
              mine: false,
              time: new Date().getTime()
            }, msg.ext[msg.from + 'name'], msg.ext[msg.from + 'img'], true);

            updateStorage();
            showDialog();
          } else {

            // Save message & set read false
            save(msg.from, {
              data: msg.data,
              mine: false,
              time: new Date().getTime()
            }, msg.ext[msg.from + 'name'], msg.ext[msg.from + 'img'], false);

            updateStorage();
          }
        } catch (e) {
          console.log(e);
        }

      },
      onEmotionMessage : function(msg) {
        alert(msg)
        console.log(msg)
      },
      onPictureMessage : function(msg) {
        alert(msg)
        console.log(msg)
      },
      onAudioMessage : function(msg) {
        alert(msg)
        console.log(msg)
      }
    });
    conn.open({

      user : user,
      pwd : password,
      appKey : 'lanmal#toomao'
    });


    // Extend properties.
    toomaoChat['_connection'] = conn;
    toomaoChat['_showDialog'] = function (id) {
      session = findSessionByID(id);
      session.read = true;
      updateStorage();
      showDialog();
    }
    toomaoChat['_sendTextMessage'] = function (to, msg, tonickname, toheadimage) {

      if (msg.length === 0) return;

      //
      //
      // *****
      // *****
      // *****
      session = save(to, {
        data: msg,
        mine: true,
        time: new Date().getTime()
      }, tonickname, toheadimage, true);

      showDialog();


      // Send msg.
      var sendMsg = {
        to: to,
        msg: msg,
        ext: {}
      };

      // my info
      sendMsg.ext[user + 'img'] = headimage;
      sendMsg.ext[user + 'name'] = nickname;

      // to info
      sendMsg.ext[to + 'img'] = toheadimage;
      sendMsg.ext[to + 'name'] = tonickname;

      // shop info
      sendMsg.ext['shopId'] = shopId;

      conn.sendTextMessage(sendMsg)
    }

    toomaoChat['_toSession'] = function (to, nickname, headimage) {

      // toomaoChat._toSession('zkk1', 'nick', 'http://www.baidu.com')
      //
      session = findSessionByID(to)

      // New session and init with first msg as dialog is empty.
      //
      //
      // *****
      // *****
      // *****
      if (!session) {
        session = {
          id: to,
          nickname: nickname,
          headimage: headimage,
          read: true,
          dialog: []
        };
        chatSession.push(session)
      }
      updateStorage();
      showDialog();
    }
  }



  /* module listener */
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    init()
  } else {
    document.addEventListener('readystatechange', function(e) {
      if (document.readyState === 'interactive') {
        init();
      }
    })
  }

})();
