import * as vscode from 'vscode';
import { PredefinedData, PredefinedDataItem } from './predefinedDataInterfaces';

export class PredefinedDataPanel {
  public static readonly viewType = 'metadataViewer.predefinedPanel';

  public static show(extensionUri: vscode.Uri, metadataName: string, data: PredefinedData) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		const panel = vscode.window.createWebviewPanel(
			PredefinedDataPanel.viewType,
			`Предопределенные элементы (${metadataName})`,
			column || vscode.ViewColumn.One
		);

		panel.webview.html = this._getHtmlForWebview(panel.webview, extensionUri, data);
	}

  private static _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri, data: PredefinedData) {
    const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'predefined', 'styles.css'));

    // TODO: иконка catalog.svg для других предопределенных элементов должна быть другой
    const isDark = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;

		const rootImagePath = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'resources', isDark ? 'dark' : 'light', 'catalog.svg'));
    const folderImagePath = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'resources', isDark ? 'dark' : 'light', 'folder.svg'));
    const elementImagePath = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'resources', isDark ? 'dark' : 'light', 'attribute.svg'));
  
    // TODO: разобраться с безопасностью ресурсов и переделать
    return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title></title>
          <link href="${styleUri}" rel="stylesheet" />
          </style>
        </head>
        <body>
          <table rules="all">
            <thead>
              <tr>
                <th style="min-width: 200px;">Имя</th>
                <th style="min-width: 100px;">Код</th>
                <th style="min-width: 500px;">Наименование</th>
              </tr>
            </thead>
            <tbody>
              ${data.Item.length === 0 ?
                '<tr><td colspan=3 style="height: 200px; text-align: center; vertical-align: middle;">Для данного объекта предопределенные элементы не созданы</td></tr>' :
                `<tr><td colspan="3"><img src="${rootImagePath}" width="16px" height="16px" style="margin-bottom: 3px; vertical-align: middle;" />&nbsp;Элементы</td></tr>
                  ${data.Item.map(i => CreateItem(i, [ folderImagePath, elementImagePath ], 1)).join('')}`
              }
            </tbody>
          </table>
        </body>
      </html>`;
  }
}

function CreateItem(item: PredefinedDataItem, imageUri: vscode.Uri[], level: number): string {
  return `<tr>
    <td>${(() => {
      if (item.IsFolder[0] === 'true') {
        return `<img src="${imageUri[0]}" width="16px" height="16px" style="margin-left: ${16 * level}px; margin-bottom: 3px; vertical-align: middle;" />`;
      } else {
        return `<img src="${imageUri[1]}" width="16px" height="16px" style="margin-left: ${16 * level}px; margin-bottom: 3px; vertical-align: middle;" />`;
      }
    })()}&nbsp;${item.Name}</td>
    <td>${item.Code}</td>
    <td>${item.Description}</td>
  </tr>
  ${(() => {
    if (item.ChildItems) {
      return item.ChildItems[0].Item.map(i => CreateItem(i, imageUri, level + 1)).join('');
    }

    return '';
  })()}`;
}
