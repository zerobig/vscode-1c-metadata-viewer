'use strict';

import * as vscode from 'vscode';
import { MetadataView, TreeItem } from './metadataView';
import * as fs from 'fs';

export function activate(context: vscode.ExtensionContext) {
	const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;

	vscode.commands.registerCommand('metadataViewer.openAppModule', (node: TreeItem) => {
		const filePath = rootPath + '/Ext/ManagedApplicationModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openSessionModule', (node: TreeItem) => {
		const filePath = rootPath + '/Ext/SessionModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openExternalConnectionModule', (node: TreeItem) => {
		// TODO: Имя модуля проверить. Может быть не верным.
		const filePath = rootPath + '/Ext/ExternalConnectionModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openObjectModule', (node: TreeItem) => {
		const filePath = rootPath + '/' + node.path + '/Ext/ObjectModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openManagerModule', (node: TreeItem) => {
		const filePath = rootPath + '/' + node.path + '/Ext/ManagerModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openForm', (node: TreeItem) => {
		const filePath = rootPath + '/' + node.path + '/Forms/' + node.label + '/Ext/Form/Module.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openModule', (node: TreeItem) => {
		const filePath = rootPath + '/CommonModules/' + node.label + '/Ext/Module.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openCommandModule', (node: TreeItem) => {
		const filePath = rootPath + '/' + node.path + '/Commands/' + node.label + '/Ext/CommandModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openRecordSetModule', (node: TreeItem) => {
		const filePath = rootPath + '/' + node.path + '/Ext/RecordSetModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openValueManagerModule', (node: TreeItem) => {
		const filePath = rootPath + '/Constants/' + node.label + '/Ext/ValueManagerModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openXml', (node: TreeItem) => {
		const filePath = rootPath + '/' + node.path + '.xml';
		OpenFile(filePath);
	});

	new MetadataView(context);
}

function OpenFile(filePath: string) {
	const openPath = vscode.Uri.parse('file:///' + filePath);
	if (fs.existsSync(filePath)) {
		vscode.workspace.openTextDocument(openPath).then(doc => {
			vscode.window.showTextDocument(doc);
		});
	} else {
		vscode.window
			.showInformationMessage(`File ${filePath} does not exist. Create?`, 'Yes', 'No')
			.then(answer => {
				if (answer === 'Yes') {
					// TODO: Кроме собственно создания файла наверное надо что-то писать в XML? Наверняка нужно...
					vscode.workspace.fs.writeFile(openPath, new Uint8Array).then(_ => {
						vscode.window.showInformationMessage(`File ${filePath} is creted!`);
						vscode.workspace.openTextDocument(openPath).then(doc => {
							vscode.window.showTextDocument(doc);
						});
					});
				}
			});	
	}
}