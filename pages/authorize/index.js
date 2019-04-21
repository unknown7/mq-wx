var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    to: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    var to = options.to;
    that.to = to.replace("@@", "?").replace("@", "=");
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  bindGetUserInfo: function(e) {
    let detail = e.detail;
    app.globalData.userInfo = detail.userInfo;
    wx.setStorageSync("userInfo", JSON.stringify(detail.userInfo));
    this.login(detail.encryptedData, detail.iv, detail.rawData, detail.signature);
  },
  login: function(encryptedData, iv, rawData, signature) {
    let that = this;
    wx.login({
      success: function(loginRes) {
        if (loginRes.code) {
          wx.request({
            url: app.globalData.subDomain + "login",
            data: {
              code: loginRes.code, // 临时登录凭证
              rawData: rawData, // 用户非敏感信息
              signature: signature, // 签名
              encryptedData: encryptedData, // 用户敏感信息
              iv: iv // 解密算法的向量
            },
            success: function(res) {
                wx.setStorageSync("loginFlag", res.data);
                wx.redirectTo({
                  url: that.to,
                });
            }
          });
        }
      }
    });
  },
  registerUser: function() {
    let that = this;
    wx.login({
      success: function(res) {
        let code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        wx.getUserInfo({
          success: function(res) {
            let iv = res.iv;
            let encryptedData = res.encryptedData;
            let referrer = '' // 推荐人
            let referrer_storge = wx.getStorageSync('referrer');
            if (referrer_storge) {
              referrer = referrer_storge;
            }
            // 下面开始调用注册接口
            WXAPI.register({
              code: code,
              encryptedData: encryptedData,
              iv: iv,
              referrer: referrer
            }).then(function(res) {
              wx.hideLoading();
              that.login();
            })
          }
        })
      }
    })
  }
})