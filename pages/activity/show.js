//获取应用实例
var app = getApp()
Page({
  isShow:false,
  isLoad:false,
  data: {
    userInfo: {},
    activity_info: {},
    act_detail:{},
    ihave:0,
    dist:false,
    isign:0,
    act_id: 0,
    counter: 0,
    markers: [{
      iconPath: "/images/location.png"
    }],
    circles: [],
    transits: false
  },
  callme: function (e) {
    wx.makePhoneCall({
      phoneNumber: this.data.activity_info.phone
    })
  },
  getDist:function(cb){
    var that = this
     wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function(res){
          console.dir(res)
          var latitude = res.latitude
          var longitude = res.longitude
          
          app.globalData.location = longitude+','+latitude
          app.globalData.userInfo.location = longitude+','+ latitude
          typeof cb == "function" && cb(app.globalData.userInfo)
      },
      fail: function(e) {
        console.log('getlocation failed')
        console.dir(e)
        // fail
      },
      complete: function() {
        // complete
      }
    })
    
  },
  getActivity:function(){
    var that = this
    if(that.isLoad){
      return
    }    
    that.isLoad = true
    
    wx.request({
      url: 'https://a.lares.me/activity',
      data: { "act_id": app.globalData.curr_act_id, 'openid': that.data.userInfo.openid,'location': app.globalData.location},
      method: 'GET', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: { 'Content-Type': 'application/json' }, // 设置请求的 header
      success: function (res) {
        
        that.setData({
          activity_info: res.data.data,
          dist:res.data.data.dist,
          markers: [{
            iconPath: "/images/location.png",
            id: 0,
            latitude: res.data.data.latitude,
            longitude: res.data.data.longitude,
            width: 30,
            height: 30,
            title: res.data.data.loc_name
          }],
          // transits:res.data.data.transits
        })
        // if(!app.globalData.location){
        //   that.getDist(function(dist){
        //     that.setData({dist:dist})
        //   })
        // }
        wx.hideNavigationBarLoading()
        var userInfo = that.data.userInfo
        wx.request({
          url: 'https://a.lares.me/activity_detail?act_id=' + app.globalData.curr_act_id+'&openid='+userInfo.openid,
          data: userInfo,
          method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: { 'Content-Type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            if (res.data.code == 0) {
              that.setData({
                act_detail:res.data.data.act_detail,
                ihave:res.data.data.ihave,
                isign:res.data.data.isign,
                counter: res.data.data.act_detail.length
              })
            }
          },
          fail: function () {
            // fail
          },
          complete: function () {
            
          }
        })

        
      },
      fail: function () {

      },
      complete: function () {

      }
    })
  },
  onShareAppMessage: function () {
    return {
      title: this.data.activity_info.act_name+ '，' + this.data.counter + '人已报名，@'+ this.data.activity_info.start_date + ' ' + this.data.activity_info.start_time + '[' + this.data.activity_info.weekday + ']',
      path: 'pages/activity/show?act_id=' + this.data.act_id
    }
  },
  onHide:function(){
    this.isShow = false
    console.log('==============hide page=================')
  },
  onUnload:function(){
    this.isShow = false
    console.log('==============unload page=================')
  },
  onShow:function(){
    var that = this
    var act_id = app.globalData.curr_act_id
    that.isShow = true
    console.log('------onShow--------')
    console.log('act_id:'+act_id)
    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        userInfo: userInfo
      })
      
      console.log(userInfo)
      
      console.log('openid:'+app.globalData.userInfo.openid)

      that.getActivity()
    })
    
    // wx.showNavigationBarLoading()

    
    wx.onAccelerometerChange(function(e) {
      // console.log(res.x)
      // console.log(res.y)
      // console.log(res.z)
      if(!that.isShow){
        return
      }
      if (e.x > 1 && e.y > 1) {
          that.sign('shake')
      }
    })
    
  },
  switch2Change:function(e){
    var formId = e.detail.formId
    var that = this
    wx.showModal({
      title:'提醒订阅',
      content:"活动开始前发送提醒给我",
      cancelText:'不提醒',
      confirmText:'提醒我',
      success:function(res){
        if(res.confirm){
          wx.request({
            url: 'https://a.lares.me/formid_add?openid=' + app.globalData.userInfo.openid+'&formId='+formId,
            data: {},
            method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
            header: { 'Content-Type': 'application/x-www-form-urlencoded' },
            success: function (res) {
              if (res.data.code == 0) {
                wx.showToast({
                  title:'订阅成功',
                  icon:'success',
                  duration: 2000
                })
              }
            },
            fail: function () {
              // fail
            },
            complete: function () {

            }
          })
        }
      }
    })
    
  },  
  onLoad: function (options) {
    var that = this
    var act_id = options.act_id
    if(app.globalData.curr_act_id!=act_id){
        that.isLoad=false
    }
    app.globalData.curr_act_id=act_id
    var mode = options.mode?options.mode:'act'
    console.log('------onLoad--------')
    console.dir(that.data)



    app.getUserInfo(function (userInfo) {
      //更新数据
      that.setData({
        act_id: act_id,
        userInfo: userInfo
      })
      console.log(that.data)
      that.getActivity()
    })

  },
  join: function (e) {
    var that = this
    var formId=e.detail.formId
    wx.request({
      url: 'https://a.lares.me/activity_join?act_id=' + that.data.act_id+'&formId='+formId,
      data: that.data.userInfo,
      method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
      header: { 'Content-Type': 'application/x-www-form-urlencoded' },
      success: function (res) {
        if (res.data.code == 0) {
          
          wx.showToast({
            title: '报名成功',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            ihave:1
          })
          that.isLoad=false
          that.getActivity()
          // var _close = function () {
          //   wx.navigateBack()
          // }
          // setTimeout(_close, 3000)
        }
        else {
          wx.showModal({
            title: '温馨提示',
            content: res.data.msg
          })
        }
      },
      fail: function () {
        // fail
      },
      complete: function () {

      }
    })
  },
  sign: function (e) {
    var that = this
    wx.getLocation({
      type: 'wgs84', // 默认为 wgs84 返回 gps 坐标，gcj02 返回可用于 wx.openLocation 的坐标
      success: function (res) {
        var latitude = res.latitude
        var longitude = res.longitude
        console.dir(res)
        var location = longitude + ',' + latitude
        wx.request({
          url: 'https://a.lares.me/activity_sign?act_id=' + that.data.act_id + '&location=' + location,
          data: that.data.userInfo,
          method: 'POST', // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
          header: { 'Content-Type': 'application/x-www-form-urlencoded' },
          success: function (res) {
            if (res.data.code == 0) {
              wx.showToast({
                title: '签到成功',
                icon: 'success',
                duration: 2000
              })
              that.setData({
                isign:1
              })
              that.isLoad=false
              that.getActivity()
            }
            else {
              wx.showModal({
                title: '签到失败',
                content: res.data.msg,
                showCancel: false
              })
            }
          },
          fail: function () {
            // fail
          },
          complete: function () {
            
          }
        })

      },
      fail: function (e) {
        wx.showModal({
          title: '温馨提示',
          content: '获取位置失败，请打开GPS',
          showCancel: false
        })
        // fail
      },
      complete: function () {
        // complete
      }
    })

  },
  openLocation: function (e) {
    var that = this
    var location = that.data.activity_info.location
    var longitude = location.split(',')[0]
    var latitude = location.split(',')[1]
    var obj = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address: that.data.activity_info.loc_name,
      name:that.data.activity_info.act_name,
      scale: 18
    }
    console.dir(obj)
    wx.openLocation(obj)
  },
})
