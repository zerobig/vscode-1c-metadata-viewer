import { json } from 'stream/consumers';
import * as vscode from 'vscode';
import { TemplateColumn, TemplateDocument, TemplateMergeCells, TemplateRow } from './templatInterfaces';

export class TemplatePanel {

  public static readonly viewType = 'metadataViewer.templatePanel';

  public static show(extensionUri: vscode.Uri, document: TemplateDocument) {
		const column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;

		const panel = vscode.window.createWebviewPanel(
			TemplatePanel.viewType,
			"Макет",
			column || vscode.ViewColumn.One
		);

		panel.webview.html = this._getHtmlForWebview(panel.webview, extensionUri, document);
	}

	private static _getHtmlForWebview(webview: vscode.Webview, extensionUri: vscode.Uri, document: TemplateDocument) {
		const styleUri = webview.asWebviewUri(vscode.Uri.joinPath(extensionUri, 'media', 'template', 'styles.css'));

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
          <table style="width: 800px; max-width: 800px; table-layout: fixed; white-space: nowrap; border-color: #333;" rules="all">
            <thead>
              <tr>
                <th style="max-width: 30px; width: 30px;"></th>
                ${document.columns[0]
                  .columnsItem
                  .map((c, index) => {
                    const formatIndex = Number(c.column[0].formatIndex[0]) - 1;
                    const columnWidth = document.format[formatIndex].width[0];
                    
                    return '<th' + (document.format[formatIndex] ?
                      ` style="max-width: ${columnWidth}px; width: ${columnWidth}px;"` :
                      '') + `>${index + 1}</th>`;
                  }).join('')}
              </tr>
            </thead>
            ${(() => {
              let indexRow = 0;
              return document.rowsItem.map((_) => {
                let additionalRows = '';
                for(let i = indexRow; i < Number(_.index) - 1; i++) {
                  // TODO: Высота из формата
                  additionalRows += `<tr style="height: 20px;"><td style="text-align: center;">${++indexRow + 1}</td></tr>`;
                }
                indexRow = Number(_.index);
                return additionalRows + _getRow(_, document);
              }).join('');
            })()}
          </table>
        </body>
      </html>`;
	}
}

function _getRow(templateRow: TemplateRow, document: TemplateDocument) {
  const indexRow = Number(templateRow.index);
  // TODO: Высота из формата
  return `<tr style="height: 20px;">
    <td style="text-align: center;">${indexRow + 1}</td>
    ${(() => templateRow.row.map(column => _getColumn(column, indexRow, document)).join(''))()}
  </tr>`;
}

function _getColumn(templatecolumn: TemplateColumn, indexRow: number, document: TemplateDocument) {
  if (templatecolumn.c) {
    let indexColumn = 0;
    let merge: TemplateMergeCells[] = [];
    let mergeSkipColumns = 0;
    return templatecolumn.c.map((c) => {
      let additionalColumns = '';
      if (c.i) {
        for(let i = indexColumn + (HasMergeColumns(merge) ? Number(merge[0].w) : 0); i < Number(c.i[0]); i++){
          additionalColumns += '<td></td>';
        }
        indexColumn = Number(c.i[0]);
      } else if (mergeSkipColumns !== 0) {
        merge = [];
        mergeSkipColumns--;
        indexColumn++;
        return;
      }

      merge = document.merge.filter(m => m.r[0] == indexRow && m.c[0] == indexColumn);

      const hasMergeColumns = HasMergeColumns(merge);
      const hasMergeRows = HasMergeRows(merge);

      mergeSkipColumns = (hasMergeColumns ? Number(merge[0].w) : 0);
      indexColumn++;

      let style = '';
      const cellFormat = document.format[Number(c.c[0].f[0]) - 1];
      if (cellFormat) {
        if (cellFormat.horizontalAlignment) {
          if (cellFormat.horizontalAlignment[0].toLowerCase() === 'right' && !hasMergeColumns) {
            style += `float: right; text-align: right; border-top: 0; border-bottom: 0; border-left: 0;`;
          } else {
            style += `text-align: ${cellFormat.horizontalAlignment[0].toLowerCase()};`;
          }

          if (cellFormat.border && cellFormat.border[0] === '1') {
            style += ' border: 2px solid #fff;';
          }
          if (cellFormat.leftBorder && cellFormat.leftBorder[0] === '1') {
            style += ' left-border: 2px solid #fff;';
          }
          if (cellFormat.topBorder && cellFormat.topBorder[0] === '1') {
            style += ' top-border: 2px solid #fff;';
          }
          if (cellFormat.bottomBorder && cellFormat.bottomBorder[0] === '1') {
            style += ' bottom-border: 2px solid #fff;';
          }
          if (cellFormat.rightBorder && cellFormat.rightBorder[0] === '1') {
            style += ' right-border: 2px solid #fff;';
          }

          if (cellFormat.textPlacement && cellFormat.textPlacement[0] === 'Wrap') {
            style += ' white-space: normal;';
          }

          if (cellFormat.font && cellFormat.font[0] === '1') {
            // TODO:
          }
        }
      }
      if (style) {
        style = ' style="' + style + '"';
      }

      if (c.c.length !== 0 && c.c[0].parameter) {
        return `${additionalColumns}<td${hasMergeColumns ? ` colspan=${Number(merge[0].w[0]) + 1}` : ''}
          ${hasMergeRows ? ` rowspan=${Number(merge[0].h[0]) + 1}` : ''}${style}>
          &lt;${c.c[0].parameter[0]}&gt;
        </td>`;
      } else if (c.c[0].tl) {
        const tl = c.c[0].tl[0];
        if (tl) {
          return `${additionalColumns}<td${hasMergeColumns ? ` colspan=${Number(merge[0].w[0]) + 1}` : ''}
            ${hasMergeRows ? ` rowspan=${Number(merge[0].h[0]) + 1}` : ''}${style}>
            ${tl['v8:item'][0]['v8:content'][0]}
          </td>`;
        }
      } else if (additionalColumns) {
        return `${additionalColumns}<td${hasMergeColumns ? ` colspan=${Number(merge[0].w[0]) + 1}` : ''}
          ${hasMergeRows ? ` rowspan=${Number(merge[0].h[0]) + 1}` : ''}></td>`;
      } else {
        return `<td${hasMergeColumns ? ` colspan=${Number(merge[0].w[0]) + 1}` : ''}
          ${hasMergeRows ? ` rowspan=${Number(merge[0].h[0]) + 1}` : ''}></td>`;
      }
    }).join('');
  }
}

function HasMergeColumns(merge: TemplateMergeCells[]) {
  return merge && merge.length && merge[0].w;
}
function HasMergeRows(merge: TemplateMergeCells[]) {
  return merge && merge.length && merge[0].h;
}