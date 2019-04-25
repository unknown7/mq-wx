// pages/detail/index.js
import Share from '../../palette/share';
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    coverPath: "",
    videoPath: "",
    descriptionPath: "",
    video: {},
    videoContext: null,
    widthFix: "widthFix",
    disabledWatch: false,
    auth: false,
    template: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    let skey = wx.getStorageSync("skey");
    let userInfo = wx.getStorageSync("userInfo");
    that.setData({
      videoContext: wx.createVideoContext("video"),
      auth: userInfo ? true : false
    });
    let id = options.id;
    /**
     * 获取视频信息
     */
    wx.request({
      url: app.globalData.subDomain + 'video/getVideo',
      data: {
        id: id,
        skey: skey
      },
      success: function(res) {
        that.setData({
          video: res.data,
          videoPath: app.globalData.videoPath + res.data.videoRealName,
          descriptionPath: app.globalData.imagePath + res.data.descriptionRealName
        });
      }
    });

    /**
    * 生成小程序码
    */
    wx.request({
      url: app.globalData.subDomain + 'video/generateWxQrcode',
      data: {
        videoId: id,
        skey: skey
      },
      success: function (res) {
        let data = res.data;
        console.log(data);
        if (data.success) {
          that.setData({
            template: new Share(data.data).palette(),
          });
        }
        
      }
    });
  },

  onPurchase: function() {
    wx.navigateTo({
      url: '/pages/purchase/index',
    });
  },

  onShare: function() {
    let that = this;
    let skey = wx.getStorageSync("skey");
    if (skey) {
      wx.showToast({
        icon: 'none',
        title: '登陆失败，请刷新',
        duration: 2000
      });
    } else {
      wx.showToast({
        title: '登陆失败，请刷新',
        duration: 2000
      });
    }
  },

  bindtimeupdate: function(e) {
    let that = this;
    let video = that.data.video;
    let videoContext = that.data.videoContext;
    let disabledWatch = that.data.disabledWatch;
    if (!video.isPurchased && e.detail.currentTime > video.freeWatchTime) {
      videoContext.stop();
      videoContext.exitFullScreen();
      that.setData({
        disabledWatch: true
      });
      that.showPurchaseModal();
    }
  },

  bindplay: function(e) {
    let that = this;
    if (that.data.disabledWatch) {
      let videoContext = that.data.videoContext;
      videoContext.stop();
      videoContext.exitFullScreen();
      that.showPurchaseModal();
    }
  },

  bindfullscreenchange: function(e) {
    let that = this;
    that.setData({
      widthFix: "widthFix"
    });
  },

  showPurchaseModal: function() {
    let that = this;
    let video = that.data.video;
    let title = video.freeWatchTime > 0 ? "免费观看结束" : "提示";
    let content = "您还没有购买此视频哦\n点击购买，立刻享受极致视频体验";
    wx.showModal({
      title: title,
      content: content,
      showCancel: true,
      confirmText: "购买",
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定');
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    });
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

  }
})