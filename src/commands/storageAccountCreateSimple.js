var vscode = require('vscode');
var ux = require('../ux');
var config = require('../config');
var constants = config.getConstants();

exports.createCommand = function createCommand(state) {
    vscode.commands.registerCommand('createstorageaccount.simple', function () {
        vscode.window.showInputBox({
            prompt: constants.promptCreateNewStorageAccount
        }).then(function (newStorageAccountName) {

            if (!newStorageAccountName || newStorageAccountName === "") return;

            state.selectedStorageAccount = newStorageAccountName;
            state.resourceGroupToUse = state.selectedStorageAccount + 'Resources';

            ux.ifStorageAccountNameIsAvailable(state).then(() => {
                vscode.window.showQuickPick([
                    constants.optionExistingRg,
                    constants.optionNewRg
                ]).then(selected => {
                    if (selected == constants.optionExistingRg) {
                        ux
                            .getResourceGroups(state)
                            .then(function () {
                                vscode.window.showQuickPick(state.resourceGroupList)
                                    .then(function (selectedRg) {
                                        if (!selectedRg) return;
                                        state.resourceGroupToUse = selectedRg;
                                        ux.createStorageAccount(state);
                                    });
                            })
                            .catch(function (err) {
                                vscode.window.showErrorMessage(err);
                            });
                    }
                    else if (selected == constants.optionNewRg) {
                        vscode.window.showInputBox({
                            prompt: constants.promptNewRgName
                        }).then(function (newResourceGroupName) {
                            state.resourceGroupToUse = newResourceGroupName;
                            ux.createResourceGroup(state, () => {
                                ux.createStorageAccount(state);
                            });
                        });
                    }
                });

            }).catch((message) => {
                vscode.window.showErrorMessage(message);
            });
        });
    });
};