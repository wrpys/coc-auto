/**
 * 主设置界面
 */

"ui";

// 加载配置
let common = require("/modules/common.js");
let accountsConfig = null;
let upgradeConfig = null;

function loadConfigs() {
    try {
        accountsConfig = JSON.parse(files.read(files.path("./config/accounts.json")));
    } catch (e) {
        accountsConfig = { accounts: [], auto_switch: false, switch_interval: 30 };
    }

    try {
        upgradeConfig = JSON.parse(files.read(files.path("./config/upgrade_priority.json")));
    } catch (e) {
        upgradeConfig = { priority: [] };
    }
}

loadConfigs();

// 运行状态
let runningState = {
    isRunning: false,
    currentAccount: accountsConfig.accounts.length > 0 ? accountsConfig.accounts[0].name : "未配置",
    status: "等待中"
};

// 功能开关状态
let featureToggles = {
    autoLogin: false,
    autoRaid: false,
    autoUpgrade: false,
    autoDonate: false
};

// 主界面布局
ui.layout(
    <vertical padding="16">
        <text text="部落冲突自动工具 v1.0" textSize="24" textColor="#3399FF" gravity="center" marginBottom="16"/>

        <horizontal gravity="center" marginBottom="16">
            <button id="btnStart" text="开始运行" w="100" h="40" bg="#4CAF50"/>
            <button id="btnPause" text="暂停" w="80" h="40" bg="#FF9800" marginLeft="8"/>
            <button id="btnStop" text="停止" w="80" h="40" bg="#F44336" marginLeft="8"/>
        </horizontal>

        <card w="*" h="80" marginBottom="16">
            <vertical padding="12">
                <text text="当前账号: {{runningState.currentAccount}}" textSize="16"/>
                <text text="状态: {{runningState.status}}" textSize="16" textColor="#666666"/>
            </vertical>
        </card>

        <text text="功能开关:" textSize="18" marginBottom="8"/>

        <vertical marginBottom="16">
            <checkbox id="chkAutoLogin" text="自动登录/切换账号" checked="{{featureToggles.autoLogin}}"/>
            <checkbox id="chkAutoRaid" text="自动抢资源" checked="{{featureToggles.autoRaid}}"/>
            <checkbox id="chkAutoUpgrade" text="自动升级" checked="{{featureToggles.autoUpgrade}}"/>
            <checkbox id="chkAutoDonate" text="自动捐赠" checked="{{featureToggles.autoDonate}}"/>
        </vertical>

        <horizontal gravity="center">
            <button id="btnAccount" text="账号管理" w="100" h="40"/>
            <button id="btnUpgrade" text="升级配置" w="100" h="40" marginLeft="8"/>
            <button id="btnSettings" text="设置" w="100" h="40" marginLeft="8"/>
        </horizontal>
    </vertical>
);

// 按钮事件
ui.btnStart.click(function() {
    if (!runningState.isRunning || runningState.status === "已暂停") {
        runningState.isRunning = true;
        runningState.status = "运行中";
        ui.btnStart.setText("运行中");
        ui.btnStart.attr("bg", "#9E9E9E");

        common.log("开始运行");

        // 启动悬浮窗
        let floaty_ui = require("./floaty_ui.js");
        floaty_ui.init(runningState, featureToggles);

        // TODO: 启动主循环 (Phase 2实现)
    }
});

ui.btnPause.click(function() {
    if (runningState.isRunning) {
        runningState.status = runningState.status === "已暂停" ? "运行中" : "已暂停";
        common.log("状态切换: " + runningState.status);
    }
});

ui.btnStop.click(function() {
    if (runningState.isRunning) {
        runningState.isRunning = false;
        runningState.status = "已停止";
        ui.btnStart.setText("开始运行");
        ui.btnStart.attr("bg", "#4CAF50");

        common.log("停止运行");

        // 关闭悬浮窗
        let floaty_ui = require("./floaty_ui.js");
        floaty_ui.close();
    }
});

// 复选框事件
ui.chkAutoLogin.on("check", function(checked) {
    featureToggles.autoLogin = checked;
    common.log("自动登录开关: " + (checked ? "开启" : "关闭"));
});

ui.chkAutoRaid.on("check", function(checked) {
    featureToggles.autoRaid = checked;
    common.log("自动抢资源开关: " + (checked ? "开启" : "关闭"));
});

ui.chkAutoUpgrade.on("check", function(checked) {
    featureToggles.autoUpgrade = checked;
    common.log("自动升级开关: " + (checked ? "开启" : "关闭"));
});

ui.chkAutoDonate.on("check", function(checked) {
    featureToggles.autoDonate = checked;
    common.log("自动捐赠开关: " + (checked ? "开启" : "关闭"));
});

// 子界面按钮
ui.btnAccount.click(function() {
    let account_ui = require("./account_ui.js");
    account_ui.show(accountsConfig, function(updated) {
        accountsConfig = updated;
        files.write(files.path("./config/accounts.json"), JSON.stringify(accountsConfig, null, 2));
        // 更新当前账号显示
        if (accountsConfig.accounts.length > 0) {
            runningState.currentAccount = accountsConfig.accounts[0].name;
        }
    });
});

ui.btnUpgrade.click(function() {
    let upgrade_ui = require("./upgrade_ui.js");
    upgrade_ui.show(upgradeConfig, function(updated) {
        upgradeConfig = updated;
        files.write(files.path("./config/upgrade_priority.json"), JSON.stringify(upgradeConfig, null, 2));
    });
});

ui.btnSettings.click(function() {
    let settings_ui = require("./settings_ui.js");
    settings_ui.show(common.loadSettings(), function(updated) {
        // 保存更新后的设置
        files.write(files.path("./config/settings.json"), JSON.stringify(updated, null, 2));
    });
});

// 导出模块
module.exports = {
    runningState: runningState,
    featureToggles: featureToggles
};