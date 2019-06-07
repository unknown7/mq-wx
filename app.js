//app.js
/**
 * <用户授权、登录流程>
 * 
 * 请求需要用户登录的页面时
 * 校验流程（第一位数字为-的个数，-的个数相等说明在同一层级）：
 * 1-1 微信登录成功
 * 2--1.1 有skey，小程序判断用户操作超时
 * 3---1.1.1 skey与加密后的openid相等，初步认证成功，进一步检测用户是否已注册
 * 4----1.1.1.1 用户已注册
 * 4----1.1.1.2 用户未注册，存在缓存出现问题的可能，检查数据库
 * 3---1.1.2 skey与加密后的openid不相等，有问题的skey，返回失败，弃用此skey，当做未授权用户
 * 2--1.2 没有skey，检测用户是否已注册
 * 3---1.2.1 用户已注册
 * 3---1.2.2 用户未注册
 * 1-2 微信登录失败
 * 
 *  获取用户授权回调函数流程：
 *    1、将userInfo存入本机缓存
 *    2、调用服务器saveUser接口（{不存在->1}中的code，encryptedData，iv）
 *    3、将skey存入本机缓存
 *    4、继续业务流程
 */
App({
  onLaunch: function (options) {
    var that = this;
    that.loadVerifySwitch();
    that.checkLoginStatus();
  },

  onShow: function (opt) {
    let that = this;
  },

  loadVerifySwitch: function(call) {
    let that = this;
    wx.request({
      url: that.globalData.subDomain + "getVerifySwitch",
      success: function (res) {
        wx.setStorageSync("verifySwitch", res.data);
        if (call) {
          call.call(res.data);
        }
      }
    });
  },

  checkLoginStatus: function() {
    let that = this;
    let skey = wx.getStorageSync("skey");
    if (skey) {
      wx.checkSession({
        success: function() {
          console.log("checkSession success..");
        },
        fail: function() {
          console.log("checkSession fail..");
          that.login(skey);
        }
      });
    } else {
      that.login();
    }
  },

  login: function(skey) {
    var that = this;
    wx.login({
      success: function(loginRes) {
        let code = loginRes.code;
        let data = {
          code: code
        };
        if (skey) {
          data.skey = skey;
        }
        wx.request({
          url: that.globalData.subDomain + "auth",
          /**
           * data {
           *  code: code // 临时登录凭证
           *  skey: skey // 用户openid（可能为null）
           * }
           */
          data: data,
          success: function(res) {
            if (res.data.success) {
              console.log("auth success..");
              wx.setStorageSync("skey", res.data.skey);
              wx.removeStorageSync("userInfo");
              if (res.data.userVo) {
                wx.setStorageSync("userInfo", res.data.userVo);
              }
            } else {
              console.log("auth fail..");
              wx.removeStorageSync("skey");
              wx.removeStorageSync("userInfo");
            }
          }
        });
      }
    });
  },

  globalData: {
    /**
     * 开发服务器
     */
    // subDomain: "http://192.168.1.101:8080/mq/wx/",
    // imagePath: "http://192.168.1.101:8080/mq/images/",
    // videoPath: "http://192.168.1.101:8080/mq/videos/"
    /**
     * 测试服务器
     */
    // subDomain: "https://www.unknown7.xyz/mq/wx/",
    // imagePath: "https://www.unknown7.xyz/mq/images/",
    // videoPath: "https://www.unknown7.xyz/mq/videos/"
    /**
     * 生产服务器
     */
    subDomain: "https://www.mqyoga.cn/mq/wx/",
    imagePath: "https://www.mqyoga.cn/mq/images/",
    videoPath: "https://www.mqyoga.cn/mq/videos/"
  }
})