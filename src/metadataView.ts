import * as fs from 'fs';
import * as glob from 'fast-glob';
import * as vscode from 'vscode';
import { posix } from 'path';
import { MetadataFile, VersionMetadata } from './metadataInterfaces';
import { TemplatePanel } from './templatePanel';
import { TemplateFile } from './templatInterfaces';
import { PredefinedDataFile } from './predefinedDataInterfaces';
import { PredefinedDataPanel } from './predefinedDataPanel';
import { getWebviewContent } from './Metadata/Configuration/getWebviewContent';
import { Configuration } from './Metadata/Configuration/configuration';
import { XMLParser } from 'fast-xml-parser';
import { CreatePath, GetTreeItem, TreeItem } from './ConfigurationFormats/utils';
import { Edt } from './ConfigurationFormats/edt';

interface MetadataDictionaries {
	form: { [key: string]: TreeItem[] },
	template: { [key: string]: TreeItem[] },
}

interface MetadataObjects {
  subsystem: TreeItem[],
	commonModule: TreeItem[],
	sessionParameter: TreeItem[],
	role: TreeItem[],
	commonAttribute: TreeItem[],
	exchangePlan: TreeItem[],
	eventSubscription: TreeItem[],
	scheduledJob: TreeItem[],
  commonForm: TreeItem[],
  commonPicture: TreeItem[],
  webService: TreeItem[],
  httpService: TreeItem[],
  wsReference: TreeItem[],
  style: TreeItem[],
	constant: TreeItem[],
	catalog: TreeItem[],
	document: TreeItem[],
  documentNumerator: TreeItem[],
  sequence: TreeItem[],
	documentJournal: TreeItem[],
	enum: TreeItem[],
	report: TreeItem[],
	dataProcessor: TreeItem[],
  сhartOfCharacteristicTypes: TreeItem[],
  chartOfAccounts: TreeItem[],
  chartOfCalculationTypes: TreeItem[],
	informationRegister: TreeItem[],
	accumulationRegister: TreeItem[],
  accountingRegister: TreeItem[],
  calculationRegister: TreeItem[],
  businessProcess: TreeItem[],
  task: TreeItem[],
  externalDataSource: TreeItem[],
}

export class MetadataView {
  rootPath?: vscode.Uri;
  panel: vscode.WebviewPanel | undefined = undefined;
  // Фильтр нужен по каждой конфигурации отдельно
  subsystemFilter: { id: string; objects: string[] }[] = [];
  dataProvider: NodeWithIdTreeDataProvider | null = null;

	constructor(context: vscode.ExtensionContext) {
    this.rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
      ? vscode.workspace.workspaceFolders[0].uri : undefined;

    this.dataProvider = new NodeWithIdTreeDataProvider();
    const view = vscode.window.createTreeView('metadataView', { treeDataProvider: this.dataProvider, showCollapseAll: true });
		context.subscriptions.push(view);

    view.onDidExpandElement(e => {
      this.expand(e.element);
    });

		vscode.workspace.workspaceFolders?.forEach(folder => {
      if (this.dataProvider) {
        LoadAndParseConfigurationXml(folder.uri, this.dataProvider);
      }
		});

    vscode.commands.registerCommand('metadataViewer.showTemplate', (template, configType) => this.openTemplate(context, template, configType));
    vscode.commands.registerCommand('metadataViewer.openPredefinedData', (item) => this.openPredefinedData(context, item));
    vscode.commands.registerCommand('metadataViewer.openHandler', (item) => this.openHandler(item));
    vscode.commands.registerCommand('metadataViewer.openMetadataProperties', (item) => this.openMetadataProperties(context, item));
    vscode.commands.registerCommand('metadataViewer.filterBySubsystem', (item) => this.filterBySubsystem(item, true));
    vscode.commands.registerCommand('metadataViewer.clearFilter', (item) => this.filterBySubsystem(item, false));
	}

  // Открытие макета
  private openTemplate(context: vscode.ExtensionContext, template: string, configType: string): void {
    if (this.rootPath) {
      let fileName = '';
      if (configType === 'xml') {
        fileName = posix.join(template, 'Ext/Template.xml');
      } else {
        fileName = posix.join(template, 'Template.mxlx');
      }
      if (!fs.existsSync(fileName)) {
        return;
      }
      vscode.workspace.fs.readFile(this.rootPath.with({ path: fileName }))
        .then(configXml => {
          const arrayPaths = [
            'document.columns',
            'document.rowsItem.row.c',
          ];

          const parser = new XMLParser({
            ignoreAttributes : false,
            attributeNamePrefix: '$_',
            isArray: (name, jpath, isLeafNode, isAttribute) => { 
              if(arrayPaths.indexOf(jpath) !== -1) return true;

              return false;
            },
          });
          const result = parser.parse(Buffer.from(configXml));

          const typedResult = result as TemplateFile;
          if (!typedResult.document) {
            // Это макет, но другого типа. Для него нужно писать свою панель
            return;
          }
          TemplatePanel.show(context.extensionUri, typedResult.document);
        });
    }
  }

  // Открытие предопределенных данных
  private openPredefinedData(context: vscode.ExtensionContext, item: TreeItem): void {
    if (this.rootPath) {
      const fileName = posix.join(item.path!, 'Ext/Predefined.xml');
      const metadataName = item.path!.split('/').slice(-2).join('.');
      if (!fs.existsSync(fileName)) {
        PredefinedDataPanel.show(context.extensionUri, GetMetadataName(metadataName), []);
      } else {
        vscode.workspace.fs.readFile(this.rootPath.with({ path: fileName }))
          .then(configXml => {
            const arrayPaths = [
              'PredefinedData.Item.ChildItems.Item',
            ];

            const parser = new XMLParser({
              ignoreAttributes : false,
              isArray: (name, jpath, isLeafNode, isAttribute) => { 
                if(arrayPaths.indexOf(jpath) !== -1) return true;

                return false;
              },
            });
            const result = parser.parse(Buffer.from(configXml));
  
            const typedResult = result as PredefinedDataFile;
            PredefinedDataPanel.show(context.extensionUri, GetMetadataName(metadataName), typedResult.PredefinedData.Item);
          });
      }
    }
  }

  // Переход к процедуре офработчика команды
  private openHandler(item: TreeItem): void {
    if (this.rootPath) {
      const fileName = CreatePath(item.path!) + '.xml';
      if (!fs.existsSync(fileName)) {
        vscode.window
          .showInformationMessage(`File ${fileName} does not exist.`);

        return;
      }

      vscode.workspace.fs.readFile(this.rootPath.with({ path: fileName }))
          .then(configXml => {
            const parser = new XMLParser({
              ignoreAttributes : false,
            });
            const result = parser.parse(Buffer.from(configXml));
  
            const typedResult = result as MetadataFile;
            const handlerFileName = posix.join(
              item.path!.split('/').slice(0, -2).join('/'),
              item.path!.includes('/EventSubscriptions/') ? 
                CreatePath(typedResult.MetaDataObject.EventSubscription.Properties.Handler.split('.').slice(0, 2).join('.')) :
                CreatePath(typedResult.MetaDataObject.ScheduledJob.Properties.MethodName.split('.').slice(0, 2).join('.')),
              'Ext',
              'Module.bsl');

            if (!fs.existsSync(handlerFileName)) {
              vscode.window
                .showInformationMessage(`Handler file ${handlerFileName} does not exist.`);

              return;
            }

            vscode.workspace.openTextDocument(handlerFileName).then(doc => {
              const functionName = item.path!.includes('/EventSubscriptions/') ? 
                typedResult.MetaDataObject.EventSubscription.Properties.Handler.split('.').slice(-1).pop() :
                typedResult.MetaDataObject.ScheduledJob.Properties.MethodName.split('.').slice(-1).pop();
              const regExpString = `^(процедура|функция|procedure|function)\\s*${functionName}\\([a-zа-яё\\s,]*\\)\\s*Экспорт`;

              const text = doc.getText().split('\n');
              // TODO: Без малого секунду ищет на 1500 строках и две секунды на 9000 строках.
              //       Это на весьма древнем компьютере. Нормально? Или надо оптимизировать?
              console.time('search procedure regexp');
              const handlerPos = text.findIndex(row => new RegExp(regExpString, 'i').test(row));
              console.timeEnd('search procedure regexp');

              vscode.window.showTextDocument(doc)
                .then(editor => {
                  if (handlerPos != -1) {
                    const selection = new vscode.Selection(
                      new vscode.Position(handlerPos, 0), new vscode.Position(handlerPos + 1, 0));
  
                    editor.selections = [selection, selection]; 
                  } else {
                    vscode.window
                      .showInformationMessage(`Function ${functionName} not found in handler ${handlerFileName}.`);
                  }
                });
            });
        });
    }
  }

  // Открытие свойств конфигурации
  private openMetadataProperties(context: vscode.ExtensionContext, item: TreeItem): void {
    if (this.rootPath) {
      vscode.workspace.fs.readFile(this.rootPath.with({ path: posix.join(item.path!, 'Configuration.xml') }))
        .then(configXml => {
          const arrayPaths = [
            'MetaDataObject.Configuration.Properties.UsePurposes.v8:Value',
            'MetaDataObject.Configuration.Properties.DefaultRoles.xr:Item',
          ];

          const parser = new XMLParser({
            ignoreAttributes : false,
            isArray: (name, jpath, isLeafNode, isAttribute) => { 
              if(arrayPaths.indexOf(jpath) !== -1) return true;

              return false;
            }
          });
          const result = parser.parse(Buffer.from(configXml));
                      
          const configurationProperties = result.MetaDataObject.Configuration.Properties;
          const newConfiguration: Configuration = {
            id: '',
            name: configurationProperties.Name,
            synonym: GetContent(configurationProperties.Synonym),
            comment: configurationProperties.Comment,
            defaultRunMode: configurationProperties.DefaultRunMode,
            usePurposes: configurationProperties.UsePurposes && configurationProperties.UsePurposes['v8:Value'] ? 
              configurationProperties.UsePurposes['v8:Value'].map((p: { [key: string]: string }) =>
              p['#text'] === 'PlatformApplication' ? 'Приложение для платформы' : 'Приложение для мобильной платформы') : [],
            scriptVariant: configurationProperties.ScriptVariant,
            defaultRoles: configurationProperties.DefaultRoles && configurationProperties.DefaultRoles['xr:Item'] ?
              configurationProperties.DefaultRoles['xr:Item'].map((r: { [key: string]: string }) =>
              r['#text'].replace('Role.', 'Роль.')) : [],
            briefInformation: GetContent(configurationProperties.BriefInformation),
            detailedInformation: GetContent(configurationProperties.DetailedInformation),
            copyright: GetContent(configurationProperties.Copyright),
            vendorInformationAddress: GetContent(configurationProperties.VendorInformationAddress),
            configurationInformationAddress: GetContent(configurationProperties.ConfigurationInformationAddress),
            vendor: configurationProperties.Vendor ? configurationProperties.Vendor.replaceAll('"', '&quot;') : '',
            version: configurationProperties.Version,
            updateCatalogAddress: configurationProperties.UpdateCatalogAddress,
            dataLockControlMode: configurationProperties.DataLockControlMode,
            objectAutonumerationMode: configurationProperties.ObjectAutonumerationMode,
            modalityUseMode: configurationProperties.ModalityUseMode,
            synchronousPlatformExtensionAndAddInCallUseMode: configurationProperties.SynchronousPlatformExtensionAndAddInCallUseMode,
            interfaceCompatibilityMode: configurationProperties.InterfaceCompatibilityMode,
            compatibilityMode: configurationProperties.CompatibilityMode,
          };

          if (!this.panel) {
            this.panel = vscode.window.createWebviewPanel("configurationDetailView", newConfiguration.name, vscode.ViewColumn.One, {
              enableScripts: true,
            });
          }
      
          this.panel.title = newConfiguration.name;
          this.panel.webview.html = getWebviewContent(this.panel.webview, context.extensionUri, newConfiguration);

          this.panel?.onDidDispose(
            () => {
              this.panel = undefined;
            },
            null,
            context.subscriptions
          );
        });
    }
  }

  private filterBySubsystem(item: TreeItem, setFilter: boolean): void {
    if (tree.length && tree[0].children?.length) {
      const pathArray = item.id.split('/');
      pathArray.pop();
      const config = tree[0].children.find((c) => pathArray.join('/') === c.id);

      if (config) {
        // Устанавливаю пустую конфигурацию чтобы не было конфликта идентификаторов
        const configIndex = tree[0].children.indexOf(config);
        tree[0].children[configIndex].children = CreateMetadata(config.id);
        this.dataProvider?.update();

        // Устанавливаю признак фильтрации
        if (this.subsystemFilter.find((sf) => sf.id === config.id)) {
          this.subsystemFilter = this.subsystemFilter.map((sf) => {
            if (sf.id === config.id) {
              return { id: config.id, objects: setFilter ? item.command?.arguments ?? [] : [] };
            }

            return sf;
          });
        } else {
          this.subsystemFilter.push({ id: config.id, objects: item.command?.arguments ?? [] });
        }
        // Заполняю дерево конфигурации с фильтром
        this.expand(tree[0].children[configIndex]);

        vscode.commands.executeCommand('setContext', 'filteredConfigArray',
          this.subsystemFilter.filter((sf) => sf.objects.length !== 0).map((sf) => `subsystem_${sf.id}`));
      }
    }
  }

  private expand(element: TreeItem) {
    if (!element.isConfiguration) {
      return;
    }

    if (this.rootPath) {
      if (element.configType === 'xml') {
        vscode.workspace.fs.readFile(this.rootPath.with({ path: posix.join(element.id, 'ConfigDumpInfo.xml') }))
          .then(configXml => {
            const arrayPaths = [
              'ConfigDumpInfo.ConfigVersions.Metadata.Metadata',
            ];

            const parser = new XMLParser({
              ignoreAttributes: false,
              attributeNamePrefix: '$_',
              isArray: (name, jpath, isLeafNode, isAttribute) => { 
                if(arrayPaths.indexOf(jpath) !== -1) return true;

                return false;
              }
            });
            const result = parser.parse(Buffer.from(configXml));

            const typedResult = result as MetadataFile;
            const currentFilter = this.subsystemFilter.find((sf) => sf.id === element.id)?.objects ?? [];
            CreateTreeElements(this.rootPath!,
              element,
              typedResult,
              currentFilter);

            if (currentFilter.length) {
              // Нумераторы и последовательности в документах
              if (element.children![3].children![1].children?.length === 0) {
                element.children![3].children?.splice(1, 1);
              }
              if (element.children![3].children![0].children?.length === 0) {
                element.children![3].children?.splice(0, 1);
              }
      
              // Очищаю пустые элементы
              const indexesToDelete: number[] = [];
              element.children?.forEach((ch, index) => {
                if (!ch.children || ch.children.length === 0) {
                  indexesToDelete.push(index);
                }
              });
              indexesToDelete.sort((a, b) => b - a);
              indexesToDelete.forEach((d) => element.children?.splice(d, 1));
      
              // Отдельно очищаю раздел "Общие"
              indexesToDelete.splice(0);
              element.children![0].children?.forEach((ch, index) => {
                if (!ch.children || ch.children.length === 0) {
                  indexesToDelete.push(index);
                }
              });
              indexesToDelete.sort((a, b) => b - a);
              indexesToDelete.forEach((d) => element.children![0].children?.splice(d, 1));
      
              // Ненужные вложенные подсистемы
              removeSubSystems(element.children![0].children![0], currentFilter);
            }

            this.dataProvider?.update();
          });
      } else {
        const edt = new Edt(this.rootPath.with({ path: posix.join(
          element.id, 'Configuration', 'Configuration.mdo') }), this.dataProvider!);
        edt.createTreeElements(element, this.subsystemFilter.find((sf) => sf.id === element.id)?.objects ?? []);
      }
    }
  }
}

const tree: TreeItem[] = [
	GetTreeItem('configurations', 'Конфигурации', { children: [] })
];

function LoadAndParseConfigurationXml(uri: vscode.Uri, dataProvider: NodeWithIdTreeDataProvider) {
  console.time('glob');
  const files = glob.sync([
    '**/ConfigDumpInfo.xml',
    '**/Configuration.xml',
    '**/Configuration/Configuration.mdo'
  ], {
    dot: true,
    cwd: uri.fsPath,
    absolute: true,
    deep: vscode.workspace.getConfiguration().get('metadataViewer.searchDepth'),
  });
  console.timeEnd('glob');

  const configurations = files.reduce<{ [key: string]: { type: 'xml' | 'edt', files: string[] } }>((previous, current) => {
    const key = current.indexOf('Configuration.mdo') === -1 ?
      current.split('/').slice(0, -1).join('/') :
      current.split('/').slice(0, -2).join('/');

    if (!previous[key]) {
      previous[key] = {
        type: current.indexOf('Configuration.mdo') === -1 ? 'xml' : 'edt',
        files: []
      };
    }
    previous[key].files.push(current);
    return previous;
  }, {});

  const filtered = Object
    .keys(configurations)
    .filter(f => configurations[f].type === 'edt' || (configurations[f].type === 'xml' && configurations[f].files.length === 2));

  filtered.forEach(fc => {
    let xmlPath = posix.join(fc, 'Configuration.xml');
    if (!fs.existsSync(xmlPath.toString())) {
      xmlPath = posix.join(fc, 'Configuration', 'Configuration.mdo');
    }

    vscode.workspace.fs.readFile(uri.with({ path: xmlPath }))
      .then(configXml => {
        const parser = new XMLParser({
          ignoreAttributes: false,
        });
        const result = parser.parse(Buffer.from(configXml));

        const configType = xmlPath.toString().indexOf('/Configuration/Configuration.mdo') === -1 ?
          'xml' : 'edt';

        let synonym = '';
        if (configType === 'xml') {
          synonym = GetContent(result.MetaDataObject.Configuration.Properties.Synonym);
          if (!synonym) {
            synonym = result.MetaDataObject.Configuration.Properties.Name;
          }
        } else {
          synonym = result['mdclass:Configuration']?.synonym?.value;
          if (!synonym) {
            synonym = result['mdclass:Configuration']?.name;
          }
        }

        console.log(`Конфигурация ${synonym} найдена`);

        const treeItem = new TreeItem(fc, `${synonym} (${fc})`, CreateMetadata(fc));
        treeItem.contextValue = 'main';
        treeItem.path = fc;
        treeItem.isConfiguration = true;
        treeItem.configType = configType;

        tree[0].children?.push(treeItem);

        dataProvider.update();
      });
  });
}

function CreateTreeElements(rootPath: vscode.Uri, element: TreeItem, metadataFile: MetadataFile, subsystemFilter: string[]) {
	const versionMetadata = metadataFile.ConfigDumpInfo.ConfigVersions.Metadata;

  const treeItemIdSlash = element.id + '/';

	console.time('reduce');
	const attributeReduceResult = versionMetadata.reduce<MetadataDictionaries>((previous, current) => {
		const objectName = current.$_name.split('.').slice(0, 2).join('.');
		if (current.$_name.includes('.Form.') && !(current.$_name.endsWith('.Form') || current.$_name.endsWith('.Help'))) {
			if (!previous.form[objectName]) {
				previous.form[objectName] = [];
			}
			previous.form[objectName].push(GetTreeItem(
        treeItemIdSlash + current.$_id,
        current.$_name,
        {
          icon: 'form',
          context: 'form',
          path: `${element.id}/${CreatePath(objectName)}/Forms/${current.$_name.split('.').pop()}`,
        }));
		} else if (current.$_name.includes('.Template.') && !current.$_name.endsWith('.Template')) {
			if (!previous.template[objectName]) {
				previous.template[objectName] = [];
			}
      const path = `${element.id}/${CreatePath(objectName)}/Templates/${current.$_name.split('.').pop()}`;
			previous.template[objectName].push(GetTreeItem(
        treeItemIdSlash + current.$_id,
        current.$_name,
        {
          icon: 'template',
          command: 'metadataViewer.showTemplate',
          commandTitle: 'Show template',
          commandArguments: [ path ],
          path: path,
        }));
		}
		return previous;
	}, { form: {}, template: {} });

	const reduceResult = versionMetadata.reduce<MetadataObjects>((previous, current) => {
		if (current.$_name.split('.').length !== 2) {
			return previous;
		}
    if (subsystemFilter.length && subsystemFilter.indexOf(current.$_name) === -1) {
			return previous;
    }

    const treeItemId = treeItemIdSlash + current.$_id;
    const treeItemPath = `${treeItemIdSlash}${CreatePath(current.$_name)}`;
  
    switch (true) {
      case current.$_name.startsWith('Subsystem.'): {
        const chilldren = GetSubsystemChildren(rootPath, element.id, versionMetadata, current.$_name);

        previous.subsystem.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'subsystem',
            context: `subsystem_${element.id}`,
            children: chilldren,
            command: 'metadataViewer.filterBySubsystem',
            commandTitle: 'Filter by subsystem',
            commandArguments: CollectSubsystemContent(rootPath, treeItemPath) }));

        break;
      }
      case current.$_name.startsWith('CommonModule.'):
        previous.commonModule.push(GetTreeItem(
          treeItemId, current.$_name,
          { icon: 'commonModule', context: 'module', path: treeItemPath, }));

        break;
      case current.$_name.startsWith('SessionParameter.'):
        previous.sessionParameter.push(GetTreeItem(treeItemId, current.$_name, { icon: 'sessionParameter' }));
        break;
      case current.$_name.startsWith('Role.'):
        previous.role.push(GetTreeItem(treeItemId, current.$_name, { icon: 'role' }));
        break;
      case current.$_name.startsWith('CommonAttribute.'):
        previous.commonAttribute.push(GetTreeItem(treeItemId, current.$_name, { icon: 'attribute' }));
        break;
      case current.$_name.startsWith('ExchangePlan.'):
        previous.exchangePlan.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'exchangePlan', context: 'object_and_manager', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('EventSubscription.'):
        previous.eventSubscription.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'eventSubscription', context: 'handler', path: treeItemPath }));
        break;
      case current.$_name.startsWith('ScheduledJob.'):
        previous.scheduledJob.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'scheduledJob', context: 'handler', path: treeItemPath }));
        break;
      case current.$_name.startsWith('CommonForm.'):
        previous.commonForm.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'form', context: 'form', path: treeItemPath }));

        break;
      case current.$_name.startsWith('CommonPicture.'):
        previous.commonPicture.push(GetTreeItem(treeItemId, current.$_name, { icon: 'picture' }));
        break;
      case current.$_name.startsWith('WebService.'):
        previous.webService.push(GetTreeItem(treeItemId, current.$_name, {
          icon: 'ws', context: 'module', path: treeItemPath,
          children: FillWebServiceItemsByMetadata(treeItemId, current, attributeReduceResult) }));

        break;
      case current.$_name.startsWith('HTTPService.'):
        previous.httpService.push(GetTreeItem(treeItemId, current.$_name, {
          icon: 'http', context: 'module', path: treeItemPath,
          children: FillHttpServiceItemsByMetadata(treeItemId, current, attributeReduceResult) }));

        break;
      case current.$_name.startsWith('WSReference.'):
        previous.wsReference.push(GetTreeItem(treeItemId, current.$_name, { icon: 'wsLink' }));
        break;
      case current.$_name.startsWith('Style.'):
        previous.style.push(GetTreeItem(treeItemId, current.$_name, { icon: 'style' }));
        break;
      case current.$_name.startsWith('Constant.'):
        previous.constant.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'constant', context: 'valueManager_and_manager', path: treeItemPath, }));

        break;
      case current.$_name.startsWith('Catalog.'):
        previous.catalog.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'catalog', context: 'object_and_manager_and_predefined', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('Document.'):
        previous.document.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'document', context: 'object_and_manager', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('DocumentNumerator.'):
        previous.documentNumerator.push(GetTreeItem( treeItemId, current.$_name, { icon: 'documentNumerator' }));
  
        break;
      case current.$_name.startsWith('Sequence.'):
        previous.sequence.push(GetTreeItem( treeItemId, current.$_name, { icon: 'sequence' }));
  
        break;
      case current.$_name.startsWith('DocumentJournal.'):
        previous.documentJournal.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'documentJournal', context: 'manager', path: treeItemPath,
            children: FillDocumentJournalItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('Enum.'):
        previous.enum.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'enum', context: 'manager', path: treeItemPath,
            children: FillEnumItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('Report.'):
        previous.report.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'report', context: 'object_and_manager', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('DataProcessor.'):
        previous.dataProcessor.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'dataProcessor', context: 'object_and_manager', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('ChartOfCharacteristicTypes.'):
        previous.сhartOfCharacteristicTypes.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'chartsOfCharacteristicType', context: 'object_and_manager_and_predefined', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('ChartOfAccounts.'):
        previous.chartOfAccounts.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'chartsOfAccount', context: 'object_and_manager_and_predefined', path: treeItemPath,
            children: FillChartOfAccountsItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('ChartOfCalculationTypes.'):
        previous.chartOfCalculationTypes.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'chartsOfCalculationType', context: 'object_and_manager_and_predefined', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('InformationRegister.'):
        previous.informationRegister.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'informationRegister', context: 'recordset_and_manager', path: treeItemPath,
            children: FillRegisterItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('AccumulationRegister.'):
        previous.accumulationRegister.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'accumulationRegister', context: 'recordset_and_manager', path: treeItemPath,
            children: FillRegisterItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('AccountingRegister.'):
        previous.accountingRegister.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'accountingRegister', context: 'recordset_and_manager', path: treeItemPath,
            children: FillRegisterItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('CalculationRegister.'):
        previous.calculationRegister.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'calculationRegister', context: 'recordset_and_manager', path: treeItemPath,
            children: FillCalculationRegisterItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('BusinessProcess.'):
        previous.businessProcess.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'businessProcess', context: 'object_and_manager', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('Task.'):
        previous.task.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'task', context: 'object_and_manager', path: treeItemPath,
            children: FillTaskItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$_name.startsWith('ExternalDataSource.'):
        previous.externalDataSource.push(GetTreeItem(
          treeItemId, current.$_name, {
            icon: 'externalDataSource',
            children: FillExternalDataSourceItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
    }
		
		return previous;
	}, {
    subsystem: [],
		commonModule: [],
		sessionParameter: [],
		role: [],
		commonAttribute: [],
		exchangePlan: [],
    eventSubscription: [],
    scheduledJob: [],
    commonForm: [],
    commonPicture: [],
    webService: [],
    httpService: [],
    wsReference: [],
    style: [],
    constant: [],
		catalog: [],
		document: [],
    documentNumerator: [],
    sequence: [],
		documentJournal: [],
		enum: [],
		report: [],
		dataProcessor: [],
    сhartOfCharacteristicTypes: [],
    chartOfAccounts: [],
    chartOfCalculationTypes: [],
		informationRegister: [],
		accumulationRegister: [],
    accountingRegister: [],
    calculationRegister: [],
    businessProcess: [],
    task: [],
    externalDataSource: [],
	});

	SearchTree(element, element.id + '/subsystems')!.children = reduceResult.subsystem;
	SearchTree(element, element.id + '/commonModules')!.children = reduceResult.commonModule;
	SearchTree(element, element.id + '/sessionParameters')!.children = reduceResult.sessionParameter;
	SearchTree(element, element.id + '/roles')!.children = reduceResult.role;
	SearchTree(element, element.id + '/commonAttributes')!.children = reduceResult.commonAttribute;
	SearchTree(element, element.id + '/exchangePlans')!.children = reduceResult.exchangePlan;
	SearchTree(element, element.id + '/eventSubscriptions')!.children = reduceResult.eventSubscription;
	SearchTree(element, element.id + '/scheduledJobs')!.children = reduceResult.scheduledJob;
	SearchTree(element, element.id + '/commonForms')!.children = reduceResult.commonForm;
	SearchTree(element, element.id + '/commonPictures')!.children = reduceResult.commonPicture;
	SearchTree(element, element.id + '/webServices')!.children = reduceResult.webService;
	SearchTree(element, element.id + '/httpServices')!.children = reduceResult.httpService;
	SearchTree(element, element.id + '/wsReferences')!.children = reduceResult.wsReference;
	SearchTree(element, element.id + '/styles')!.children = reduceResult.style;
	SearchTree(element, element.id + '/constants')!.children = reduceResult.constant;
	SearchTree(element, element.id + '/catalogs')!.children = reduceResult.catalog;

	const documents = SearchTree(element, element.id + '/documents');
	documents!.children = [ ...documents!.children ?? [], ...reduceResult.document];

	SearchTree(element, element.id + '/documentNumerators')!.children = reduceResult.documentNumerator;
	SearchTree(element, element.id + '/sequences')!.children = reduceResult.sequence;
	SearchTree(element, element.id + '/documentJournals')!.children = reduceResult.documentJournal;
	SearchTree(element, element.id + '/enums')!.children = reduceResult.enum;
	SearchTree(element, element.id + '/reports')!.children = reduceResult.report;
	SearchTree(element, element.id + '/dataProcessors')!.children = reduceResult.dataProcessor;
	SearchTree(element, element.id + '/chartsOfCharacteristicTypes')!.children = reduceResult.сhartOfCharacteristicTypes;
	SearchTree(element, element.id + '/chartsOfAccounts')!.children = reduceResult.chartOfAccounts;
	SearchTree(element, element.id + '/chartsOfCalculationTypes')!.children = reduceResult.chartOfCalculationTypes;
	SearchTree(element, element.id + '/informationRegisters')!.children = reduceResult.informationRegister;
	SearchTree(element, element.id + '/accumulationRegisters')!.children = reduceResult.accumulationRegister;
	SearchTree(element, element.id + '/accountingRegisters')!.children = reduceResult.accountingRegister;
	SearchTree(element, element.id + '/calculationRegisters')!.children = reduceResult.calculationRegister;
	SearchTree(element, element.id + '/businessProcesses')!.children = reduceResult.businessProcess;
	SearchTree(element, element.id + '/tasks')!.children = reduceResult.task;
	SearchTree(element, element.id + '/externalDataSources')!.children = reduceResult.externalDataSource;
	console.timeEnd('reduce');
}

function FillWebServiceItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries) {
  return (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$_name.startsWith(versionMetadata.$_name + '.Operation.') && m.$_name.split('.').length === 4)
		.map(m => GetTreeItem(idPrefix + m.$_id, m.$_name, {
      icon: 'operation', children: (versionMetadata
        .Metadata ?? [])
        .filter(f => f.$_name.startsWith(versionMetadata.$_name + '.Operation.' + m.$_name.split('.').pop() + '.Parameter.') && f.$_name.split('.').length === 6)
        .map(f => GetTreeItem(idPrefix + f.$_id, f.$_name, { icon: 'parameter' })) }));
}

function FillHttpServiceItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries) {
  return (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$_name.startsWith(versionMetadata.$_name + '.URLTemplate.') && m.$_name.split('.').length === 4)
		.map(m => GetTreeItem(idPrefix + m.$_id, m.$_name, {
      icon: 'urlTemplate', children: (versionMetadata
        .Metadata ?? [])
        .filter(f => f.$_name.startsWith(versionMetadata.$_name + '.URLTemplate.' + m.$_name.split('.').pop() + '.Method.') && f.$_name.split('.').length === 6)
        .map(f => GetTreeItem(idPrefix + f.$_id, f.$_name, { icon: 'parameter' })) }));
}

function FillObjectItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const attributes = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$_name.startsWith(versionMetadata.$_name + '.Attribute.'))
		.map(m => GetTreeItem(idPrefix + m.$_id, m.$_name, { icon: 'attribute' }));

	const tabularSection = (versionMetadata.Metadata ?? [])
		.filter(m => m.$_name.startsWith(versionMetadata.$_name + '.TabularSection.') && !m.$_name.includes('.Attribute.'))
		.map(m => GetTreeItem(idPrefix + m.$_id, m.$_name, {
			icon: 'tabularSection',
			// TODO: undefined for children if length eq zero
			children: (versionMetadata.Metadata ?? [])
				.filter(f => f.$_name.startsWith(versionMetadata.$_name + '.TabularSection.' + m.$_name.split('.').pop()) && f.$_name.includes('.Attribute.'))
				.map(f => GetTreeItem(idPrefix + f.$_id, f.$_name, { icon: 'attribute' })) }));

	const items = [
		GetTreeItem('', 'Реквизиты', { icon: 'attribute', children: attributes.length === 0 ? undefined : attributes }),
		GetTreeItem('', 'Табличные части', { icon: 'tabularSection', children: tabularSection }),
	];

	return [ ...items, ...FillCommonItems(idPrefix , versionMetadata, objectData) ];
}

function FillDocumentJournalItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const columns = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$_name.startsWith(versionMetadata.$_name + '.Column.'))
		.map(m => GetTreeItem(idPrefix + m.$_id, m.$_name, { icon: 'column' }));

	const items = [
		GetTreeItem('', 'Графы', { icon: 'column', children: columns.length === 0 ? undefined : columns }),
	];

	return [ ...items, ...FillCommonItems(idPrefix, versionMetadata, objectData) ];
}

function FillEnumItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const values = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$_name.startsWith('Enum.'))
		.map(m => GetTreeItem(idPrefix + m.$_id, m.$_name, { icon: 'attribute' }));
	
	const items = [
		GetTreeItem('', 'Значения', { icon: 'attribute', children: values.length === 0 ? undefined : values }),
	];

	return [ ...items, ...FillCommonItems(idPrefix, versionMetadata, objectData) ];
}

function FillChartOfAccountsItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const accountingFlags = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$_name.startsWith(versionMetadata.$_name + '.AccountingFlag.'))
		.map(m => GetTreeItem(idPrefix + m.$_id, m.$_name, { icon: 'accountingFlag' }));

	const extDimensionAccountingFlag = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$_name.startsWith(versionMetadata.$_name + '.ExtDimensionAccountingFlag.'))
		.map(m => GetTreeItem(idPrefix + m.$_id, m.$_name, { icon: 'extDimensionAccountingFlag' }));

  const items = [
		GetTreeItem('', 'Признаки учета', { icon: 'accountingFlag', children: accountingFlags.length === 0 ? undefined : accountingFlags }),
		GetTreeItem('', 'Признаки учета субконто', {
      icon: 'extDimensionAccountingFlag', children: extDimensionAccountingFlag.length === 0 ? undefined : extDimensionAccountingFlag }),
	];

	return [ ...items, ...FillObjectItemsByMetadata(idPrefix, versionMetadata, objectData) ]
    .sort((x, y) => { return x.label == "Реквизиты" ? -1 : y.label == "Реквизиты" ? 1 : 0; });
}

function FillRegisterItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const dimensions = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$_name.startsWith(versionMetadata.$_name + '.Dimension.'))
		.map(m => GetTreeItem(idPrefix + m.$_id, m.$_name, { icon: 'dimension' }));

	const resources = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$_name.startsWith(versionMetadata.$_name + '.Resource.'))
		.map(m => GetTreeItem(idPrefix + m.$_id, m.$_name, { icon: 'resource' }));

	const attributes = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$_name.startsWith(versionMetadata.$_name + '.Attribute.'))
		.map(m => GetTreeItem(idPrefix + m.$_id, m.$_name, { icon: 'attribute' }));

	const items = [
		GetTreeItem('', 'Измерения', { icon: 'dimension', children: dimensions.length === 0 ? undefined : dimensions }),
		GetTreeItem('', 'Ресурсы', { icon: 'resource', children: resources.length === 0 ? undefined : resources }),
		GetTreeItem('', 'Реквизиты', { icon: 'attribute', children: attributes.length === 0 ? undefined : attributes }),
	];

	return [ ...items, ...FillCommonItems(idPrefix, versionMetadata, objectData) ];
}

function FillCalculationRegisterItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
  const items: TreeItem[] = [
    // TODO: Перерасчеты
	];

  return [ ...items, ...FillRegisterItemsByMetadata(idPrefix, versionMetadata, objectData) ];
}

function FillTaskItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const attributes = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$_name.startsWith(versionMetadata.$_name + '.AddressingAttribute.'))
		.map(m => GetTreeItem(idPrefix + m.$_id, m.$_name, { icon: 'attribute' }));

  const items = [
		GetTreeItem('', 'Реквизиты адресации', { icon: 'attribute', children: attributes.length === 0 ? undefined : attributes }),
	];

	return [ ...items, ...FillObjectItemsByMetadata(idPrefix, versionMetadata, objectData) ]
    .sort((x, y) => { return x.label == "Реквизиты" ? -1 : y.label == "Реквизиты" ? 1 : 0; });
}

function FillExternalDataSourceItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
  const items: TreeItem[] = [
    // TODO:
	];

  return items;
}

function FillCommonItems(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const commands = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$_name.includes('.Command.'))
		.map(m => GetTreeItem(
      idPrefix + m.$_id,
      m.$_name,
      {
        icon: 'command',
        context: 'command',
        path: `${idPrefix}${CreatePath(m.$_name.split('.').slice(0, 2).join('.'))}/Commands/${m.$_name.split('.').pop()}`,
      }));

	return [
		GetTreeItem('', 'Формы', { icon: 'form', children: objectData.form[versionMetadata.$_name] }),
		GetTreeItem('', 'Команды', { icon: 'command', children: commands.length === 0 ? undefined : commands }),
		GetTreeItem('', 'Макеты', { icon: 'template', children: objectData.template[versionMetadata.$_name] }),
	];
}

function SearchTree(element: TreeItem, matchingId: string): TreeItem | null {
	if(element.id === matchingId) {
		return element;
	} else if (element.children != null) {
		let result = null;
		for(let i = 0; result == null && i < element.children.length; i++) {
			result = SearchTree(element.children[i], matchingId);
		}
		return result;
	}
	return null;
}

function GetSubsystemChildren(
  rootPath: vscode.Uri,
  rootId: string,
  versionMetadata: VersionMetadata[],
  name: string,
  level = 2
): TreeItem[] | undefined {
  const filtered = versionMetadata
    .filter(f => f.$_name.startsWith(`${name}.`) && f.$_name.split('.').length === 2 * level);

  if (filtered.length !== 0) {
    return filtered
      .map(m => {
        const chilldren = GetSubsystemChildren(rootPath, rootId, versionMetadata, m.$_name, level + 1);

        return GetTreeItem(
          rootId + '/' + m.$_id, m.$_name, {
            icon: 'subsystem',
            context: `subsystem_${rootId}`,
            children: chilldren,
            command: 'metadataViewer.filterBySubsystem',
            commandTitle: 'Filter by subsystem',
            commandArguments: CollectSubsystemContent(rootPath, `${rootId}/${CreatePath(m.$_name)}`.replace(/\./g, '/'))
          }
        );
      });
  }

  return undefined;
}

function CollectSubsystemContent(rootPath: vscode.Uri, treeItemPath: string): string[] {
  // добавляю к фильтру сами подсистемы с иерархией
  const subsystemContent: string[] = [
    ...treeItemPath.slice(treeItemPath.indexOf('Subsystem')).replace(/Subsystems\//g, 'Subsystem.').split('/')
  ];

  const path = treeItemPath + '.xml';

  vscode.workspace.fs.readFile(rootPath.with({ path }))
    .then(configXml => {
      const parser = new XMLParser({
        ignoreAttributes : false,
        attributeNamePrefix: '$_',
      });
      const result = parser.parse(Buffer.from(configXml));
      const content = result.MetaDataObject.Subsystem.Properties.Content["xr:Item"];
      if (content && content.length > 0) {
        for (const contentElem of content) {
          subsystemContent.push(contentElem["#text"]);
        }
      }
    });

  return subsystemContent;
}

function removeSubSystems(subsystemsTreeItem: TreeItem, subsystemFilter: string[]) {
  const indexesToDelete: number[] = [];
  subsystemsTreeItem.children?.forEach((ch, index) => {
    if (subsystemFilter.indexOf(`Subsystem.${ch.label}`) === -1) {
      indexesToDelete.push(index);
    } else {
      removeSubSystems(ch, subsystemFilter);
    }
  });
  indexesToDelete.sort((a, b) => b - a);
  indexesToDelete.forEach((d) => subsystemsTreeItem.children?.splice(d, 1));
}

export class NodeWithIdTreeDataProvider implements vscode.TreeDataProvider<TreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<any> = new vscode.EventEmitter<any>();
	readonly onDidChangeTreeData: vscode.Event<any> = this._onDidChangeTreeData.event;

  getChildren(element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> {
    if (element === undefined) {
      return tree;
    }
    return element.children;
  }

  getTreeItem(element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  getParent(element: TreeItem): TreeItem | undefined {
    return SearchTree(tree[0], element.parentId) ?? undefined;
  }

  update() {
    if (!tree) return;
    this._onDidChangeTreeData.fire(undefined);
  }
}

function CreateMetadata(idPrefix: string) {
  return [
    GetTreeItem(idPrefix + '/common', 'Общие', { icon: 'common', children: [
      GetTreeItem(idPrefix + '/subsystems', 'Подсистемы', { icon: 'subsystem', children: [] }),
      GetTreeItem(idPrefix + '/commonModules', 'Общие модули', { icon: 'commonModule', children: [] }),
      GetTreeItem(idPrefix + '/sessionParameters', 'Параметры сеанса', { icon: 'sessionParameter', children: [] }),
      GetTreeItem(idPrefix + '/roles', 'Роли', { icon: 'role', children: [] }),
      GetTreeItem(idPrefix + '/commonAttributes', 'Общие реквизиты', { icon: 'attribute', children: [] }),
      GetTreeItem(idPrefix + '/exchangePlans', 'Планы обмена', { icon: 'exchangePlan', children: [] }),
      GetTreeItem(idPrefix + '/filterCriteria', 'Критерии отбора', { icon: 'filterCriteria', children: [] }),
      GetTreeItem(idPrefix + '/eventSubscriptions', 'Подписки на события', { icon: 'eventSubscription', children: [] }),
      GetTreeItem(idPrefix + '/scheduledJobs', 'Регламентные задания', { icon: 'scheduledJob', children: [] }),
      //GetTreeItem(idPrefix + '', 'Боты', { children: [] }),
      GetTreeItem(idPrefix + '/functionalOptions', 'Функциональные опции', { children: [] }),
      GetTreeItem(idPrefix + '/functionalOptionsParameters', 'Параметры функциональных опций', { children: [] }),
      GetTreeItem(idPrefix + '/definedTypes', 'Определяемые типы', { children: [] }),
      GetTreeItem(idPrefix + '/settingsStorages', 'Хранилища настроек', { children: [] }),
      GetTreeItem(idPrefix + '/commonCommands', 'Общие команды', { children: [] }),
      GetTreeItem(idPrefix + '/commandGroups', 'Группы команд', { children: [] }),
      GetTreeItem(idPrefix + '/commonForms', 'Общие формы', { icon: 'form', children: [] }),
      GetTreeItem(idPrefix + '/commonTemplates', 'Общие макеты', { children: [] }),
      GetTreeItem(idPrefix + '/commonPictures', 'Общие картинки', { icon: 'picture', children: [] }),
      GetTreeItem(idPrefix + '/xdtoPackages', 'XDTO-пакеты', { children: [] }),
      GetTreeItem(idPrefix + '/webServices', 'Web-сервисы', { icon: 'ws', children: [] }),
      GetTreeItem(idPrefix + '/httpServices', 'HTTP-сервисы', { icon: 'http', children: [] }),
      GetTreeItem(idPrefix + '/wsReferences', 'WS-ссылки', { icon: 'wsLink', children: [] }),
      //GetTreeItem(idPrefix + '/', 'Сервисы интеграции', { children: [] }),
      GetTreeItem(idPrefix + '/styleItems', 'Элементы стиля', { children: [] }),
      GetTreeItem(idPrefix + '/styles', 'Стили', { icon: 'style', children: [] }),
      GetTreeItem(idPrefix + '/languages', 'Языки', { children: [] }),
    ]}),
    GetTreeItem(idPrefix + '/constants', 'Константы', { icon: 'constant', children: [] }),
    GetTreeItem(idPrefix + '/catalogs', 'Справочники', { icon: 'catalog', children: [] }),
    GetTreeItem(idPrefix + '/documents', 'Документы', { icon: 'document', children: [
      GetTreeItem(idPrefix + '/documentNumerators', 'Нумераторы', { icon: 'documentNumerator', children: [] }),
      GetTreeItem(idPrefix + '/sequences', 'Последовательности', { icon: 'sequence', children: [] }),
    ]}),
    GetTreeItem(idPrefix + '/documentJournals', 'Журналы документов', { icon: 'documentJournal', children: [] }),
    GetTreeItem(idPrefix + '/enums', 'Перечисления', { icon: 'enum', children: [] }),
    GetTreeItem(idPrefix + '/reports', 'Отчеты', { icon: 'report', children: [] }),
    GetTreeItem(idPrefix + '/dataProcessors', 'Обработки', { icon: 'dataProcessor', children: [] }),
    GetTreeItem(idPrefix + '/chartsOfCharacteristicTypes', 'Планы видов характеристик', { icon: 'chartsOfCharacteristicType', children: [] }),
    GetTreeItem(idPrefix + '/chartsOfAccounts', 'Планы счетов', { icon: 'chartsOfAccount', children: [] }),
    GetTreeItem(idPrefix + '/chartsOfCalculationTypes', 'Планы видов расчета', { icon: 'chartsOfCalculationType', children: [] }),
    GetTreeItem(idPrefix + '/informationRegisters', 'Регистры сведений', { icon: 'informationRegister', children: [] }),
    GetTreeItem(idPrefix + '/accumulationRegisters', 'Регистры накопления', { icon: 'accumulationRegister', children: [] }),
    GetTreeItem(idPrefix + '/accountingRegisters', 'Регистры бухгалтерии', { icon: 'accountingRegister', children: [] }),
    GetTreeItem(idPrefix + '/calculationRegisters', 'Регистры расчета', { icon: 'calculationRegister', children: [] }),
    GetTreeItem(idPrefix + '/businessProcesses', 'Бизнес-процессы', { icon: 'businessProcess', children: [] }),
    GetTreeItem(idPrefix + '/tasks', 'Задачи', { icon: 'task', children: [] }),
    GetTreeItem(idPrefix + '/externalDataSources', 'Внешние источники данных', { icon: 'externalDataSource', children: [] }),
  ];
}

function GetMetadataName(name: string) {
  return name
    .replace('Catalogs.', 'Справочник ');
}

function GetContent(object: { [key: string]: { [key: string]: string } }) {
  if (!object || !object['v8:item']) {
    return '';
  }

  if (Array.isArray(object['v8:item'])) {
    if (object['v8:item'].length > 0 && object['v8:item'][0]['v8:content']) {
      return object['v8:item'][0]['v8:content'].split('"').join('&quot;');
    }
    return '';
  }
  
  if (object['v8:item']['v8:content']) {
    return object['v8:item']['v8:content'].split('"').join('&quot;');
  }
  return '';
}
