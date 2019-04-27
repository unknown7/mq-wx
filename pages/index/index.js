// pages/wxml/index.js
import Notify from '../../dist/notify/notify';
import Toast from '../../dist/toast/toast';
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imagePath: app.globalData.imagePath,
    autoplay: true,
    interval: 3500,
    duration: 1500,
    banners: [],
    swiperCurrent: 0,
    classifications: [],
    videos: []
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.getBanners();
    that.getClassifications();
    that.getVideos();
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
    console.log("share..");
    return {
      title: "test",
      path: "pages/index/index",
      success: function(res) {
        console.log("success..." + res);
      },
      fail: function(res) {
        console.log("fail..." + res)
      }
    };
  },

  // banner改变事件
  swiperChange: function(e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },

  // classification改变事件
  classificationChange: function(e) {
  },

  /**
   * 获取banner信息
   */
  getBanners: function() {
    var that = this;
    wx.request({
      url: app.globalData.subDomain + 'index/getBanners',
      success: function(res) {
        that.setData({
          banners: res.data
        });
      }
    });
  },

  /**
   * 获取视频分类
   */
  getClassifications: function() {
    var that = this;
    wx.request({
      url: app.globalData.subDomain + 'index/getClassifications',
      success: function(res) {
        that.setData({
          classifications: res.data
        });
      }
    });
  },

  /**
   * 获取视频
   */
  getVideos: function(index, id) {
    let that = this; 
    wx.request({
      url: app.globalData.subDomain + 'index/getVideos',
      success: function (res) {
        that.setData({
          videos: res.data
        });
      }
    });
  },

  videoClick: function(e) {
    let that = this;
    var videoId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/detail/index?id=' + videoId,
    });
  },

  clearCache: function() {
    console.log("clear..")
    wx.clearStorage({
      success: function() {
        console.log("clear success..");
        Toast.success("clear success..");
      },
      fail: function() {
        console.log("clear fail..");
        Toast.success("clear fail..");
      }
    });
  }
})