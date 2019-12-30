var express=require("express")
var wxCrawler=require("./wxCrawler.js")
var app = express();
app.get('/get', async (req, res)=>{
    // key uin __biz pagesize
    let url=decodeURIComponent(req.query.url)
    wxCrawler.setParams(wxCrawler.GetQueryString(url,"key"),wxCrawler.GetQueryString(url,"uin"),wxCrawler.GetQueryString(url,"__biz"),req.query.pageSize?req.query.pageSize:1)
    let data=await wxCrawler.run()
    res.json({ code: 0, data: data});
});
// 监听
app.listen(9999, function () {
    console.log('服务已启动，端口号：9999');
});