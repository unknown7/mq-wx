//app.js
/**
 * <用户授权、登录流程>
 * 
 * 请求需要用户登录的页面时
 * ->本机缓存中是否存在skey
 *    ->存在：本机缓存中是否存在user
 *        ->存在：
 *          调用微信checkSession接口，检查用户是否活跃
 *            ->活跃：继续业务流程
 *            ->不活跃：
 *              1、调用微信login接口，得到code
 *              2、调用服务器auth接口（code），获取user，将user存入本机缓存，继续业务流程
 *        ->不存在：
 *          1、调用服务器getUser接口（skey），获取user
 *          2、将user存入本机缓存
 *    ->不存在：
 *      1、调用微信login接口，得到code
 *      2、调用服务器auth接口（code），检查服务器是否存在user
 *        ->存在：将skey存入本机缓存，将user存入本机缓存，继续业务流程
 *        ->不存在：弹出小程序授权框，获取用户授权
 * 
 *  获取用户授权回调函数流程：
 *    1、将userInfo存入本机缓存
 *    2、调用服务器saveUser接口（{不存在->1}中的code，encryptedData，iv）
 *    3、将skey存入本机缓存
 *    4、继续业务流程
 */
App({
  onLaunch: function() {},

  checkLoginStatus: function(succ, fail) {
    let that = this;
    console.log("that.globalData.checkUserStatus=" + that.globalData.checkUserStatus);
    if (that.globalData.checkUserStatus) {
      let skey = wx.getStorageSync("skey");
      console.log("skey=" + skey);
      if (skey) {
        let userStorageInfo = wx.getStorageSync("userInfo");
        if (userStorageInfo) {
          // wx.checkSession({
          //   success: function () {
          //     console.log("checkSession success..");
          //     succ.call();
          //   },
          //   fail: function () {
          //     console.log("checkSession fail..");
          //     that.login(succ, fail);
          //   }
          // });
          succ.call();
        } else {
          wx.request({
            url: that.globalData.subDomain + "getUser",
            data: {
              skey: skey // 加密的openid
            },
            success: function (res) {
              if (res.data != null) {
                console.log("getUser success..");
                wx.setStorageSync("userInfo", res.data);
                that.globalData.userInfo = detail.userInfo;
                succ.call();
              } else {
                console.log("getUser fail..");
                wx.removeStorageSync("skey");
                fail.call();
              }
            }
          });
        }
      } else {
        that.login(succ, fail);
      }
    } else {
      succ.call();
    }
  },

  login: function(succ, fail) {
    var that = this;
    wx.login({
      success: function (loginRes) {
        let code = loginRes.code;
        wx.request({
          url: that.globalData.subDomain + "auth",
          data: {
            code: code // 临时登录凭证
          },
          success: function (res) {
            if (res.data.success) {
              console.log("auth success..");
              wx.setStorageSync("skey", res.data.skey);
              wx.setStorageSync("userInfo", res.data.userVo);
              that.globalData.userInfo = res.data.userInfo;
              succ.call();
            } else {
              console.log("auth fail..");
              fail.call();
            }
          }
        });
      }
    });
  },

  globalData: {
    userInfo: null,
    checkUserStatus: true,
    subDomain: "http://192.168.1.101:8080/mq/wx/",
    imagePath: "http://192.168.1.101:8080/mq/images/",
    videoPath: "http://192.168.1.101:8080/mq/videos/"
  }
})