import * as vscode from 'vscode';
import { PredefinedData } from './predefinedDataInterfaces';

export class PredefinedDataPanel {
	public static show(extensionUri: vscode.Uri, data: PredefinedData) {
    console.log(JSON.stringify(data));
	}
}