/**
 * 账号管理界面
 */

"ui";

let common = require("/modules/common.js");

// 加载账号配置
let accountsConfig = null;

// 编辑表单数据
let editForm = {
    name: "",
    qq: "",
    priority: "1",
    run_duration: "30"
};

// 回调函数
let callback = null;

// 当前编辑索引 (-1 表示新增)
let editingIndex = -1;

/**
 * 显示账号管理界面
 * @param {object} config - 账号配置
 * @param {function} cb - 回调函数
 */
function show(config, cb) {
    // Validate config and provide defaults if missing
    if (!config) {
        config = {};
    }
    if (!config.accounts || !Array.isArray(config.accounts)) {
        config.accounts = [];
    }
    if (config.auto_switch === undefined || config.auto_switch === null) {
        config.auto_switch = false;
    }
    if (!config.switch_interval) {
        config.switch_interval = 30;
    }

    accountsConfig = config;
    callback = cb;

    editingIndex = -1;

    // 显示界面
    ui.show();
}

// 主界面布局
ui.layout(
    <vertical padding="16">
        <text text="账号管理" textSize="20" textColor="#3399FF" marginBottom="12"/>

        <horizontal marginBottom="8">
            <checkbox id="chkAutoSwitch" text="自动切换账号"/>
            <text text="切换间隔(分钟):" marginLeft="16"/>
            <input id="inputSwitchInterval" w="60" inputType="number"/>
        </horizontal>

        <list id="accountListView" w="*" h="250">
            <vertical w="*" padding="8" bg="#EEEEEE" marginBottom="4">
                <text text="{{name}}" textSize="16" textColor="#333333"/>
                <text text="QQ: {{qq}} | 优先级: {{priority}} | 运行时长: {{run_duration}}分钟" textSize="12" textColor="#666666"/>
                <horizontal marginTop="4">
                    <button id="btnEdit" text="编辑" w="50" h="30" tag="{{this.position}}"/>
                    <button id="btnDelete" text="删除" w="50" h="30" bg="#F44336" marginLeft="4" tag="{{this.position}}"/>
                </horizontal>
            </vertical>
        </list>

        <button id="btnAdd" text="添加账号" w="*" h="40" bg="#4CAF50" marginBottom="12"/>

        <card w="*" h="auto" marginBottom="12" id="editCard" visibility="gone">
            <vertical padding="12">
                <text id="editTitle" text="添加账号" textSize="16" marginBottom="8"/>

                <horizontal marginBottom="4">
                    <text text="账号名称:" w="80"/>
                    <input id="inputName" w="*"/>
                </horizontal>

                <horizontal marginBottom="4">
                    <text text="QQ号:" w="80"/>
                    <input id="inputQQ" w="*" inputType="number"/>
                </horizontal>

                <horizontal marginBottom="4">
                    <text text="优先级:" w="80"/>
                    <input id="inputPriority" w="*" inputType="number"/>
                </horizontal>

                <horizontal marginBottom="4">
                    <text text="运行时长(分钟):" w="100"/>
                    <input id="inputDuration" w="*" inputType="number"/>
                </horizontal>

                <horizontal marginTop="8">
                    <button id="btnSave" text="保存" w="80" h="36" bg="#4CAF50"/>
                    <button id="btnCancel" text="取消" w="80" h="36" marginLeft="8"/>
                </horizontal>
            </vertical>
        </card>

        <button id="btnBack" text="返回" w="*" h="40" marginTop="8"/>
    </vertical>
);

// 初始化列表
function initList() {
    if (accountsConfig && accountsConfig.accounts) {
        ui.accountListView.setDataSource(accountsConfig.accounts);
        ui.chkAutoSwitch.setChecked(accountsConfig.auto_switch);
        ui.inputSwitchInterval.setText(String(accountsConfig.switch_interval || 30));
    }
}

// 显示编辑面板
function showEditPanel(index) {
    editingIndex = index;

    if (index >= 0 && index < accountsConfig.accounts.length) {
        // 编辑模式
        let account = accountsConfig.accounts[index];
        ui.editTitle.setText("编辑账号");
        ui.inputName.setText(account.name);
        ui.inputQQ.setText(account.qq || "");
        ui.inputPriority.setText(String(account.priority));
        ui.inputDuration.setText(String(account.run_duration));
    } else {
        // 添加模式
        ui.editTitle.setText("添加账号");
        ui.inputName.setText("账号" + (accountsConfig.accounts.length + 1));
        ui.inputQQ.setText("");
        ui.inputPriority.setText(String(accountsConfig.accounts.length + 1));
        ui.inputDuration.setText("30");
    }

    ui.editCard.attr("visibility", "visible");
}

// 隐藏编辑面板
function hideEditPanel() {
    editingIndex = -1;
    ui.editCard.attr("visibility", "gone");
}

// 自动切换复选框
ui.chkAutoSwitch.on("check", function(checked) {
    accountsConfig.auto_switch = checked;
});

// 切换间隔输入
ui.inputSwitchInterval.on("text_change", function(text) {
    accountsConfig.switch_interval = parseInt(text) || 30;
});

// 列表项绑定
ui.accountListView.on("item_bind", function(itemView, itemHolder) {
    itemView.btnEdit.click(function() {
        let position = parseInt(this.tag);
        showEditPanel(position);
    });

    itemView.btnDelete.click(function() {
        let position = parseInt(this.tag);
        // Bounds validation before accessing array
        if (position < 0 || position >= accountsConfig.accounts.length) {
            toast("无效的账号索引");
            return;
        }
        dialogs.confirm("确认删除", "是否删除账号: " + accountsConfig.accounts[position].name + "?")
            .then(function(confirm) {
                if (confirm) {
                    accountsConfig.accounts.splice(position, 1);
                    ui.accountListView.setDataSource(accountsConfig.accounts);
                    common.log("删除账号: " + position);
                }
            });
    });
});

// 添加按钮
ui.btnAdd.click(function() {
    showEditPanel(accountsConfig.accounts.length);
});

// 保存按钮
ui.btnSave.click(function() {
    let name = ui.inputName.text().trim();

    // Input validation: name must not be empty
    if (!name) {
        toast("账号名称不能为空");
        return;
    }

    let newAccount = {
        name: name,
        qq: ui.inputQQ.text(),
        priority: parseInt(ui.inputPriority.text()) || 1,
        run_duration: parseInt(ui.inputDuration.text()) || 30
    };

    if (editingIndex >= 0 && editingIndex < accountsConfig.accounts.length) {
        accountsConfig.accounts[editingIndex] = newAccount;
        common.log("修改账号: " + newAccount.name);
    } else {
        accountsConfig.accounts.push(newAccount);
        common.log("添加账号: " + newAccount.name);
    }

    ui.accountListView.setDataSource(accountsConfig.accounts);
    hideEditPanel();
});

// 取消按钮
ui.btnCancel.click(function() {
    hideEditPanel();
});

// 返回按钮
ui.btnBack.click(function() {
    if (callback) {
        callback(accountsConfig);
    }
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
