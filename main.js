/**
 * coc-auto 主入口文件
 * 启动主界面并初始化
 */

"auto";

// 请求必要权限
if (!requestScreenCapture()) {
    toast("请求截图权限失败，部分功能可能无法正常使用");
}

// 加载配置
let common = require("./modules/common.js");
let settings = common.loadSettings();

// 创建日志目录
let logDir = "./logs/";
if (!files.exists(logDir)) {
    files.createWithDirs(logDir);
}

common.log("coc-auto 启动");

// 加载主界面
require("./ui/main_ui.js");
