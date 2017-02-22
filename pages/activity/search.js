//index.js
//获取应用实例
var app = getApp()

Page({
  data: {
    motto: '你好，小程序！',
    userInfo: {},
    actlist:[],
    isSearch:false
  },
  loadData:function(k){
    var that = this
    wx.request({
        url: 'https://a.lares.me/actsearch?keyword='+k,
        data: {},
        method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
        header: {'Content-Type': 'application/json'}, // 设置请求的 header
        success: function(res){
            that.setData({
              isSearch:true
            })
            if(res.data.data){
                that.setData({
                    actlist:res.data.data
                })
            }
        },
        fail: function() {
            // fail
        },
        complete: function() {

        }
    })
  },
  onShow:function(){
    var that = this
    // that.loadData()
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    app.getUserInfo(function(userInfo){
      //更新数据
      that.setData({
        userInfo:userInfo
      })      
    })    
  },
  startSearch:function(e){
    var that = this
    that.loadData(e.detail.value)
  },
  showAct:function(e){
    wx.navigateTo({
      url: '../activity/show?act_id='+e.currentTarget.dataset.actid
    })
  },
  cancelSearch:function(){
    wx.navigateBack()
  }
})
