'use strict';

import * as vscode from 'vscode';
import { MetadataView } from './metadataView';
import * as fs from 'fs';
import { FormPreviewer } from './formPreviewer';
import { TreeItem } from './ConfigurationFormats/utils';

export function activate(context: vscode.ExtensionContext) {
	vscode.commands.registerCommand('metadataViewer.openAppModule', (node: TreeItem) => {
		const filePath = node.path + '/Ext/ManagedApplicationModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openSessionModule', (node: TreeItem) => {
		const filePath = node.path + '/Ext/SessionModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openExternalConnectionModule', (node: TreeItem) => {
		// TODO: Имя модуля проверить. Может быть не верным.
		const filePath = node.path + '/Ext/ExternalConnectionModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openObjectModule', (node: TreeItem) => {
		const filePath = node.path + '/Ext/ObjectModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openManagerModule', (node: TreeItem) => {
		const filePath = node.path + '/Ext/ManagerModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openForm', (node: TreeItem) => {
		const filePath = node.path + '/Ext/Form/Module.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.previewForm', (node: TreeItem) => {
		const filePath = node.path + '/Ext/Form.xml';
		const objectPathArray = node.path?.split('/');
		const rootFilePath = objectPathArray?.slice(0, -2)?.join('/') + '.xml';
		const confPath = objectPathArray?.slice(0, -4)?.join('/');
		PreviewForm(confPath ?? '', rootFilePath, filePath, context.extensionUri, node.label);
	});
	vscode.commands.registerCommand('metadataViewer.openModule', (node: TreeItem) => {
		const filePath = node.path + '/Ext/Module.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openCommandModule', (node: TreeItem) => {
		const filePath = node.path + '/Ext/CommandModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openRecordSetModule', (node: TreeItem) => {
		const filePath = node.path + '/Ext/RecordSetModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openValueManagerModule', (node: TreeItem) => {
		const filePath = node.path + '/Ext/ValueManagerModule.bsl';
		OpenFile(filePath);
	});
	vscode.commands.registerCommand('metadataViewer.openXml', (node: TreeItem) => {
		let filePath = '';
		if (node.isConfiguration) {
			filePath = node.path + '/Configuration.xml';
		} else {
			filePath = node.path + '.xml';
		}
		OpenFile(filePath);
	});

	new MetadataView(context);
}

function OpenFile(filePath: string) {
	const openPath = vscode.Uri.file(filePath);
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

function PreviewForm(confPath: string,
	rootFilePath: string,
	filePath: string,
	extensionUri: vscode.Uri,
	nodeDescription?: string | vscode.TreeItemLabel
) {
	const previewer = new FormPreviewer(confPath, rootFilePath, filePath);
	previewer.openPreview(extensionUri, nodeDescription);
}
