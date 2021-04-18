// pages/account/index.js
import Notify from '../../dist/notify/notify';
import Toast from '../../dist/toast/toast';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imagePath: app.globalData.imagePath,
    registered: wx.getStorageSync("userInfo") != '' ? true : false,
    points: 0,
    videos: [],
    invitations: [],
    button: wx.getStorageSync("button"),
    isEmployee: wx.getStorageSync("userInfo") != '' ? wx.getStorageSync("userInfo").isEmployee : false
  },

  bindGetUserInfo: function(e) {
    var that = this;
    let detail = e.detail;
    if (detail.userInfo) {
      let data = {
        skey: wx.getStorageSync("skey"), // skey
        rawData: detail.rawData, // 用户非敏感信息
        signature: detail.signature, // 签名
        encryptedData: detail.encryptedData, // 用户敏感信息
        iv: detail.iv // 解密算法的向量
      };
      wx.request({
        url: app.globalData.subDomain + "saveUser",
        data: data,
        success: function(res) {
          if (res.data != null) {
            console.log("register success..");
            wx.setStorageSync("skey", res.data.skey);
            wx.setStorageSync("userInfo", res.data.userVo);
            that.setData({
              registered: true,
              isEmployee: res.data.userVo.isEmployee
            });
          } else {
            Toast.fail('授权失败');
          }
        }
      });
    }
  },

  loadData: function(call) {
    let that = this;
    let skey = wx.getStorageSync("skey");
    /**
       * 获取积分信息
       */
    wx.request({
      url: app.globalData.subDomain + 'payment/getPoints',
      data: {
        skey: skey
      },
      success: function (res) {
        that.setData({
          points: res.data
        });
      }
    });
    /**
     * 获取视频信息
     */
    wx.request({
      url: app.globalData.subDomain + 'video/findPurchases',
      data: {
        skey: skey
      },
      success: function (res) {
        that.setData({
          videos: res.data
        });
      }
    });
    /**
     * 获取雇员信息
     */
    let isEmployee = that.data.isEmployee;
    if (!isEmployee) {
      wx.request({
        url: app.globalData.subDomain + 'getUser',
        data: {
          skey: skey
        },
        success: function (res) {
          that.setData({
            isEmployee: res.data.isEmployee
          });
          wx.setStorageSync("userInfo", res.data);
        }
      });
    }

    /**
     * 获取邀请信息
     */
    wx.request({
      url: app.globalData.subDomain + 'invitation/findInvitations',
      data: {
        skey: skey
      },
      success: function (res) {
        that.setData({
          invitations: res.data
        });
      }
    });
    
    setTimeout(function() {
      call.call();
    }, 300);
  },

  videoClick: function(e) {
    let that = this;
    var videoId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/video/index?id=' + videoId,
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    let userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      that.loadData(function() {
        that.setData({
          registered: true
        });
      });
    }
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
    let that = this;
    this.onLoad();
    app.loadButton(function () {
      that.setData({
        button: this
      });
    });
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
    let that = this;
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    that.loadData(function() {
      app.loadButton(function () {
        that.setData({
          button: this
        });
      });
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    });
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

  }
})