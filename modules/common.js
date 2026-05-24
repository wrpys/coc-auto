/**
 * 公共函数模块 - 封装通用操作
 */

// 保存 Auto.js 内置函数引用 (避免被同名函数覆盖)
const _nativeSwipe = typeof swipe !== 'undefined' ? swipe : null;

// 截图权限请求标志 (只请求一次)
let _screenCaptureRequested = false;

// 配置加载
let settings = null;

function loadSettings() {
    if (!settings) {
        try {
            settings = JSON.parse(files.read(files.path("./config/settings.json")));
        } catch (e) {
            console.error("加载配置失败:", e);
            settings = getDefaultSettings();
        }
    }
    return settings;
}

function getDefaultSettings() {
    return {
        schedule: { start_time: "08:00", end_time: "23:00" },
        raid: { gold_min: 100000, elixir_min: 100000, dark_min: 500, attack_strategy: "standard" },
        donate: { enabled: true, troops: ["barbarian", "archer"], max_count: 5, check_interval: 10 },
        delay: { click_min: 500, click_max: 1500, action_min: 1000, action_max: 3000 }
    };
}

// 随机延迟
function randomDelay(min, max) {
    let delay = random(min, max);
    sleep(delay);
    return delay;
}

function clickDelay() {
    let s = loadSettings();
    return randomDelay(s.delay.click_min, s.delay.click_max);
}

function actionDelay() {
    let s = loadSettings();
    return randomDelay(s.delay.action_min, s.delay.action_max);
}

// 点击操作
function click(x, y) {
    clickDelay();
    press(x, y, 50);  // 50ms minimum duration for reliable click detection
    console.log("点击坐标:", x, y);
}

function longClick(x, y, duration) {
    clickDelay();
    press(x, y, duration || 500);
    console.log("长按坐标:", x, y, duration);
}

// 滑动操作
function swipe(x1, y1, x2, y2, duration) {
    actionDelay();
    // 调用 Auto.js 内置的 swipe 函数
    if (_nativeSwipe) {
        _nativeSwipe(x1, y1, x2, y2, duration || 500);
    } else {
        // 兼容性处理：如果没有内置 swipe，使用 gestures
        gestures([duration || 500, [x1, y1], [x2, y2]]);
    }
    console.log("滑动:", x1, y1, "->", x2, y2);
}

function swipeUp(distance) {
    let y = device.height / 2;
    swipe(device.width / 2, y, device.width / 2, y - distance, 500);
}

function swipeDown(distance) {
    let y = device.height / 2;
    swipe(device.width / 2, y, device.width / 2, y + distance, 500);
}

// 等待元素出现 (通过颜色检测)
function waitForColor(x, y, targetColor, timeout) {
    timeout = timeout || 10000;
    let startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        let img = captureScreen();
        let color = images.pixel(img, x, y);
        img.recycle();  // Release captured image to prevent memory leak
        if (colors.equals(color, targetColor)) {
            return true;
        }
        sleep(100);
    }
    return false;
}

// 等待时间
function wait(ms) {
    sleep(ms);
}

// 截图
function takeScreenshot() {
    // Only request permission once per script execution
    if (!_screenCaptureRequested) {
        if (!requestScreenCapture()) {
            console.error("请求截图权限失败");
            return null;
        }
        _screenCaptureRequested = true;
    }
    return captureScreen();
}

// 检测颜色
function checkColor(x, y, targetColor) {
    let img = takeScreenshot();
    if (!img) return false;
    let color = images.pixel(img, x, y);
    let result = colors.equals(color, targetColor);
    img.recycle();
    return result;
}

// 日志记录
function log(message) {
    let timestamp = new Date().toLocaleString();
    let logMessage = "[" + timestamp + "] " + message;
    console.log(logMessage);

    // 写入日志文件
    let logFile = files.path("./logs/" + formatDate(new Date()) + ".log");
    files.createWithDirs(logFile);
    files.append(logFile, logMessage + "\n");
}

function formatDate(date) {
    let year = date.getFullYear();
    let month = String(date.getMonth() + 1).padStart(2, '0');
    let day = String(date.getDate()).padStart(2, '0');
    return year + "-" + month + "-" + day;
}

// 检查运行时间
function isInSchedule() {
    let s = loadSettings();
    let now = new Date();
    let currentTime = String(now.getHours()).padStart(2, '0') + ":" + String(now.getMinutes()).padStart(2, '0');

    return currentTime >= s.schedule.start_time && currentTime <= s.schedule.end_time;
}

// 坐标适配 (根据设备分辨率调整)
function adaptCoord(x, y, baseWidth, baseHeight) {
    baseWidth = baseWidth || 1080;
    baseHeight = baseHeight || 2340;

    let scaleX = device.width / baseWidth;
    let scaleY = device.height / baseHeight;

    return {
        x: Math.round(x * scaleX),
        y: Math.round(y * scaleY)
    };
}

// 导出模块
module.exports = {
    loadSettings,
    randomDelay,
    clickDelay,
    actionDelay,
    click,
    longClick,
    swipe,
    swipeUp,
    swipeDown,
    waitForColor,
    wait,
    takeScreenshot,
    checkColor,
    log,
    isInSchedule,
    adaptCoord
};
