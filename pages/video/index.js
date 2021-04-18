// pages/detail/index.js
import Share from '../../palette/share';
import Notify from '../../dist/notify/notify';
import Toast from '../../dist/toast/toast';
var app = getApp();
var purchaseModalSwitch = true;
var played = false;
var disabledWatch = false;
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
    auth: false,
    template: {},
    videoSwitch: false,
    shareCardSwitch: true,
    isScroll: true,
    shareCard: "",
    shareButtonDisabled: false,
    purchaseButtonDisabled: false,
    button: wx.getStorageSync("button")
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
    purchaseModalSwitch = true;
    disabledWatch = false;
    played = false;
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
          coverPath: app.globalData.imagePath + res.data.coverRealName,
          videoPath: app.globalData.videoPath + res.data.videoRealName,
          descriptionPath: app.globalData.imagePath + res.data.descriptionRealName,
          shareCard: res.data.shareCard ? app.globalData.imagePath + res.data.shareCard : ""
        });
      }
    });
  },

  onShowActionSheet: function(e) {
    let that = this;
    wx.showActionSheet({
      itemList: ['保存'],
      success: function(res) {
        wx.downloadFile({
          url: that.data.shareCard,
          success: function (res) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success: function () {
                that.closeShareCard();
                that.btnEnable();
                wx.showToast({
                  title: "保存成功",
                });
              },
              fail: function(res) {
                console.log("fail.." + JSON.stringify(res));
              }
            });
          }
        });
      }
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
    that.saveUser(e, function() {
      that.onShare();
    });
  },

  purchaseGetUserInfo: function(e) {
    var that = this;
    that.saveUser(e, function() {
      that.purchase();
    });
  },

  saveUser: function(e, call) {
    let that = this;
    let detail = e.detail;
    if (detail.userInfo) {
      that.btnDisabled();
      let data = {
        skey: wx.getStorageSync("skey"), // skey
        rawData: detail.rawData, // 用户非敏感信息
        signature: detail.signature, // 签名
        encryptedData: detail.encryptedData, // 用户敏感信息
        iv: detail.iv // 解密算法的向量
      };
      let scene = wx.getStorageSync("scene");
      if (scene) {
        data.scene = scene;
      };
      wx.request({
        url: app.globalData.subDomain + "saveUser",
        data: data,
        success: function (res) {
          if (res.data.success) {
            console.log("register success..");
            wx.setStorageSync("skey", res.data.skey);
            wx.setStorageSync("userInfo", res.data.userVo);
            that.setData({
              auth: true
            });
            call.call();
          } else {
            Toast.fail('授权失败');
            that.btnEnable();
          }
        },
        fail: function () {
          Toast.fail('授权失败');
          that.btnEnable();
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
    let that = this;
    that.purchase();
  },

  purchase: function() {
    let that = this;
    let videoId = that.data.video.id;
    let price = that.data.video.price;
    let classificationName = that.data.video.classificationName;
    let title = that.data.video.title;
    that.btnDisabled();
    wx.navigateTo({
      url: '/pages/purchase/index?id=' + videoId + '&price=' + price + '&classificationName=' + classificationName + '&title=' + title,
      success: function() {
        that.btnEnable();
      }
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
    if (!that.data.button) {
      if (purchaseModalSwitch) {
        let video = that.data.video;
        let videoContext = that.data.videoContext;
        let isPurchased = video.isPurchased;
        let currentTime = e.detail.currentTime;
        let freeWatchTime = video.freeWatchTime;
        if (!isPurchased && currentTime > freeWatchTime) {
          disabledWatch = true;
          purchaseModalSwitch = false;
          videoContext.exitFullScreen();
          videoContext.pause();
          videoContext.stop();
          that.showPurchaseModal();
        }
      }
    }
    
  },

  bindplay: function(e) {
    let that = this;
    if (disabledWatch) {
      let videoContext = that.data.videoContext;
      videoContext.exitFullScreen();
      videoContext.stop();
      that.showPurchaseModal();
    } else {
      if (!played) {
        let id = that.data.video.id;
        let skey = wx.getStorageSync("skey");
        wx.request({
          url: app.globalData.subDomain + 'video/watchVideoStatistics',
          data: {
            id: id,
            skey: skey
          },
          success: function (res) {
            if (res.data.success) {
              played = true;
            }
          }
        });
      }
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
    let userInfo = wx.getStorageSync("userInfo");
    let showCancel = userInfo ? true : false;
    let confirmText = userInfo ? "购买" : "确定";
    let call = function(res) {
      if (userInfo) {
        if (res.confirm) {
          that.purchase();
        }
      }
    };
    wx.showModal({
      title: title,
      content: content,
      showCancel: showCancel,
      confirmText: confirmText,
      success(res) {
        call(res);
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
    let that = this;
    let id = that.data.video.id;
    if (id) {
      let options = {
        id: id
      };
      that.onLoad(options);
    }
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
    let id = that.data.video.id;
    let options = {
      id: id
    };
    // 显示顶部刷新图标
    wx.showNavigationBarLoading();
    that.onLoad(options);
    setTimeout(function () {
      app.loadButton(function () {
        that.setData({
          button: this
        });
      });
      // 隐藏导航栏加载框
      wx.hideNavigationBarLoading();
      // 停止下拉动作
      wx.stopPullDownRefresh();
    }, 300);
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
      }
    }
  }
})