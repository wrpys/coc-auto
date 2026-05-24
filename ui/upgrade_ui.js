/**
 * 升级配置界面
 */

"ui";

let common = require("/modules/common.js");

// 升级优先级数据
let upgradeConfig = null;
let priorityList = null;
let callback = null;
let selectedIndex = -1;

/**
 * 显示升级配置界面
 * @param {object} config - 升级配置
 * @param {function} cb - 回调函数
 */
function show(config, cb) {
    // Validate config and provide defaults if missing
    if (!config) {
        config = {};
    }
    if (!config.priority || !Array.isArray(config.priority)) {
        config.priority = [];
    }

    upgradeConfig = config;
    priorityList = upgradeConfig.priority;
    callback = cb;
    selectedIndex = -1;

    // 显示界面
    ui.show();
}

// 默认优先级列表
function getDefaultPriority() {
    return [
        { type: "townhall", name: "大本营", enabled: true },
        { type: "goldmine", name: "金矿", enabled: true },
        { type: "elixircollector", name: "圣水收集器", enabled: true },
        { type: "darkdrill", name: "黑暗圣水钻井", enabled: true },
        { type: "storage", name: "储存器", enabled: true },
        { type: "wall", name: "城墙", enabled: true },
        { type: "defense", name: "防御建筑", enabled: false },
        { type: "other", name: "其他", enabled: false }
    ];
}

// 主界面布局
ui.layout(
    <vertical padding="16">
        <text text="升级优先级配置" textSize="20" textColor="#3399FF" marginBottom="12"/>

        <text text="选择项目后可上下调整优先级顺序（越靠前优先级越高）" textSize="12" textColor="#666666" marginBottom="8"/>

        <list id="priorityListView" w="*" h="350">
            <vertical w="*" padding="12" bg="#EEEEEE" marginBottom="4">
                <horizontal>
                    <text id="priorityNum" textSize="14" textColor="#999999" w="30"/>
                    <text id="nameText" textSize="16" textColor="#333333" w="100"/>
                    <checkbox id="chkEnabled" text="启用" w="60"/>
                </horizontal>
            </vertical>
        </list>

        <horizontal gravity="center" marginTop="8">
            <button id="btnMoveUp" text="↑ 上移" w="120" h="40"/>
            <button id="btnMoveDown" text="↓ 下移" w="120" h="40" marginLeft="8"/>
        </horizontal>

        <horizontal gravity="center" marginTop="12">
            <button id="btnReset" text="重置默认" w="100" h="40"/>
            <button id="btnBack" text="保存返回" w="100" h="40" bg="#4CAF50" marginLeft="8"/>
        </horizontal>
    </vertical>
);

// 初始化列表
function initList() {
    if (priorityList && priorityList.length > 0) {
        ui.priorityListView.setDataSource(priorityList);
    } else {
        // 如果列表为空，使用默认值
        priorityList = getDefaultPriority();
        upgradeConfig.priority = priorityList;
        ui.priorityListView.setDataSource(priorityList);
    }
}

// 列表项点击选择
ui.priorityListView.on("item_click", function(item, position) {
    selectedIndex = position;
    toast("已选择: " + item.name + " (优先级 " + (position + 1) + ")");
});

// 列表项绑定
ui.priorityListView.on("item_bind", function(itemView, itemHolder) {
    // 绑定checkbox变化
    itemView.chkEnabled.on("check", function(checked) {
        let position = itemHolder.position;
        if (position >= 0 && position < priorityList.length) {
            priorityList[position].enabled = checked;
        }
    });
});

// 列表项数据绑定
ui.priorityListView.on("item_data_bind", function(itemView, itemData, itemHolder) {
    itemView.priorityNum.setText(String(itemHolder.position + 1));
    itemView.nameText.setText(itemData.name);
    itemView.chkEnabled.setChecked(itemData.enabled);
});

// 上移按钮
ui.btnMoveUp.click(function() {
    if (selectedIndex < 0) {
        toast("请先选择一个项目");
        return;
    }
    if (selectedIndex > 0) {
        let temp = priorityList[selectedIndex];
        priorityList[selectedIndex] = priorityList[selectedIndex - 1];
        priorityList[selectedIndex - 1] = temp;
        selectedIndex--;
        ui.priorityListView.setDataSource(priorityList);
        common.log("上移优先级: " + temp.name);
    } else {
        toast("已是最高优先级");
    }
});

// 下移按钮
ui.btnMoveDown.click(function() {
    if (selectedIndex < 0) {
        toast("请先选择一个项目");
        return;
    }
    if (selectedIndex < priorityList.length - 1) {
        let temp = priorityList[selectedIndex];
        priorityList[selectedIndex] = priorityList[selectedIndex + 1];
        priorityList[selectedIndex + 1] = temp;
        selectedIndex++;
        ui.priorityListView.setDataSource(priorityList);
        common.log("下移优先级: " + temp.name);
    } else {
        toast("已是最低优先级");
    }
});

// 重置按钮
ui.btnReset.click(function() {
    dialogs.confirm("确认重置", "是否将优先级列表重置为默认值?")
        .then(function(confirm) {
            if (confirm) {
                priorityList = getDefaultPriority();
                upgradeConfig.priority = priorityList;
                selectedIndex = -1;
                ui.priorityListView.setDataSource(priorityList);
                common.log("重置升级优先级为默认值");
            }
        });
});

// 返回按钮
ui.btnBack.click(function() {
    upgradeConfig.priority = priorityList;
    if (callback) {
        callback(upgradeConfig);
    }
    common.log("保存升级优先级配置");
    ui.finish();
});

// 界面显示时初始化
ui.emitter.on("resume", function() {
    initList();
});

// 导出模块
module.exports = {
    show: show
};
