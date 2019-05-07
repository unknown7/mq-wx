var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    id: null,
    originPrice: 0,
    price: 0,
    classificationName: "",
    title: "",
    points: 0,
    buttonDisabled: false,
    whetherUsePoints: false,
    checked: false
  },

  purchase: function() {
    let that = this;
    that.btnDisabled();
    let skey = wx.getStorageSync("skey");
    let id = that.data.id;
    let whetherUsePoints = that.data.whetherUsePoints;
    let usedPoints = that.data.points;
    let price = that.data.price;
    let originPrice = that.data.originPrice;
    let scene = wx.getStorageSync("scene");
    let data = {
      skey: skey,
      videoId: id,
      whetherUsePoints: whetherUsePoints,
      usedPoints: usedPoints,
      price: price,
      originPrice: originPrice,
    };
    if (scene) {
      data.scene = scene;
    }
    wx.request({
      url: app.globalData.subDomain + "payment/purchase",
      data: data,
      success: function (res) {
        if (res.data.success) {
          console.log("unified order success..");
          wx.requestPayment({
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: res.data.data.package,
            signType: res.data.data.signType,
            paySign: res.data.data.paySign,
            success(res) {
              console.log("pay success..");
              wx.showToast({
                title: "等待支付通知...",
                icon: "loading",
                duration: 9999999
              });
              that.getVideo(id, skey, function() {
                that.btnEnable();
                wx.hideToast();
                wx.navigateBack({
                  delta: 1
                });
              });
            },
            fail(res) {
              console.log("pay fail..");
              that.btnEnable();
            }
          });
        } else {
          let msg = res.data.data;
          if ("invalid_param_price" == msg) {
            wx.showModal({
              title: '支付页面已过期',
              content: '请点击确定返回商品信息页面',
              showCancel: false,
              success(res) {
                if (res.confirm) {
                  wx.navigateBack({
                    delta: 1
                  });
                }
              }
            });
          } else if ("invalid_param_points" == msg) {
            wx.showModal({
              title: '您的积分已更新',
              content: '请点击确定刷新积分',
              showCancel: false,
              success(res) {
                if (res.confirm) {
                  that.loadPoints();
                }
              }
            });
          }
          that.btnEnable();
        }
      },
      fail: function () {
        Toast.fail('购买失败');
        that.btnEnable();
      }
    });
  },

  onSwitchChange: function(e) {
    let that = this;
    let checked = e.detail.value;
    let price;
    let whetherUsePoints;
    if (checked) {
      price = (that.data.price - that.data.points).toFixed(2);
      whetherUsePoints = true;
    } else {
      price = that.data.originPrice;
      whetherUsePoints = false;
    }
    that.setData({
      price: price,
      whetherUsePoints: whetherUsePoints
    });
  },

  loadPoints: function() {
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
          points: res.data,
          checked: false
        });
      }
    });
  },

  getVideo: function(id, skey, call) {
    let that = this;
    wx.request({
      url: app.globalData.subDomain + 'video/getVideo',
      data: {
        id: id,
        skey: skey
      },
      success: function (res) {
        if (res.data.isPurchased) {
          call.call();
        } else {
            setTimeout(function() {
              that.getVideo(id, skey, call);
            }, 2000);
        }
      }
    });
  },

  btnDisabled: function () {
    let that = this;
    that.setData({
      buttonDisabled: true
    });
  },

  btnEnable: function () {
    let that = this;
    that.setData({
      buttonDisabled: false
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    let id = options.id;
    let price = options.price;
    let classificationName = options.classificationName;
    let title = options.title;
    that.setData({
      id: id,
      originPrice: price,
      price: price,
      classificationName: classificationName,
      title: title
    });
    that.loadPoints();
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