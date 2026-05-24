/**
 * 悬浮窗界面
 */

let common = require("/modules/common.js");

// 悬浮窗引用
let window = null;
let expanded = false;
let state = null;
let toggles = null;

/**
 * 初始化悬浮窗
 * @param {object} runningState - 运行状态对象
 * @param {object} featureToggles - 功能开关对象
 */
function init(runningState, featureToggles) {
    state = runningState;
    toggles = featureToggles;

    // 关闭已有悬浮窗
    close();

    // 创建小悬浮按钮
    window = floaty.window(
        <frame id="container" w="160" h="50">
            <horizontal gravity="center" w="*" h="*" bg="#80000000" borderRadius="8">
                <text id="txtCollapsed" text="▶ 悬浮按钮" textSize="14" textColor="#FFFFFF" gravity="center"/>
            </horizontal>
        </frame>
    );

    // 设置初始位置（右上角，不遮挡游戏）
    window.setPosition(device.width - 170, 50);

    // 设置可拖拽
    window.setAdjustEnabled(true);

    // 点击事件 - 切换展开/收起
    window.container.click(function() {
        if (expanded) {
            collapse();
        } else {
            expand();
        }
    });
}

/**
 * 展开悬浮窗
 */
function expand() {
    if (!window) return;
    expanded = true;

    // 关闭旧的，创建新的展开窗口
    if (window) {
        window.close();
    }

    window = floaty.window(
        <vertical id="container" w="200" h="auto" bg="#CC000000" padding="8" borderRadius="8">
            <horizontal gravity="center" marginBottom="4">
                <button id="btnStart" text="▶开始" w="60" h="32" bg="#4CAF50" textSize="12"/>
                <button id="btnFloatyPause" text="⏸暂停" w="60" h="32" bg="#FF9800" textSize="12" marginLeft="4"/>
                <button id="btnFloatyStop" text="⏹停止" w="60" h="32" bg="#F44336" textSize="12" marginLeft="4"/>
            </horizontal>
            <text id="txtStatus" textSize="12" textColor="#FFFFFF" gravity="center"/>
            <button id="btnHide" text="▶隐藏" w="*" h="32" textSize="12" marginTop="4"/>
        </vertical>
    );

    window.setPosition(device.width - 210, 50);
    window.setAdjustEnabled(true);

    // 更新状态文本
    updateStatusText();

    // 按钮事件
    window.btnStart.click(function() {
        if (state) {
            state.isRunning = true;
            state.status = "运行中";
            updateStatusText();
            common.log("悬浮窗: 开始运行");
        }
    });

    window.btnFloatyPause.click(function() {
        if (state) {
            state.status = state.status === "已暂停" ? "运行中" : "已暂停";
            updateStatusText();
            common.log("悬浮窗: " + state.status);
        }
    });

    window.btnFloatyStop.click(function() {
        if (state) {
            state.isRunning = false;
            state.status = "已停止";
            updateStatusText();
            common.log("悬浮窗: 停止运行");
        }
    });

    window.btnHide.click(function() {
        collapse();
    });

    // 点击容器切换
    window.container.click(function() {
        // 不处理，让按钮事件处理
    });
}

/**
 * 收起悬浮窗
 */
function collapse() {
    if (!window) return;
    expanded = false;

    window.close();

    window = floaty.window(
        <frame id="container" w="160" h="50">
            <horizontal gravity="center" w="*" h="*" bg="#80000000" borderRadius="8">
                <text id="txtCollapsed" text="▶ 悬浮按钮" textSize="14" textColor="#FFFFFF" gravity="center"/>
            </horizontal>
        </frame>
    );

    window.setPosition(device.width - 170, 50);
    window.setAdjustEnabled(true);

    window.container.click(function() {
        expand();
    });
}

/**
 * 更新状态文本
 */
function updateStatusText() {
    if (!window || !window.txtStatus) return;

    let text = "";
    if (state) {
        text = "当前: " + (state.currentAccount || "无") + " | 状态: " + (state.status || "等待中");
    }

    ui.run(function() {
        try {
            window.txtStatus.setText(text);
        } catch (e) {
            // 窗口可能已关闭
        }
    });
}

/**
 * 更新状态（外部调用）
 * @param {string} status - 状态文本
 */
function updateStatus(status) {
    if (state) {
        state.status = status;
    }
    updateStatusText();
}

/**
 * 关闭悬浮窗
 */
function close() {
    if (window) {
        try {
            window.close();
        } catch (e) {
            // 窗口可能已关闭
        }
        window = null;
    }
    expanded = false;
}

// 导出模块
module.exports = {
    init: init,
    close: close,
    updateStatus: updateStatus
};
