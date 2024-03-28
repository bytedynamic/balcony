// ==UserScript==
// @name        Fund Monitor
// @namespace   Violentmonkey Scripts
// @match       https://datafanclub.github.io/fundmonitor/
// @downloadURL https://ghproxy.com/https://github.com/datafanclub/fundmonitor/raw/main/fundmonitor.js
// @grant       GM_xmlhttpRequest
// @grant       GM_setValue
// @grant       GM_getValue
// @version     1.1
// @author      -
// @description 2023/9/3 13:17:37
// ==/UserScript==
(function e() {
  "use strict";
  var cdnum = GM_getValue("countdownnum");
  if (!cdnum) {
    GM_setValue("countdownnum", "5");
  }
  var button1 = document.getElementById("xiugai");
  var button2 = document.getElementById("countDownNum1");
  var button3 = document.getElementById("huoqu");
  var button4 = document.getElementById("tingzhi");
  var bg = document.getElementById("biaoge");
  document.getElementById("shuru").value = GM_getValue("ids");
  button1.addEventListener("click", modifiedIDs);
  button2.addEventListener("click", modifiedCountDownNum);
  button3.addEventListener("click", clickStart);
  button4.addEventListener("click", clickStop);
  window.intervalId;
})();

function modifiedIDs() {
  var ids = document.getElementById("shuru").value;
  GM_setValue("ids", ids);
  alert("监控代码更新成功！");
  document.getElementById("shuru").value = GM_getValue("ids");
}

function modifiedCountDownNum() {
  var cdn = window.prompt("请设置刷新间隔（分钟）");
  GM_setValue("countdownnum", cdn);
}

//按照估值涨跌幅降序序排列
function up(x, y) {
  return y.gszzl - x.gszzl;
}

function clickStart() {
  mainFunction();
  let countdownTime = GM_getValue("countdownnum") * 60;
  let countdown = function () {
    if (countdownTime <= 0) {
      document.getElementById("minute").innerText = "0";
      document.getElementById("second").innerText = "0";
      countdownTime = GM_getValue("countdownnum") * 60;
      mainFunction();
    } else {
      document.getElementById("minute").innerText = parseInt(
        countdownTime / 60
      );
      document.getElementById("second").innerText = parseInt(
        countdownTime % 60
      );
      countdownTime--;
    }
  };
  window.intervalId = setInterval(countdown, 1000);
}

function clickStop() {
  clearInterval(window.intervalId);
  document.getElementById("minute").innerText = GM_getValue("countdownnum");
  document.getElementById("second").innerText = "0";
  mainFunction();
}

function mainFunction() {
  var a = "https://fundgz.1234567.com.cn/js/";
  var valuenames = ["fundcode", "name", "gsz", "gszzl", "gztime"];
  var FUND_listHtml =
    '<table align="center"><thead><tr align="center"><th>基金代码</th><th>基金名称</th><th class="text-right">当前估值</th><th class="text-center">涨跌幅</th><th class="text-right">更新时间</th></tr></thead><tbody>';
  var promiseArray = [];
  var ids = GM_getValue("ids").split(",");
  for (var i = 0, len = ids.length; i < len; i++) {
    var url = a + ids[i].trim() + ".js?rt=" + new Date().getTime();
    console.log(url);
    promiseArray.push(
      new Promise(function (resolve, reject) {
        GM_xmlhttpRequest({
          method: "GET",
          url: url,
          headers: { "Content-Type": "application/json;charset=UTF-8" },
          onload: function (response) {
            txt = response.responseText;
            if (txt.length > 10) {
              var startIndex = txt.length;
              var endIndex = txt.length - 2;
              var jtxt = JSON.parse(txt.substring(8, endIndex));
              resolve(jtxt);
            } else {
              resolve(0);
            }
          },
          onerror: function (response) {
            reject("请求失败");
          },
        });
      })
    );
  }
  Promise.all(promiseArray)
    .then(function (res) {
      res.sort(up);
      for (var i = 0; i < res.length; i++) {
        if (res[i] === 0) {
          continue;
        }
        FUND_listHtml += "<tr>";
        for (var j = 0; j < valuenames.length; j++) {
          if (valuenames[j] === "gszzl") {
            FUND_listHtml += "<td>" + res[i][valuenames[j]] + "%" + "</td>";
          } else {
            FUND_listHtml += "<td>" + res[i][valuenames[j]] + "</td>";
          }
        }
        FUND_listHtml += "</tr>";
      }
      FUND_listHtml += "</tbody></table>";
      var container = document.getElementById("container");
      container.innerHTML = FUND_listHtml;
    })
    .catch(function (reason) {
      console.log(reason);
    });
}
