import * as fs from "fs";
import * as vscode from "vscode";
import { XMLParser } from "fast-xml-parser";
import * as saxonJS from 'saxon-js';

export class FormPreviewer {
  public static readonly viewType = "metadataViewer.formPreview";

  private confPath: string;
  private rootFilePath: string;
  private filePath: string;
  private webpanel: vscode.WebviewPanel | undefined = undefined;

  constructor(confPath: string, rootFilePath: string, filePath: string) {
    this.confPath = confPath;
    this.rootFilePath = rootFilePath;
    this.filePath = filePath;
  }

  public async openPreview(
    extensionUri: vscode.Uri,
    title?: string | vscode.TreeItemLabel
  ) {
    const openPath = vscode.Uri.file(this.filePath);
    if (fs.existsSync(this.filePath)) {
      vscode.workspace.fs.readFile(openPath).then((configXml) => {

        if (!fs.existsSync(this.rootFilePath)) {
          // TODO:
          return;
        }
        const rootXml = fs.readFileSync(this.rootFilePath);

        const arrayPaths = [
          'Form.Attributes.Attribute',
          'MetaDataObject.Document.ChildObjects.TabularSection.ChildObjects.Attribute',
        ];
        const parser = new XMLParser({
          ignoreAttributes: false,
          attributeNamePrefix: "$_",
          isArray: (name, jpath, isLeafNode, isAttribute) => { 
            if(arrayPaths.indexOf(jpath) !== -1) return true;

            return false;
          },
        });
        const rootParsed = parser.parse(Buffer.from(rootXml));
        const childObjects = rootParsed
          .MetaDataObject[Object.keys(rootParsed.MetaDataObject)[0]]
          .ChildObjects;

        const xmlParsed = parser.parse(Buffer.from(configXml));
        const mainAttribute = xmlParsed['Form']['Attributes']['Attribute']
          .filter((attr: any) => attr['MainAttribute'])[0];

        const picturesUri = vscode.Uri.joinPath(extensionUri, "resources", "pictures");

        if (this.webpanel) {
          // TODO:
        } else {
          const previewPanel = vscode.window.createWebviewPanel(
            FormPreviewer.viewType,
            `Предпросмотр формы (${title})`,
            vscode.ViewColumn.One,
            {
              localResourceRoots: [picturesUri],
              enableScripts: true,
            }
          );
          this.webpanel = previewPanel;
        }

        this.generateHtml(
          extensionUri,
          picturesUri,
          childObjects,
          mainAttribute,
          Buffer.from(configXml).toString());
      });
    } else {
      vscode.window.showInformationMessage(
        `File ${this.filePath} does not exist.`
      );
    }
  }

  private generateHtml(
    extensionUri: vscode.Uri,
    picturesUri: vscode.Uri,
    childObjects: { Attribute: []; TabularSection: [] },
    mainAttribute: { $_name: string; },
    xml: string
  ) {
    if (this.webpanel) {
      this.generateHTMLTemplate(
        this.webpanel.webview,
        extensionUri,
        picturesUri,
        childObjects,
        mainAttribute,
        xml);
    }
  }

  private generateHTMLTemplate(
    webview: vscode.Webview,
    extensionUri: vscode.Uri,
    picturesUri: vscode.Uri,
    childObjects: { Attribute: []; TabularSection: [] },
    mainAttribute: { $_name: string; },
    xml: string
  ) {
    const sefUri = vscode.Uri.joinPath(extensionUri, "xslt", "form.sef.json");
    if (!fs.existsSync(sefUri.fsPath)) {
      // TODO:
      return;
    }

    vscode.workspace.fs.readFile(sefUri).then((sef) => {
      const result = saxonJS.transform(
        {
          stylesheetText: sef,
          sourceType: "xml",
          sourceText: xml,
          destination: "serialized",
        },
        "sync"
      );

      let html = "principalResult" in result ? result.principalResult : "";
      html = html.replace(
        "<style></style>",
        `
        <style>
          html {
            font-family: arial;
            font-size: 12px;
          }
    
          .window {
            border: solid 1px;
            max-width: 920px;
          }
          .window-header {
            height: 22px;
            background-color: #bfcddb;
          }
          .window-content {
            margin: 10px;
          }

          .group {
            margin: 5px 0;
            border: dotted 0px #1e1e1e;
            position: relative;
            display: grid;
            row-gap: 2px;
          }
          .group-caption {
            display: none;
            background-color: #1e1e1e;
            position: absolute;
            top: -8px;
            left: 3px;
            font-size: 11px;
          }
          .group-title {
            color: #009690;
          }
          .group-content {
            display: flex;
          }
          .group-vertical {
            flex-direction: column;
          }
          .group-horizontalifpossible {
            flex-direction: row;
          }
          .element {
            display: inline-flex;
          }
          .element.label-top {
            display: block;
          }
          label {
            white-space: pre-wrap;
            min-height: 25px;
            display: flex;
            align-items: center;
          }
          .input {
            height: 25px;
            border: solid 1px #a0a0a0;
            border-radius: 3px;
          }
          .tooltip {
            color: #807a59;
          }
          button {
            height: 26px;
            border: solid 1px #a0a0a0;
            border-radius: 3px;
            margin: 5px;
          }

          .tabbed {
            overflow-x: hidden; /* so we could easily hide the radio inputs */
          }
          .tabbed [type="radio"] {
            display: none;
          }
          .tabs {
            display: flex;
            align-items: stretch;
            list-style: none;
            padding: 0;
          }
          .tab > label {
            padding: 5px 10px;
            border: 1px solid #a0a0a0;
            border-bottom: none;
          }
          .tab-content {
            display: none;
          }
          /* As we cannot replace the numbers with variables or calls to element properties, the number of this selector parts is our tab count limit */
          .tabbed [type="radio"]:nth-of-type(1):checked ~ .tabs .tab:nth-of-type(1) label,
          .tabbed [type="radio"]:nth-of-type(2):checked ~ .tabs .tab:nth-of-type(2) label,
          .tabbed [type="radio"]:nth-of-type(3):checked ~ .tabs .tab:nth-of-type(3) label,
          .tabbed [type="radio"]:nth-of-type(4):checked ~ .tabs .tab:nth-of-type(4) label,
          .tabbed [type="radio"]:nth-of-type(5):checked ~ .tabs .tab:nth-of-type(5) label {
            background: #37373d;
          }
          .tabbed [type="radio"]:nth-of-type(1):checked ~ .tab-content:nth-of-type(1),
          .tabbed [type="radio"]:nth-of-type(2):checked ~ .tab-content:nth-of-type(2),
          .tabbed [type="radio"]:nth-of-type(3):checked ~ .tab-content:nth-of-type(3),
          .tabbed [type="radio"]:nth-of-type(4):checked ~ .tab-content:nth-of-type(4),
          .tabbed [type="radio"]:nth-of-type(5):checked ~ .tab-content:nth-of-type(5) {
            display: block;
          }

          .table-wrap {
            height: 300px;
            overflow: auto;
          }
          table, th, td {
            border: 1px solid;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead tr th {
            position: sticky;
            top: 0;
            background: #37373d;
          }
          tbody {
          }
          th > div,
          td > div {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        </style>
        `
      );

      // Секция костылей
      html = html.replace('&lt;br /&gt;', '<br />');
      // Пути к картинкам
      //   Стандартные
      html = html.replace('<img src="StdPicture.',
        `<img src="${picturesUri.with({scheme: "vscode-resource"})}/StdPicture.`);
      //   Общие
      html = html.replace('<img src="CommonPicture.',
        `<img src="${this.confPath}/CommonPictures/`);
      // Атрибуты
      //   Типовые
      //     Справочники
      html = html.replace(`${mainAttribute.$_name}.Code`, 'Код');
      html = html.replace(`${mainAttribute.$_name}.Description`, 'Наименование');
      html = html.replace(`${mainAttribute.$_name}.Parent`, 'Входит в группу');
      //     Документы
      html = html.replace(`${mainAttribute.$_name}.Number`, 'Номер');
      html = html.replace(`${mainAttribute.$_name}.Date`, 'Дата');
      //   Прочие
      childObjects.Attribute?.forEach((attr) => {
        html = html.replace(`${mainAttribute.$_name}.${attr['Properties']['Name']}`,
          attr['Properties']['Synonym']['v8:item']['v8:content']);
      });
      // Табличные части
      childObjects.TabularSection?.forEach((tab: any) => {
        // Атрибуты табличных частей
        //   Типовые
        html = html.replace(`${mainAttribute.$_name}.${tab['Properties']['Name']}.LineNumber`, 'N');
        tab['ChildObjects']['Attribute'].forEach((attr: any) => {
          //   Прочие
          html = html.replace(`${mainAttribute.$_name}.${tab['Properties']['Name']}.${attr['Properties']['Name']}`,
            `${attr['Properties']['Synonym']['v8:item']['v8:content']}`);
        });
      });

      html = html.replace('<script></script>', `
      <script>
        window.addEventListener("load", main);

        function main() {
          const verticalGroups = document.getElementsByClassName('group-vertical');
          [...verticalGroups].forEach((verticalGroup) => {
            let maxWidth = 0;
            const labels = verticalGroup.getElementsByTagName('label');
            [...labels].forEach((label) => {
              if (label.parentElement.classList.contains('element')) {
                maxWidth = Math.max(maxWidth, label.offsetWidth);
              }
            });
            if (maxWidth > 0) {
              [...labels].forEach((label) => {
                if (label.parentElement.classList.contains('element')) {
                  label.style.width = maxWidth + 'px';
                }
              });
            }
          });
        }
      </script>
      `);

      webview.html = html;
    });
  }
}
