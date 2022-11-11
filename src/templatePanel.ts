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
    let indexRow = 0;
    let hasColumndId = false;
    document.columns.forEach(columns => {
      if (columns.id) {
        hasColumndId = true;
      }
    });

    const mainColumns = document.columns.filter(columns => columns.size !== 0 && !columns.id);

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
          ${document.columns
            .filter(columns => columns.size !== 0)
            .map(columns => {
              let totalAdditionalColumns = 0;

              return `<table style="width: 800px; max-width: 800px; table-layout: fixed; white-space: nowrap; border-color: #333;" rules="all">
                <thead>
                  <tr>
                    <th style="max-width: 30px; width: 30px;"></th>
                    ${(columns
                      .columnsItem ?? [])
                      .map((c, index) => {
                        const formatIndex = c.column.formatIndex - 1;
                        const columnWidth = document.format[formatIndex].width ? document.format[formatIndex].width : '80';
                        
                        // Колонки могут быть пропущены. Вставляем. Ширину при этом берём из группы колонок без id
                        let additionalColumns = '';
                        for (let i = index + totalAdditionalColumns; i < c.index; i++) {
                          let columnWidth = '80';
                          if (mainColumns.length !== 0) {
                            const columnFromMain = mainColumns[0].columnsItem.filter(column => column.index === i);
                            if (columnFromMain.length !== 0) {
                              const formatIndex = columnFromMain[0].column.formatIndex - 1;
                              columnWidth = document.format[formatIndex].width ? document.format[formatIndex].width : '80';
                            }
                          }

                          additionalColumns += `<th style="max-width:${columnWidth}px; width: ${columnWidth}px;">${i + 1}</th>`;
                          totalAdditionalColumns++;
                        }

                        return `${additionalColumns}<th` + (document.format[formatIndex] ?
                          ` style="max-width: ${columnWidth}px; width: ${columnWidth}px;"` :
                          '') + `>${index + totalAdditionalColumns + 1}</th>`;
                      }).join('')}
                    ${(() => {
                      // Таблица может быть не закончена. Заканчиваем. Ширину при этом берём из группы колонок без id
                      let lastColumns = '';

                      // Нет основной группы колонок => неоткуда брать формат колонок для окончания таблицы => пропускаем.
                      if (mainColumns.length !== 0) {
                        for(let i = (columns.columnsItem ?? []).length + totalAdditionalColumns; i < columns.size; i++) {
                          const formatIndex = Number(mainColumns[0].columnsItem
                            .filter(column => column.index === i)[0].column.formatIndex) - 1;
                          const columnWidth = document.format[formatIndex].width ? document.format[formatIndex].width : '80';

                          lastColumns += `<th style="max-width:${columnWidth}px; width: ${columnWidth}px;">${i + 1}</th>`;
                        }
                      }

                      return lastColumns;
                    })()}
                  </tr>
                </thead>
                ${(() => {
                  return document.rowsItem
                    .filter(ri => hasColumndId ?
                      (ri.row.columnsID && columns.id ?
                        ri.row.columnsID === columns.id :
                        !columns.id ? !ri.row.columnsID : false) :
                      true)
                    .map((_) => {
                      let additionalRows = '';
                      for(let i = indexRow; i < _.index - 1; i++) {
                        // TODO: Высота из формата
                        additionalRows += `<tr style="height: 20px;"><td style="text-align: center;">${++indexRow + 1}</td></tr>`;
                        indexRow++;
                      }
                      indexRow = _.index;
                      return additionalRows + _getRow(_, document);
                    }).join('');
                })()}
              </table>`;
            })
          }
        </body>
      </html>`;
	}
}

function _getRow(templateRow: TemplateRow, document: TemplateDocument) {
  const indexRow = templateRow.index;
  // TODO: Высота из формата
  return `<tr style="height: 20px;">
    <td style="text-align: center;">${indexRow + 1}</td>
    ${_getColumn(templateRow.row, indexRow, document)}
  </tr>`;
}

function _getColumn(templatecolumn: TemplateColumn, indexRow: number, document: TemplateDocument) {
  if (templatecolumn.c) {
    let indexColumn = 0;
    let merge: TemplateMergeCells[] = [];
    let mergeSkipColumns = 0;

    const rowMerge = FindRowMerge(indexRow, document.merge);

    return templatecolumn.c.map((c) => {

      let additionalColumns = '';

      if (c.i) {
        let mergeSkipRows = 0;
        const mergeRows = rowMerge.filter(rm => rm.c + 1 >= indexColumn && rm.c + 1 <= c.i);
        if (mergeRows.length !== 0) {
          mergeSkipRows = mergeRows.reduce((previous, current) => {
            previous += current.w + 1;
            return previous;
          }, 0);
        }
        for(let i = indexColumn + (HasMergeColumns(merge) ? merge[0].w : 0) + mergeSkipRows; i < c.i; i++){
          additionalColumns += '<td></td>';
        }
        indexColumn = c.i;
      } else if (mergeSkipColumns !== 0) {
        merge = [];
        mergeSkipColumns--;
        indexColumn++;
        return;
      }

      merge = document.merge.filter(m => m.r == indexRow && m.c == indexColumn);

      const hasMergeColumns = HasMergeColumns(merge);
      const hasMergeRows = HasMergeRows(merge);

      mergeSkipColumns = (hasMergeColumns ? merge[0].w : 0);
      indexColumn++;

      let style = '';
      const cellFormat = document.format[c.c.f - 1];
      if (cellFormat) {
        if (cellFormat.horizontalAlignment) {
          if (cellFormat.horizontalAlignment.toLowerCase() === 'right' && !hasMergeColumns) {
            style += `float: right; text-align: right; border-top: 0; border-bottom: 0; border-left: 0;`;
          } else {
            style += `text-align: ${cellFormat.horizontalAlignment.toLowerCase()};`;
          }
        }

        const borderColor = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ? '#fff' : '#000';
        if (cellFormat.border && cellFormat.border === 1) {
          style += ` border: 2px solid ${borderColor};`;
        }
        if (cellFormat.leftBorder && cellFormat.leftBorder === 1) {
          style += ` border-left: 2px solid ${borderColor};`;
        }
        if (cellFormat.topBorder && cellFormat.topBorder === 1) {
          style += ` border-top: 2px solid ${borderColor};`;
        }
        if (cellFormat.bottomBorder && cellFormat.bottomBorder === 1) {
          style += ` border-bottom: 2px solid ${borderColor};`;
        }
        if (cellFormat.rightBorder && cellFormat.rightBorder === 1) {
          style += ` border-right: 2px solid ${borderColor};`;
        }

        if (cellFormat.textPlacement && cellFormat.textPlacement === 'Wrap') {
          style += ' white-space: normal;';
        }

        if (cellFormat.font) {
          const font = document.font[cellFormat.font];
          if (font) {
            style += ` font-family: ${font.$_faceName}; font-size: ${Math.round(font.$_height * 1.333)}px;`;
            if (font.$_bold === 'true') {
              style += ` font-weight: bold;`;
            }
            if (font.$_italic === 'true') {
              style += ` font-style: italic;`;
            }
          }
        }
      }
      if (style) {
        style = ' style="' + style + '"';
      }

      if (c.c && c.c.parameter) {
        return `${additionalColumns}<td${hasMergeColumns ? ` colspan=${merge[0].w + 1}` : ''}
          ${hasMergeRows ? ` rowspan=${merge[0].h + 1}` : ''}${style}>
          &lt;${c.c.parameter}&gt;
        </td>`;
      } else if (c.c.tl) {
        const tl = c.c.tl;
        if (tl) {
          return `${additionalColumns}<td${hasMergeColumns ? ` colspan=${merge[0].w + 1}` : ''}
            ${hasMergeRows ? ` rowspan=${merge[0].h + 1}` : ''}${style}>
            ${tl['v8:item']['v8:content']}
          </td>`;
        }
      } else if (additionalColumns) {
        return `${additionalColumns}<td${hasMergeColumns ? ` colspan=${merge[0].w + 1}` : ''}
          ${hasMergeRows ? ` rowspan=${merge[0].h + 1}` : ''}></td>`;
      } else {
        return `<td${hasMergeColumns ? ` colspan=${Number(merge[0].w) + 1}` : ''}
          ${hasMergeRows ? ` rowspan=${merge[0].h + 1}` : ''}></td>`;
      }
    }).join('');
  }

  return '';
}

function FindRowMerge(indexRow: number, merge: TemplateMergeCells[]) {
  return merge
    .filter(m => 
      m.h && m.w &&
      (m.r < indexRow && m.r + m.h >= indexRow));
}

function HasMergeColumns(merge: TemplateMergeCells[]) {
  return merge && merge.length && merge[0].w;
}
function HasMergeRows(merge: TemplateMergeCells[]) {
  return merge && merge.length && merge[0].h;
}