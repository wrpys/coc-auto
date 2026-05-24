/**
 * 运行设置界面
 */

"ui";

let common = require("/modules/common.js");

// 设置数据
let settings = null;
let callback = null;

/**
 * 显示设置界面
 * @param {object} config - 设置配置
 * @param {function} cb - 回调函数
 */
function show(config, cb) {
    settings = config || {};
    callback = cb;
    ui.show();
}

// 主界面布局
ui.layout(
    <scroll>
        <vertical padding="16">
            <text text="运行设置" textSize="20" textColor="#3399FF" marginBottom="12"/>

            <!-- 运行时间段 -->
            <card w="*" h="auto" marginBottom="12">
                <vertical padding="12">
                    <text text="运行时间段" textSize="16" textColor="#333333" marginBottom="8"/>

                    <horizontal marginBottom="4">
                        <text text="开始时间:" w="80"/>
                        <input id="inputStartTime" w="80" hint="HH:mm"/>
                        <text text="结束时间:" w="80" marginLeft="16"/>
                        <input id="inputEndTime" w="80" hint="HH:mm"/>
                    </horizontal>
                </vertical>
            </card>

            <!-- 搜索资源阈值 -->
            <card w="*" h="auto" marginBottom="12">
                <vertical padding="12">
                    <text text="搜索资源阈值" textSize="16" textColor="#333333" marginBottom="8"/>

                    <horizontal marginBottom="4">
                        <text text="金币最低值:" w="100"/>
                        <input id="inputGoldMin" w="*" inputType="number"/>
                    </horizontal>

                    <horizontal marginBottom="4">
                        <text text="圣水最低值:" w="100"/>
                        <input id="inputElixirMin" w="*" inputType="number"/>
                    </horizontal>

                    <horizontal marginBottom="4">
                        <text text="黑暗圣水最低值:" w="120"/>
                        <input id="inputDarkMin" w="*" inputType="number"/>
                    </horizontal>

                    <horizontal marginBottom="4">
                        <text text="攻击策略:" w="80"/>
                        <spinner id="spinnerStrategy" w="*" entries="standard,barch,goblin"/>
                    </horizontal>
                </vertical>
            </card>

            <!-- 捐赠配置 -->
            <card w="*" h="auto" marginBottom="12">
                <vertical padding="12">
                    <text text="捐赠配置" textSize="16" textColor="#333333" marginBottom="8"/>

                    <checkbox id="chkDonateEnabled" text="启用自动捐赠" marginBottom="8"/>

                    <horizontal marginBottom="4">
                        <text text="捐赠兵种:" w="80"/>
                        <input id="inputDonateTroops" w="*" hint="barbarian,archer"/>
                    </horizontal>

                    <horizontal marginBottom="4">
                        <text text="每次上限:" w="80"/>
                        <input id="inputDonateMax" w="*" inputType="number"/>
                    </horizontal>

                    <horizontal marginBottom="4">
                        <text text="检查间隔(秒):" w="100"/>
                        <input id="inputDonateInterval" w="*" inputType="number"/>
                    </horizontal>
                </vertical>
            </card>

            <!-- 延迟设置 -->
            <card w="*" h="auto" marginBottom="12">
                <vertical padding="12">
                    <text text="延迟设置(毫秒)" textSize="16" textColor="#333333" marginBottom="8"/>

                    <horizontal marginBottom="4">
                        <text text="点击延迟:" w="80"/>
                        <input id="inputClickMin" w="60" inputType="number"/>
                        <text text="-" w="20" gravity="center"/>
                        <input id="inputClickMax" w="60" inputType="number"/>
                    </horizontal>

                    <horizontal marginBottom="4">
                        <text text="动作延迟:" w="80"/>
                        <input id="inputActionMin" w="60" inputType="number"/>
                        <text text="-" w="20" gravity="center"/>
                        <input id="inputActionMax" w="60" inputType="number"/>
                    </horizontal>
                </vertical>
            </card>

            <button id="btnSave" text="保存设置" w="*" h="40" bg="#4CAF50"/>
            <button id="btnBack" text="返回" w="*" h="40" marginTop="8"/>
        </vertical>
    </scroll>
);

// 初始化表单
function initForm() {
    // 时间段
    ui.inputStartTime.setText(settings.schedule ? settings.schedule.start_time : "08:00");
    ui.inputEndTime.setText(settings.schedule ? settings.schedule.end_time : "23:00");

    // 资源阈值
    ui.inputGoldMin.setText(String(settings.raid ? settings.raid.gold_min : 100000));
    ui.inputElixirMin.setText(String(settings.raid ? settings.raid.elixir_min : 100000));
    ui.inputDarkMin.setText(String(settings.raid ? settings.raid.dark_min : 500));

    // 攻击策略
    if (settings.raid && settings.raid.attack_strategy) {
        let strategies = ["standard", "barch", "goblin"];
        let index = strategies.indexOf(settings.raid.attack_strategy);
        ui.spinnerStrategy.setSelection(index >= 0 ? index : 0);
    }

    // 捐赠配置
    ui.chkDonateEnabled.setChecked(settings.donate ? settings.donate.enabled : true);
    ui.inputDonateTroops.setText(settings.donate ? settings.donate.troops.join(",") : "barbarian,archer");
    ui.inputDonateMax.setText(String(settings.donate ? settings.donate.max_count : 5));
    ui.inputDonateInterval.setText(String(settings.donate ? settings.donate.check_interval : 10));

    // 延迟设置
    ui.inputClickMin.setText(String(settings.delay ? settings.delay.click_min : 500));
    ui.inputClickMax.setText(String(settings.delay ? settings.delay.click_max : 1500));
    ui.inputActionMin.setText(String(settings.delay ? settings.delay.action_min : 1000));
    ui.inputActionMax.setText(String(settings.delay ? settings.delay.action_max : 3000));
}

// 保存按钮
ui.btnSave.click(function() {
    let newSettings = {
        schedule: {
            start_time: ui.inputStartTime.text(),
            end_time: ui.inputEndTime.text()
        },
        raid: {
            gold_min: parseInt(ui.inputGoldMin.text()) || 100000,
            elixir_min: parseInt(ui.inputElixirMin.text()) || 100000,
            dark_min: parseInt(ui.inputDarkMin.text()) || 500,
            attack_strategy: ui.spinnerStrategy.getSelectedItem()
        },
        donate: {
            enabled: ui.chkDonateEnabled.isChecked(),
            troops: ui.inputDonateTroops.text().split(",").map(function(t) { return t.trim(); }).filter(function(t) { return t; }),
            max_count: parseInt(ui.inputDonateMax.text()) || 5,
            check_interval: parseInt(ui.inputDonateInterval.text()) || 10
        },
        delay: {
            click_min: parseInt(ui.inputClickMin.text()) || 500,
            click_max: parseInt(ui.inputClickMax.text()) || 1500,
            action_min: parseInt(ui.inputActionMin.text()) || 1000,
            action_max: parseInt(ui.inputActionMax.text()) || 3000
        }
    };

    settings = newSettings;

    toast("设置已保存");
    common.log("保存运行设置");
});

// 返回按钮
ui.btnBack.click(function() {
    if (callback) {
        callback(settings);
    }
    ui.finish();
});

// 界面显示时初始化
ui.emitter.on("resume", function() {
    initForm();
});

// 导出模块
module.exports = {
    show: show
};