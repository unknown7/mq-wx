export default class ShadowExample {
  palette(wxQrcodePath) {
    return ({
      width: '654rpx',
      height: '400rpx',
      background: '#eee',
      views: [{
        type: 'image',
        url: wxQrcodePath,
        css: {
          shadow: '10rpx 10rpx 5rpx #888888',
        }
      },
      {
        type: 'text',
        text: "shadow: '10rpx 10rpx 5rpx #888888'",
        css: {
          left: '180rpx',
          fontSize: '30rpx',
          shadow: '10rpx 10rpx 5rpx #888888',
          top: '290rpx',
        },
      },
      ],
    });
  }
}