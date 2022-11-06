import * as fs from 'fs';
import * as glob from 'fast-glob';
import * as vscode from 'vscode';
import * as xml2js from 'xml2js';
import { posix } from 'path';
import * as path from 'path';
import { MetadataFile, ObjectMetadata, ObjectParams, VersionMetadata } from './metadataInterfaces';
import { TemplatePanel } from './templatePanel';
import { TemplateFile } from './templatInterfaces';
import { PredefinedDataFile } from './predefinedDataInterfaces';
import { PredefinedDataPanel } from './predefinedDataPanel';

interface MetadataDictionaries {
	form: { [key: string]: TreeItem[] },
	template: { [key: string]: TreeItem[] },
}

interface MetadataObjects {
	commonModule: TreeItem[],
	sessionParameter: TreeItem[],
	role: TreeItem[],
	commonAttribute: TreeItem[],
	exchangePlan: TreeItem[],
	constant: TreeItem[],
	catalog: TreeItem[],
	document: TreeItem[],
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

type IconType = 'common' | 'subsystem' | 'commonModule' | 'sessionParameter' | 'role' | 'attribute' |
	'exchangePlan' | 'constant' | 'catalog' | 'document' | 'documentJournal' | 'enum' | 'report' |
	'dataProcessor' | 'chartsOfCharacteristicType' | 'chartsOfAccount' | 'chartsOfCalculationType' |
	'informationRegister' | 'accumulationRegister' | 'tabularSection' | 'form' | 'command' |
	'template' | 'dimension' | 'resource' | 'column' | 'task' | 'businessProcess' | 'externalDataSource' |
	'accountingRegister' | 'calculationRegister' | 'filterCriteria' | 'eventSubscription' | 'scheduledJob' |
  'accountingFlag' | 'extDimensionAccountingFlag';

interface TreeItemParams {
	icon?: IconType,
	context?: string,
	command?: string,
	commandTitle?: string,
  commandArguments?: any[],
  path?: string,
	children?: TreeItem[],
}

export class TreeItem extends vscode.TreeItem {
	id: string;
	children: TreeItem[] | undefined;
	path?: string;
  parentId = '';
  isConfiguration = false;
  
	constructor(id: string, label: string, children?: TreeItem[]) {
		super(
			label,
			children === undefined ?
				vscode.TreeItemCollapsibleState.None :
				id === 'configurations' ?
          vscode.TreeItemCollapsibleState.Expanded :
          vscode.TreeItemCollapsibleState.Collapsed);
		this.id = id;
    children?.forEach(ch => ch.parentId = id);
		this.children = children;
	}
}

export class MetadataView {
	constructor(context: vscode.ExtensionContext) {
		const view = vscode.window.createTreeView('metadataView', { treeDataProvider: NodeWithIdTreeDataProvider(), showCollapseAll: true });
		context.subscriptions.push(view);

    view.onDidExpandElement(e => {
      this.expand(e.element);
    });

		vscode.workspace.workspaceFolders?.map(folder => {
			const folderUri = folder.uri;
			LoadAndParseConfigurationXml(folderUri);
      view.reveal(tree[0]);
		});

    vscode.commands.registerCommand('metadataViewer.showTemplate', (template) => this.openTemplate(context, template));
    vscode.commands.registerCommand('metadataViewer.openPredefinedData', (item) => this.openPredefinedData(context, item));
	}

  private openTemplate(context: vscode.ExtensionContext, template: string): void {
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
      ? vscode.workspace.workspaceFolders[0].uri : undefined;

    if (rootPath) {
      const fileName = posix.join(template, 'Ext/Template.xml');
      if (!fs.existsSync(fileName)) {
        return;
      }
      vscode.workspace.fs.readFile(rootPath.with({ path: fileName }))
        .then(configXml => {
          xml2js.parseString(configXml, (err, result) => {
            const typedResult = result as TemplateFile;
            if (!typedResult.document) {
              // Это макет, но другого типа. Для него нужно писать свою панель
              return;
            }
            TemplatePanel.show(context.extensionUri, typedResult.document);
          });
        });
    }
  }

  private openPredefinedData(context: vscode.ExtensionContext, item: TreeItem): void {
    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
      ? vscode.workspace.workspaceFolders[0].uri : undefined;

    if (rootPath) {
      const fileName = posix.join(rootPath.fsPath, item.path!, 'Ext/Predefined.xml');
      if (!fs.existsSync(fileName)) {
        PredefinedDataPanel.show(context.extensionUri, { Item: [] });
      } else {
        vscode.workspace.fs.readFile(rootPath.with({ path: fileName }))
          .then(configXml => {
            xml2js.parseString(configXml, (err, result) => {
              if (err) {
                console.error(err);
                return;
              }

              const typedResult = result as PredefinedDataFile;
              PredefinedDataPanel.show(context.extensionUri, typedResult.PredefinedData);
            });
          });
      }
    }
  }

  private expand(element: TreeItem) {
    if (!element.isConfiguration) {
      return;
    }

    const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
      ? vscode.workspace.workspaceFolders[0].uri : undefined;

    if (rootPath) {
      vscode.workspace.fs.readFile(rootPath.with({ path: posix.join(element.id, 'ConfigDumpInfo.xml') }))
        .then(configXml => {
          xml2js.parseString(configXml, (err, result) => {
            if (err) {
              console.error(err);
              return;
            }

            const typedResult = result as MetadataFile;
            CreateTreeElements(element, typedResult);
          });
        });
    }
  }
}

const tree: TreeItem[] = [
	GetTreeItem('configurations', 'Конфигурации', { children: [] })
];

function LoadAndParseConfigurationXml(uri: vscode.Uri) {
  console.time('glob');
  const files = glob.sync([ '**/ConfigDumpInfo.xml', '**/Configuration.xml' ], {
    dot: true,
    cwd: uri.fsPath,
    absolute: true,
    deep: vscode.workspace.getConfiguration().get('metadataViewer.searchDepth'),
  });
  console.timeEnd('glob');

  const configurations = files.reduce<{ [key: string]: string[] }>((previous, current) => {
    const key = current.split('/').slice(0, -1).join('/');
    if (!previous[key]) {
      previous[key] = [];
    }
    previous[key].push(current);
    return previous;
  }, {});

  const filtered = Object
    .keys(configurations)
    .filter(f => configurations[f].length === 2);

  filtered.forEach(fc => {
    vscode.workspace.fs.readFile(uri.with({ path: posix.join(fc, 'Configuration.xml') }))
      .then(configXml => {
        xml2js.parseString(configXml, (err, result) => {
          if (err) {
            console.error(err);
            return;
          }

          let synonym = result.MetaDataObject.Configuration[0].Properties[0].Synonym[0]["v8:item"][0]["v8:content"][0];
          if (!synonym) {
            synonym = result.MetaDataObject.Configuration[0].Properties[0].Name[0];
          }

          console.log(`Конфигурация ${synonym} найдена`);

          const treeItem = new TreeItem(fc, `${synonym} (${fc})`, CreateMetadata(fc));
          treeItem.contextValue = 'main';
          treeItem.path = fc;
          treeItem.isConfiguration = true;

          tree[0].children?.push(treeItem);
        });
      });
  });
}

function CreateTreeElements(element: TreeItem, metadataFile: MetadataFile) {
	const versionMetadata = metadataFile.ConfigDumpInfo.ConfigVersions[0].Metadata;

  const treeItemIdSlash = element.id + '/';

	console.time('reduce');
	const attributeReduceResult = versionMetadata.reduce<MetadataDictionaries>((previous, current) => {
		const objectName = current.$.name.split('.').slice(0,2).join('.');
		if (current.$.name.includes('.Form.') && !(current.$.name.endsWith('.Form') || current.$.name.endsWith('.Help'))) {
			if (!previous.form[objectName]) {
				previous.form[objectName] = [];
			}
			previous.form[objectName].push(GetTreeItem(
        treeItemIdSlash + current.$.id,
        current.$.name,
        {
          icon: 'form',
          context: 'form',
          path: `${element.id}/${CreatePath(objectName)}/Forms/${current.$.name.split('.').pop()}`,
        }));
		} else if (current.$.name.includes('.Template.') && !current.$.name.endsWith('.Template')) {
			if (!previous.template[objectName]) {
				previous.template[objectName] = [];
			}
      const path = `${element.id}/${CreatePath(objectName)}/Templates/${current.$.name.split('.').pop()}`;
			previous.template[objectName].push(GetTreeItem(
        treeItemIdSlash + current.$.id,
        current.$.name,
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
		if (current.$.name.split('.').length !== 2) {
			return previous;
		}

    const treeItemId = treeItemIdSlash + current.$.id;
    const treeItemPath = `${treeItemIdSlash}${CreatePath(current.$.name)}`;
  
    switch (true) {
      case current.$.name.startsWith('CommonModule.'):
        previous.commonModule.push(GetTreeItem(
          treeItemId, current.$.name,
          { icon: 'commonModule', context: 'module', path: treeItemPath, }));

        break;
      case current.$.name.startsWith('SessionParameter.'):
        previous.sessionParameter.push(GetTreeItem(treeItemId, current.$.name, { icon: 'sessionParameter' }));
        break;
      case current.$.name.startsWith('Role.'):
        previous.role.push(GetTreeItem(treeItemId, current.$.name, { icon: 'role' }));
        break;
      case current.$.name.startsWith('CommonAttribute.'):
        previous.commonAttribute.push(GetTreeItem(treeItemId, current.$.name, { icon: 'attribute' }));
        break;
      case current.$.name.startsWith('ExchangePlan.'):
        previous.exchangePlan.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'exchangePlan', context: 'object_and_manager', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('Constant.'):
        previous.constant.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'constant', context: 'valueManager_and_manager', path: treeItemPath, }));

        break;
      case current.$.name.startsWith('Catalog.'):
        previous.catalog.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'catalog', context: 'object_and_manager_and_predefined', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('Document.'):
        previous.document.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'document', context: 'object_and_manager', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('DocumentJournal.'):
        previous.documentJournal.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'documentJournal', context: 'manager', path: treeItemPath,
            children: FillDocumentJournalItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('Enum.'):
        previous.enum.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'enum', context: 'manager', path: treeItemPath,
            children: FillEnumItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('Report.'):
        previous.report.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'report', context: 'object_and_manager', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('DataProcessor.'):
        previous.dataProcessor.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'dataProcessor', context: 'object_and_manager', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('ChartOfCharacteristicTypes.'):
        previous.сhartOfCharacteristicTypes.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'chartsOfCharacteristicType', context: 'object_and_manager_and_predefined', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('ChartOfAccounts.'):
        previous.chartOfAccounts.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'chartsOfAccount', context: 'object_and_manager_and_predefined', path: treeItemPath,
            children: FillChartOfAccountsItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('ChartOfCalculationTypes.'):
        previous.chartOfCalculationTypes.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'chartsOfCalculationType', context: 'object_and_manager_and_predefined', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('InformationRegister.'):
        previous.informationRegister.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'informationRegister', context: 'recordset_and_manager', path: treeItemPath,
            children: FillRegisterItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('AccumulationRegister.'):
        previous.accumulationRegister.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'accumulationRegister', context: 'recordset_and_manager', path: treeItemPath,
            children: FillRegisterItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('AccountingRegister.'):
        previous.accountingRegister.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'accountingRegister', context: 'recordset_and_manager', path: treeItemPath,
            children: FillRegisterItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('CalculationRegister.'):
        previous.calculationRegister.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'calculationRegister', context: 'recordset_and_manager', path: treeItemPath,
            children: FillCalculationRegisterItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('BusinessProcess.'):
        previous.businessProcess.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'businessProcess', context: 'object_and_manager', path: treeItemPath,
            children: FillObjectItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('Task.'):
        previous.task.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'task', context: 'object_and_manager', path: treeItemPath,
            children: FillTaskItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
      case current.$.name.startsWith('ExternalDataSource.'):
        previous.externalDataSource.push(GetTreeItem(
          treeItemId, current.$.name, {
            icon: 'externalDataSource',
            children: FillExternalDataSourceItemsByMetadata(treeItemIdSlash, current, attributeReduceResult) }));
  
        break;
    }
		
		return previous;
	}, {
		commonModule: [],
		sessionParameter: [],
		role: [],
		commonAttribute: [],
		exchangePlan: [],
		constant: [],
		catalog: [],
		document: [],
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

	SearchTree(element, element.id + '/commonModules')!.children = reduceResult.commonModule;
	SearchTree(element, element.id + '/sessionParameters')!.children = reduceResult.sessionParameter;
	SearchTree(element, element.id + '/roles')!.children = reduceResult.role;
	SearchTree(element, element.id + '/commonAttributes')!.children = reduceResult.commonAttribute;
	SearchTree(element, element.id + '/exchangePlans')!.children = reduceResult.exchangePlan;
	SearchTree(element, element.id + '/constants')!.children = reduceResult.constant;
	SearchTree(element, element.id + '/catalogs')!.children = reduceResult.catalog;

	const documents = SearchTree(element, element.id + '/documents');
	documents!.children = [ ...documents!.children ?? [], ...reduceResult.document];

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

function FillObjectItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const attributes = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.Attribute.'))
		.map(m => GetTreeItem(idPrefix + m.$.id, m.$.name, { icon: 'attribute' }));

	const tabularSection = (versionMetadata.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.TabularSection.') && !m.$.name.includes('.Attribute.'))
		.map(m => GetTreeItem(idPrefix + m.$.id, m.$.name, {
			icon: 'tabularSection',
			// TODO: undefined for children if length eq zero
			children: (versionMetadata.Metadata ?? [])
				.filter(f => f.$.name.startsWith(versionMetadata.$.name + '.TabularSection.' + m.$.name.split('.').pop()) && f.$.name.includes('.Attribute.'))
				.map(f => GetTreeItem(idPrefix + f.$.id, f.$.name, { icon: 'attribute' })) }));

	const items = [
		GetTreeItem('', 'Реквизиты', { icon: 'attribute', children: attributes.length === 0 ? undefined : attributes }),
		GetTreeItem('', 'Табличные части', { icon: 'tabularSection', children: tabularSection }),
	];

	return [ ...items, ...FillCommonItems(idPrefix , versionMetadata, objectData) ];
}

function FillDocumentJournalItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const columns = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.Column.'))
		.map(m => GetTreeItem(idPrefix + m.$.id, m.$.name, { icon: 'column' }));

	const items = [
		GetTreeItem('', 'Графы', { icon: 'column', children: columns.length === 0 ? undefined : columns }),
	];

	return [ ...items, ...FillCommonItems(idPrefix, versionMetadata, objectData) ];
}

function FillEnumItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const values = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith('Enum.'))
		.map(m => GetTreeItem(idPrefix + m.$.id, m.$.name, { icon: 'attribute' }));
	
	const items = [
		GetTreeItem('', 'Значения', { icon: 'attribute', children: values.length === 0 ? undefined : values }),
	];

	return [ ...items, ...FillCommonItems(idPrefix, versionMetadata, objectData) ];
}

function FillChartOfAccountsItemsByMetadata(idPrefix: string, versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const accountingFlags = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.AccountingFlag.'))
		.map(m => GetTreeItem(idPrefix + m.$.id, m.$.name, { icon: 'accountingFlag' }));

	const extDimensionAccountingFlag = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.ExtDimensionAccountingFlag.'))
		.map(m => GetTreeItem(idPrefix + m.$.id, m.$.name, { icon: 'extDimensionAccountingFlag' }));

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
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.Dimension.'))
		.map(m => GetTreeItem(idPrefix + m.$.id, m.$.name, { icon: 'dimension' }));

	const resources = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.Resource.'))
		.map(m => GetTreeItem(idPrefix + m.$.id, m.$.name, { icon: 'resource' }));

	const attributes = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.Attribute.'))
		.map(m => GetTreeItem(idPrefix + m.$.id, m.$.name, { icon: 'attribute' }));

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
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.AddressingAttribute.'))
		.map(m => GetTreeItem(idPrefix + m.$.id, m.$.name, { icon: 'attribute' }));

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
		.filter(m => m.$.name.includes('.Command.'))
		.map(m => GetTreeItem(
      idPrefix + m.$.id,
      m.$.name,
      {
        icon: 'command',
        context: 'command',
        path: `${idPrefix}${CreatePath(m.$.name)}/Commands/${m.$.name.split('.').pop()}`,
      }));

	return [
		GetTreeItem('', 'Формы', { icon: 'form', children: objectData.form[versionMetadata.$.name] }),
		GetTreeItem('', 'Команды', { icon: 'command', children: commands.length === 0 ? undefined : commands }),
		GetTreeItem('', 'Макеты', { icon: 'template', children: objectData.template[versionMetadata.$.name] }),
	];
}

function GetTreeItem(id: string, name: string, params: TreeItemParams ): TreeItem {
	const treeItem = new TreeItem(id, name.split('.').pop() ?? '', params?.children);

	if (params.icon) {
		treeItem.iconPath = getIconPath(params.icon);
	}
	if (params.context) {
		treeItem.contextValue = params.context;
	}
	treeItem.path = params.path;
	if (params.command && params.commandTitle) {
		treeItem.command = { command: params.command, title: params.commandTitle, arguments: params.commandArguments };
	}

	return treeItem;
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

// TODO: Ужасная функция!!!1 Первая очередь на рефакторинг!
function CreatePath(name: string): string {
	return name
		.replace('CommonModule.', 'CommonModules/')
		.replace('ExchangePlan.', 'ExchangePlans/')
		.replace('Constant.', 'Constants/')
		.replace('Catalog.', 'Catalogs/')
		.replace('Document.', 'Documents/')
		.replace('DocumentJournal.', 'DocumentJournals/')
		.replace('Enum.', 'Enums/')
		.replace('Report.', 'Reports/')
		.replace('DataProcessor.', 'DataProcessors/')
		.replace('ChartOfCharacteristicTypes.', 'ChartsOfCharacteristicTypes/')
		.replace('ChartOfAccounts.', 'ChartsOfAccounts/')
		.replace('ChartOfCalculationTypes.', 'ChartsOfCalculationTypes/')
		.replace('InformationRegister.', 'InformationRegisters/')
		.replace('AccumulationRegister.', 'AccumulationRegisters/')
		.replace('AccountingRegister.', 'AccountingRegisters/')
		.replace('CalculationRegister.', 'CalculationRegisters/')
		.replace('BusinessProcess.', 'BusinessProcesses/')
		.replace('Task.', 'Tasks/')
		.replace('ExternalDataSource.', 'ExternalDataSources/')
		.replace('.Template.', '/Templates/');
}

function NodeWithIdTreeDataProvider(): vscode.TreeDataProvider<TreeItem> {
	return {
		getChildren: (element?: TreeItem | undefined): vscode.ProviderResult<TreeItem[]> => {
			if (element === undefined) {
				return tree;
			}
			return element.children;
		},
		getTreeItem: (element: TreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> => {
			return element;
		},
    getParent(element: TreeItem): TreeItem | undefined{
      return SearchTree(tree[0], element.parentId) ?? undefined;
    },
	};
}

function getIconPath(icon: string): string {
	const isDark = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
	return path.join(__filename, '..', '..', 'resources', isDark ? 'dark' : 'light', icon + '.svg');
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
      GetTreeItem(idPrefix + '/commonForms', 'Общие формы', { children: [] }),
      GetTreeItem(idPrefix + '/commonTemplates', 'Общие макеты', { children: [] }),
      GetTreeItem(idPrefix + '/commonPictures', 'Общие картинки', { children: [] }),
      GetTreeItem(idPrefix + '/xdtoPackages', 'XDTO-пакеты', { children: [] }),
      GetTreeItem(idPrefix + '/webServices', 'Web-сервисы', { children: [] }),
      GetTreeItem(idPrefix + '/httpServices', 'HTTP-сервисы', { children: [] }),
      GetTreeItem(idPrefix + '/wsReferences', 'WS-ссылки', { children: [] }),
      //GetTreeItem(idPrefix + '/', 'Сервисы интеграции', { children: [] }),
      GetTreeItem(idPrefix + '/styleItems', 'Элементы стиля', { children: [] }),
      //GetTreeItem(idPrefix + '/', 'Стили', { children: [] }),
      GetTreeItem(idPrefix + '/languages', 'Языки', { children: [] }),
    ]}),
    GetTreeItem(idPrefix + '/constants', 'Константы', { icon: 'constant', children: [] }),
    GetTreeItem(idPrefix + '/catalogs', 'Справочники', { icon: 'catalog', children: [] }),
    GetTreeItem(idPrefix + '/documents', 'Документы', { icon: 'document', children: [
      GetTreeItem(idPrefix + '/documentNumerators', 'Нумераторы', { children: [] }),
      GetTreeItem(idPrefix + '/sequences', 'Последовательности', { children: [] }),
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