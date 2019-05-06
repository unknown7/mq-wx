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
    buttonDisabled: false
  },

  purchase: function() {
    let that = this;
    that.btnDisabled();
    let skey = wx.getStorageSync("skey");
    let id = that.data.video.id;
    let scene = wx.getStorageSync("scene");
    let data = {
      skey: skey,
      videoId: id
    };
    if (scene) {
      data.scene = scene;
    }
    console.log(JSON.stringify(data));
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
              that.btnEnable();
            },
            fail(res) {
              console.log("pay fail..");
              that.btnEnable();
            }
          });
        } else {
          Toast.fail('购买失败');
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
    if (checked) {
      price = (that.data.price - that.data.points).toFixed(2);
    } else {
      price = that.data.originPrice;
    }
    that.setData({
      price: price
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
        res.data = 3.69;
        that.setData({
          points: res.data
        });
      }
    });
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