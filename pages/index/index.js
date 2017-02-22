//index.js
//获取应用实例
var app = getApp()
Page({
  data: {
    motto: '书迹',
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function() {
    wx.navigateTo({
      url: '../me/me'
    })
  },
  onLoad: function () {
    
  },
  onReady:function(){
    console.log('onReady')
    var that = this
    //调用应用实例的方法获取全局数据
    // app.getUserInfo(function(userInfo){
    //   //更新数据
    //   console.log('setData userinfo')
    //   that.setData({
    //     userInfo:userInfo
    //   })
    // })
    app.getLocation(function(location){
      wx.request({
        url: 'https://book.lares.me/actlist',
        data: {'location':location},
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        // header: {}, // 设置请求的 header
        success: function(res){
          // success
        },
        fail: function() {
          // fail
        },
        complete: function() {
          // complete
        }
      })
    })
  }
})
