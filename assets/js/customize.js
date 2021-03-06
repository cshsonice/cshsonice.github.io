/**
 * 提供自定义设置
 * 1. 根据dom自动生成目录并显示在右侧目录(手机端显示在底部，没办法)
 * 2. 自动更换格言（随机）
 * 3. http跳转到https
 */

// 0. -----

// 全局变量
const DARK_MODE_ENABLE = "EnableTheDarkMode";
const OPEN_TAG = "OpenIt";
const CLOSE_TAG = "CloseIt";


// 1. ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

// 找到下一个h标签
function next_h(node) {
    var n = node.nextElementSibling;
    while (n !== null) {
        if (n.nodeName.length === 2 && n.nodeName.toLowerCase()[0] === "h") {
            break;
        }
        else {
            n = n.nextElementSibling;
        }
    }
    return n;  // null或<h?>
}
function get_indentattion(n) {
    indentation = "----";
    r = "";
    for (var i = 0; i < n - 1; i++) {
        r += indentation;
    }
    return "<br>" + r + ">";
}

// 扫描目录输出目录信息
function output_TOC(t) {
    // 参数t为第一个h标签
    var html = "";  //待会的sidebar内容

    var line = get_indentattion(Number(t.nodeName[1])) + "<a href=\"#" + t.id + "\">" + t.textContent + "</a><br>\n";
    html += line;
    t = next_h(t);
    while (t !== null) {
        line = get_indentattion(Number(t.nodeName[1])) + "<a href=\"#" + t.id + "\">" + t.textContent + "</a><br>\n";
        html += line;
        t = next_h(t);
    }
    return html;
}

// 将已知的目录信息进行提取，设置到右侧导航栏
function set_TOC(m) {
    // 参数m为内容区域
    // 侧边栏
    t = m.firstElementChild; // 内容区域的第一个元素节点（一般是h标签）

    html = output_TOC(t);

    var sdbar = document.getElementById("sidebar");  // 侧边栏
    if (sdbar === null) {
        setTimeout(function () {
            set_TOC(m); // 递归调用自我
        }, 1000);
    }
    else {
        sdbar.innerHTML = html;
    }
}


// 2. ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

//生成从minNum到maxNum的随机整数
function randomNum(minNum, maxNum) {
    // Math.random()  // [0,1)
    switch (arguments.length) {
        case 1:
            return Math.floor(Math.random() * minNum); // [0, n)
            break;
        case 2:
            return Math.floor(Math.random() * (maxNum - minNum) + minNum); // [n, m)
            break;
        default:
            return 0;
            break;
    }
}

function modify_motto(motto) {
    // 定位到格言位置
    var header = document.getElementsByTagName('header')[0];
    var my_motto = header.firstElementChild.firstElementChild.nextElementSibling;
    // 修改
    my_motto.innerText = motto;
}

function set_motto(mottoes) {
    //周期性更新motto
    var n = randomNum(mottoes.motto.length)
    var motto = mottoes.motto[n];  // get随机的motto
    modify_motto(motto); // 修改
}

function get_mottoes() {
    //1.创建AJAX对象
    var ajax = new XMLHttpRequest();
    //4.给AJAX设置事件(这里最多感知4[1-4]个状态)
    ajax.onreadystatechange = function () {
        //5.获取响应
        //responseText以字符串的形式接收服务器返回的信息
        //console.log(ajax.readyState);
        if (ajax.readyState == 4 && ajax.status == 200) {
            let msg = ajax.responseText;
            let mottoes = JSON.parse(msg);  //数据转化为json对象

            //周期性更新
            set_motto(mottoes); // 避免老是以同一个motto作为开始
            setInterval(function () { set_motto(mottoes) }, 11000);
        }
    }
    //2.创建http请求,并设置请求地址

    ajax.open('get', '/assets/data/motto.json');
    //3.发送请求(get--null    post--数据)
    ajax.send(null);
}

function update_motto() {
    //最后封装版
    get_mottoes();
}
// 3. ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

function jump2https() {
    var targetProtocol = "https:";
    if (window.location.protocol != targetProtocol)
        window.location.href = targetProtocol +
            window.location.href.substring(window.location.protocol.length);
}

// 4. ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

//当页面滚动到顶部后固定住侧边栏
function fix_sidebar() {
    var oDiv = document.getElementById("sidebar");
    let offHeight = 0;
    let offLeft = 0;
    let Y = oDiv;
    while (Y) {
        offHeight += Y.offsetTop;
        offLeft += Y.offsetLeft;
        Y = Y.offsetParent;
    }
    let rawWidth = window.innerWidth;   // 可用窗口宽度
    let rawHeight = window.innerHeight; // 可用窗口高度
    window.onscroll = function () {
        let s = document.body.scrollTop || document.documentElement.scrollTop;
        if (s > offHeight && rawWidth == window.innerWidth) {
            // 当前div滚动到顶部 && 窗口大小未改变
            oDiv.style = `position:fixed; left:${offLeft}px; top:0;overflow:auto;max-height:${rawHeight * 0.8}px`;
        } else {
            oDiv.style = "";
        }
    }
}

// 5. ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

// 切换深色或浅色主题
function cs_toggleTheme(e) {
    let checkbox = document.getElementById("toggleThemeCheckbox");
    if (checkbox.checked) {
        // 开启深色主题
        DarkReader.enable({
            brightness: 100, // 明亮度
            contrast: 109,   // 对比度
            sepia: 10        // 棕褐色
        });  // 深色模式
        write_cookie(DARK_MODE_ENABLE, OPEN_TAG);
    }
    else {
        DarkReader.disable();
        write_cookie(DARK_MODE_ENABLE, CLOSE_TAG);
    }
}

// 6. ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

// 管理cookie
function read_cookie(k) {
    // 读取cookie
    if (k) {
        let v1 = localStorage.getItem(k);
        v1 = v1 ? v1 : "";

        let v2 = "";
        if (document.cookie.length > 0) {
            c_start = document.cookie.indexOf(k + "=");
            if (c_start != -1) {  // found it !
                c_start = c_start + k.length + 1;
                c_end = document.cookie.indexOf(";", c_start);
                if (c_end == -1) c_end = document.cookie.length;
                v2 = unescape(document.cookie.substring(c_start, c_end));
            }
        }
        return v1 ? v1 : v2;  // v1!=v2时，优先选择v1
    }
}

function write_cookie(k, v, expiredays = 360) {
    // 写入cookie
    if (k && v) {
        localStorage.setItem(k, v);
        let exdate = new Date();
        exdate.setDate(exdate.getDate() + expiredays);
        document.cookie = k + "=" + escape(v) + ((expiredays == null) ? "" : ";expires=" + exdate.toGMTString()) + ";path=/";
    }
}

//----------------main----------------------↓↓↓↓↓↓↓

jump2https();//js 自动从http跳转到https（必须先加载http，所以不能禁用http）

window.onload = function () {
    update_motto();  // 更新格言

    let dark_mode_tag = read_cookie(DARK_MODE_ENABLE); // 查看是否需要启用深色模式
    let togglebtn = document.getElementById("toggleThemeCheckbox");
    togglebtn.checked = false; // 不管原本是什么，先设置为false并不触发切换主题函数
    if (dark_mode_tag == OPEN_TAG) {
        togglebtn.click();
    }

    // 若存在sidebar，则生成侧边目录
    if (document.getElementById("sidebar") !== null){
        let mcontent = document.getElementById("main-content");  // content area
        set_TOC(mcontent); // 设置右侧目录
        fix_sidebar(); // 固定目录块
    };
}

