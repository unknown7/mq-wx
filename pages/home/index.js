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
    classificationLoadTag: [],
    videos: [],
    videosCache: [],
    videosNew: [],
    show: false,
    videoId: null
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.getBanners();
    that.getClassifications();
    that.getVideosNew();
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

  // banner改变事件
  swiperChange: function(e) {
    this.setData({
      swiperCurrent: e.detail.current
    })
  },

  // 
  classificationChange: function(e) {
    // let that = this;
    // let index = e.detail.index;
    // let classification = that.data.classifications[index];
    // that.getVideos(index, classification.id);
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
        // that.getVideos(0, res.data[0].id);
      }
    });
  },

  /**
   * 获取视频
   */
  getVideos: function(index, id) {
    let that = this; 
    console.log("index=" + index + ",that.data.classificationLoadTag[" + index + "]=" + that.data.classificationLoadTag[index]);
    if (!that.data.classificationLoadTag[index]) {
      console.log("load from server..");
      wx.request({
        url: app.globalData.subDomain + 'index/getVideos',
        data: {
          "id": id
        },
        success: function (res) {
          that.setData({
            videos: res.data
          });
          that.data.videosCache[index] = res.data;
          that.data.classificationLoadTag[index] = 1;
        }
      });
    } else {
      console.log("load from cache..");
      that.setData({
        videos: that.data.videosCache[index]
      });
    }
  },

  getVideosNew: function() {
    let that = this;
    wx.request({
      url: app.globalData.subDomain + 'index/getVideos',
      data: {
        "id": 0
      },
      success: function (res) {
        let data = res.data;
        let result = [];
        for(let i = 0; i < data.length; i++) {
          let item = data[i];
          result.push(item);
        }
        that.setData({
          videosNew: result
        });
      }
    });
  },

  videoClick: function(e) {
    let that = this;
    var videoId = e.currentTarget.dataset.id;
    that.setData({
      videoId: videoId
    });
    var result = app.checkLoginStatus(function() {
      that.navigateToVideoDetail(videoId);
    }, function() {
      // that.setData({
      //   show: true
      // });
      app.globalData.checkUserStatus = false;
      that.navigateToVideoDetail(videoId);
    });
  },

  navigateToVideoDetail: function(videoId) {
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