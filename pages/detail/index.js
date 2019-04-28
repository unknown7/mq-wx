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
    template: {},
    videoSwitch: false,
    shareCardSwitch: true,
    isScroll: true,
    shareCard: "",
    shareButtonDisabled: false,
    purchaseButtonDisabled: false,
    showActionSheet: false,
    actions: [{
      name: '保存'
    }]
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
          descriptionPath: app.globalData.imagePath + res.data.descriptionRealName,
          shareCard: res.data.shareCard ? app.globalData.imagePath + res.data.shareCard : ""
        });
      }
    });
  },

  onShowActionSheet: function(e) {
    let that = this;
    that.setData({
      showActionSheet: true
    });
  },

  onActionSheetSelect: function() {
    let that = this;
    wx.downloadFile({
      url: that.data.shareCard,
      success: function(res) {
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function() {
            that.setData({
              showActionSheet: false
            });
            that.closeShareCard();
            that.btnEnable();
            wx.showToast({
              title: "保存成功",
            });
          }
        });
      }
    });
  },

  onActionSheetClose: function() {
    let that = this;
    that.setData({
      showActionSheet: false
    });
  },

  onActionSheetCancel: function() {
    let that = this;
    that.setData({
      showActionSheet: false
    });
  },

  btnDisabled: function() {
    let that = this;
    that.setData({
      shareButtonDisabled: true,
      purchaseButtonDisabled: true
    });
  },

  btnEnable: function() {
    let that = this;
    that.setData({
      shareButtonDisabled: false,
      purchaseButtonDisabled: false
    });
  },

  shareGetUserInfo: function(e) {
    var that = this;
    let detail = e.detail;
    if (detail.userInfo) {
      that.btnDisabled();
      wx.setStorageSync("userInfo", detail.userInfo);
      wx.login({
        success: function(loginRes) {
          wx.request({
            url: app.globalData.subDomain + "saveUser",
            data: {
              code: loginRes.code, // 临时登录凭证
              rawData: detail.rawData, // 用户非敏感信息
              signature: detail.signature, // 签名
              encryptedData: detail.encryptedData, // 用户敏感信息
              iv: detail.iv // 解密算法的向量
            },
            success: function(res) {
              if (res.data != null) {
                console.log("register success..");
                wx.setStorageSync("skey", res.data);
                that.setData({
                  auth: true
                });
                that.onShare();
              } else {
                Toast.fail('授权失败');
                that.btnEnable();
              }
            },
            fail: function() {
              Toast.fail('授权失败');
              that.btnEnable();
            }
          });
        }
      });
    }
  },

  onImgOK: function(e) {
    let that = this;
    wx.hideToast();
    wx.uploadFile({
      url: app.globalData.subDomain + "video/saveShareCard",
      filePath: e.detail.path,
      name: "shareCard",
      formData: {
        skey: wx.getStorageSync("skey"),
        videoId: that.data.video.id
      },
      success: function(res) {
        let data = JSON.parse(res.data);
        if (data.success) {
          that.data.video.shareCard = data.data;
          that.data.shareCard = app.globalData.imagePath + data.data;
        }
      }
    });
  },

  onPurchase: function() {
    wx.navigateTo({
      url: '/pages/purchase/index?videoI=' + that.data.video.id
    });
  },

  onCloseShareCard: function() {
    let that = this;
    that.closeShareCard();
    that.btnEnable();
    wx.removeStorageSync("savedFiles");
  },

  closeShareCard: function() {
    let that = this;
    that.setData({
      videoSwitch: false,
      shareCardSwitch: true,
      isScroll: true,
    });
  },

  openShareCard: function() {
    let that = this;
    that.setData({
      videoSwitch: true,
      shareCardSwitch: false,
      isScroll: false,
    });
  },

  onShare: function() {
    let that = this;
    let skey = wx.getStorageSync("skey");
    let user = wx.getStorageSync("userInfo");
    if (skey && user) {
      that.btnDisabled();
      /**
       * 生成小程序码
       */
      let video = that.data.video;
      if (that.data.shareCard) {
        that.openShareCard();
        that.setData({
          shareCard: that.data.shareCard
        });
      } else {
        wx.showToast({
          title: "邀请卡生成中...",
          icon: "loading",
          duration: 9999999
        });
        wx.request({
          url: app.globalData.subDomain + 'video/generateMiniProgramCode',
          data: {
            videoId: video.id,
            skey: skey
          },
          success: function(res) {
            let data = res.data;
            if (data.success) {
              that.openShareCard();
              that.setData({
                template: {
                  width: '520rpx',
                  height: '780rpx',
                  background: '#eee',
                  borderRadius: '20rpx',
                  views: [{
                      type: 'image',
                      url: app.globalData.imagePath + video.coverRealName,
                      css: {
                        width: '480rpx',
                        height: '470rpx',
                        borderRadius: '15rpx',
                        left: '20rpx',
                        top: '20rpx',
                        right: '20rpx',
                        mode: 'scaleToFill'
                      }
                    },
                    {
                      type: 'image',
                      url: user.avatarUrl,
                      css: {
                        width: '120rpx',
                        height: '120rpx',
                        left: '40rpx',
                        top: '520rpx',
                        borderRadius: '100rpx'
                      },
                    },
                    {
                      type: 'text',
                      text: user.nickName,
                      css: {
                        left: '100rpx',
                        top: '650rpx',
                        fontSize: '30rpx',
                        color: 'rgba(60, 60, 60, 0.603)',
                        align: 'center'
                      },
                    },
                    {
                      type: 'text',
                      text: '良心推荐',
                      css: {
                        left: '100rpx',
                        top: '702rpx',
                        fontSize: '38rpx',
                        fontWeight: 'bold',
                        color: 'rgba(236,131,117, 0.603)',
                        align: 'center'
                      },
                    },
                    {
                      type: 'image',
                      url: app.globalData.imagePath + data.data,
                      css: {
                        width: '180rpx',
                        height: '180rpx',
                        right: '70rpx',
                        top: '510rpx',
                        borderRadius: '100rpx'
                      }
                    },
                    {
                      type: 'text',
                      text: '木荃孕产官方小程序',
                      css: {
                        right: '160rpx',
                        top: '710rpx',
                        fontSize: '30rpx',
                        fontWeight: 'bold',
                        color: 'rgba(27, 27, 27, 0.603)',
                        align: 'center'
                      },
                    }
                  ],
                }
              });
            }
          }
        });
      }
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
          wx.navigateTo({
            url: '/pages/purchase/index?videoI=' + that.data.video.id,
          });
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
    let that = this;
    return {
      title: "转发",
      path: "pages/detail/index?videoId=" + that.data.video.id,
      imageUrl: app.globalData.imagePath + that.data.video.coverRealName,
      success: function(e) {
        console.log(e);
      }
    }
  }
})