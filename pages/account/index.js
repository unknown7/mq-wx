// pages/account/index.js
import Notify from '../../dist/notify/notify';
import Toast from '../../dist/toast/toast';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    show: false
  },

  bindGetUserInfo: function (e) {
    var that = this;
    let detail = e.detail;
    if (detail.userInfo) {
      wx.setStorageSync("userInfo", detail.userInfo);
      app.globalData.userInfo = detail.userInfo;
      wx.login({
        success: function (loginRes) {
          wx.request({
            url: app.globalData.subDomain + "saveUser",
            data: {
              code: loginRes.code, // 临时登录凭证
              rawData: detail.rawData, // 用户非敏感信息
              signature: detail.signature, // 签名
              encryptedData: detail.encryptedData, // 用户敏感信息
              iv: detail.iv // 解密算法的向量
            },
            success: function (res) {
              if (res.data != null) {
                console.log("register success..");
                wx.setStorageSync("skey", res.data);
              } else {
                Toast.fail('授权失败');
              }
            }
          });
        }
      });
    }
  },

  onClose(event) {
    this.setData({
      show: false
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    let skey = wx.getStorageSync("skey");
    if (!skey) {
      that.setData({
        show: true
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})