import * as vscode from 'vscode';
import * as xml2js from 'xml2js';
import { posix } from 'path';
import * as path from 'path';
import { MetadataFile, ObjectMetadata, VersionMetadata } from './metadataInterfaces';

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
  path?: string,
	children?: TreeItem[],
}

export class TreeItem extends vscode.TreeItem {
	id: string;
	children: TreeItem[] | undefined;
	path?: string;
  
	constructor(id: string, label: string, children?: TreeItem[]) {
		super(
			label,
			children === undefined ?
				vscode.TreeItemCollapsibleState.None :
				vscode.TreeItemCollapsibleState.Collapsed);
		this.id = id;
		this.children = children;
	}
}

export class MetadataView {
	constructor(context: vscode.ExtensionContext) {
		const view = vscode.window.createTreeView('metadataView', { treeDataProvider: NodeWithIdTreeDataProvider(), showCollapseAll: true });
		context.subscriptions.push(view);

		vscode.workspace.workspaceFolders?.map(folder => {
			const folderUri = folder.uri;
			LoadAndParseConfigurationXml(folderUri);
		});
	}
}

const tree: TreeItem[] = [
	GetTreeItem({ $: { id: 'configuration', name: 'Конфигурация' } }, { path: 'Configuration', context: 'main', children: [
		GetTreeItem({ $: { id: 'common', name: 'Общие' } }, { icon: 'common', children: [
			GetTreeItem({ $: { id: 'subsystems', name: 'Подсистемы' } }, { icon: 'subsystem', children: [] }),
			GetTreeItem({ $: { id: 'commonModules', name: 'Общие модули' } }, { icon: 'commonModule', children: [] }),
			GetTreeItem({ $: { id: 'sessionParameters', name: 'Параметры сеанса' } }, { icon: 'sessionParameter', children: [] }),
			GetTreeItem({ $: { id: 'roles', name: 'Роли' } }, { icon: 'role', children: [] }),
			GetTreeItem({ $: { id: 'commonAttributes', name: 'Общие реквизиты' } }, { icon: 'attribute', children: [] }),
			GetTreeItem({ $: { id: 'exchangePlans', name: 'Планы обмена' } }, { icon: 'exchangePlan', children: [] }),
			GetTreeItem({ $: { id: 'filterCriteria', name: 'Критерии отбора' } }, { icon: 'filterCriteria', children: [] }),
			GetTreeItem({ $: { id: 'eventSubscriptions', name: 'Подписки на события' } }, { icon: 'eventSubscription', children: [] }),
			GetTreeItem({ $: { id: 'scheduledJobs', name: 'Регламентные задания' } }, { icon: 'scheduledJob', children: [] }),
			//GetTreeItem({ $: { id: '', name: 'Боты' } }, { children: [] }),
			GetTreeItem({ $: { id: 'functionalOptions', name: 'Функциональные опции' } }, { children: [] }),
			GetTreeItem({ $: { id: 'functionalOptionsParameters', name: 'Параметры функциональных опций' } }, { children: [] }),
			GetTreeItem({ $: { id: 'definedTypes', name: 'Определяемые типы' } }, { children: [] }),
			GetTreeItem({ $: { id: 'settingsStorages', name: 'Хранилища настроек' } }, { children: [] }),
			GetTreeItem({ $: { id: 'commonCommands', name: 'Общие команды' } }, { children: [] }),
			GetTreeItem({ $: { id: 'commandGroups', name: 'Группы команд' } }, { children: [] }),
			GetTreeItem({ $: { id: 'commonForms', name: 'Общие формы' } }, { children: [] }),
			GetTreeItem({ $: { id: 'commonTemplates', name: 'Общие макеты' } }, { children: [] }),
			GetTreeItem({ $: { id: 'commonPictures', name: 'Общие картинки' } }, { children: [] }),
			GetTreeItem({ $: { id: 'xdtoPackages', name: 'XDTO-пакеты' } }, { children: [] }),
			GetTreeItem({ $: { id: 'webServices', name: 'Web-сервисы' } }, { children: [] }),
			GetTreeItem({ $: { id: 'httpServices', name: 'HTTP-сервисы' } }, { children: [] }),
			GetTreeItem({ $: { id: 'wsReferences', name: 'WS-ссылки' } }, { children: [] }),
			//GetTreeItem({ $: { id: '', name: 'Сервисы интеграции' } }, { children: [] }),
			GetTreeItem({ $: { id: 'styleItems', name: 'Элементы стиля' } }, { children: [] }),
			//GetTreeItem({ $: { id: '', name: 'Стили' } }, { children: [] }),
			GetTreeItem({ $: { id: 'languages', name: 'Языки' } }, { children: [] }),
		]}),
		GetTreeItem({ $: { id: 'constants', name: 'Константы' } }, { icon: 'constant', children: [] }),
		GetTreeItem({ $: { id: 'catalogs', name: 'Справочники' } }, { icon: 'catalog', children: [] }),
		GetTreeItem({ $: { id: 'documents', name: 'Документы' } }, { icon: 'document', children: [
			GetTreeItem({ $: { id: 'documentNumerators', name: 'Нумераторы' } }, { children: [] }),
			GetTreeItem({ $: { id: 'sequences', name: 'Последовательности' } }, { children: [] }),
		]}),
		GetTreeItem({ $: { id: 'documentJournals', name: 'Журналы документов' } }, { icon: 'documentJournal', children: [] }),
		GetTreeItem({ $: { id: 'enums', name: 'Перечисления' } }, { icon: 'enum', children: [] }),
		GetTreeItem({ $: { id: 'reports', name: 'Отчеты' } }, { icon: 'report', children: [] }),
		GetTreeItem({ $: { id: 'dataProcessors', name: 'Обработки' } }, { icon: 'dataProcessor', children: [] }),
		GetTreeItem({ $: { id: 'chartsOfCharacteristicTypes', name: 'Планы видов характеристик' } }, { icon: 'chartsOfCharacteristicType', children: [] }),
		GetTreeItem({ $: { id: 'chartsOfAccounts', name: 'Планы счетов' } }, { icon: 'chartsOfAccount', children: [] }),
		GetTreeItem({ $: { id: 'chartsOfCalculationTypes', name: 'Планы видов расчета' } }, { icon: 'chartsOfCalculationType', children: [] }),
		GetTreeItem({ $: { id: 'informationRegisters', name: 'Регистры сведений' } }, { icon: 'informationRegister', children: [] }),
		GetTreeItem({ $: { id: 'accumulationRegisters', name: 'Регистры накопления' } }, { icon: 'accumulationRegister', children: [] }),
		GetTreeItem({ $: { id: 'accountingRegisters', name: 'Регистры бухгалтерии', } }, { icon: 'accountingRegister', children: [] }),
		GetTreeItem({ $: { id: 'calculationRegisters', name: 'Регистры расчета', } }, { icon: 'calculationRegister', children: [] }),
		GetTreeItem({ $: { id: 'businessProcesses', name: 'Бизнес-процессы', } }, { icon: 'businessProcess', children: [] }),
		GetTreeItem({ $: { id: 'tasks', name: 'Задачи', } }, { icon: 'task', children: [] }),
		GetTreeItem({ $: { id: 'externalDataSources', name: 'Внешние источники данных', } }, { icon: 'externalDataSource', children: [] }),
	]}),
];

function LoadAndParseConfigurationXml(uri: vscode.Uri) {
	vscode.workspace.fs.readFile(uri.with({ path: posix.join(uri.path, 'ConfigDumpInfo.xml') }))
		.then(configXml => {
			xml2js.parseString(configXml, (err, result) => {
				const typedResult = result as MetadataFile;
				CreateTreeElements(typedResult);
			});
		});
}

function CreateTreeElements(metadataFile: MetadataFile) {
	const versionMetadata = metadataFile.ConfigDumpInfo.ConfigVersions[0].Metadata;

	console.time('reduce');
	const attributeReduceResult = versionMetadata.reduce<MetadataDictionaries>((previous, current) => {
		const objectName = current.$.name.split('.').slice(0,2).join('.');
		if (current.$.name.includes('.Form.') && !(current.$.name.endsWith('.Form') || current.$.name.endsWith('.Help'))) {
			if (!previous.form[objectName]) {
				previous.form[objectName] = [];
			}
			previous.form[objectName].push(GetTreeItem(current, {
        icon: 'form', path: `${CreatePath(objectName)}/Forms/${current.$.name.split('.').pop()}`, context: 'form' }));
		} else if (current.$.name.includes('.Template.') && !current.$.name.endsWith('.Template')) {
			if (!previous.template[objectName]) {
				previous.template[objectName] = [];
			}
			previous.template[objectName].push(GetTreeItem(current, { icon: 'template' }));
		}
		return previous;
	}, { form: {}, template: {} });

	const reduceResult = versionMetadata.reduce<MetadataObjects>((previous, current) => {
		if (current.$.name.split('.').length !== 2) {
			return previous;
		}
		if (current.$.name.startsWith('CommonModule.')) {
			previous.commonModule.push(GetTreeItem(current, { icon: 'commonModule', context: 'module' }));
		} else if (current.$.name.startsWith('SessionParameter.')) {
			previous.sessionParameter.push(GetTreeItem(current, { icon: 'sessionParameter' }));
		} else if (current.$.name.startsWith('Role.')) {
			previous.role.push(GetTreeItem(current, { icon: 'role' }));
		} else if (current.$.name.startsWith('CommonAttribute.')) {
			previous.commonAttribute.push(GetTreeItem(current, { icon: 'attribute' }));
		} else if (current.$.name.startsWith('ExchangePlan.')) {
			previous.exchangePlan.push(GetTreeItem(current,
				{ icon: 'exchangePlan', context: 'object_and_manager', children: FillObjectItemsByMetadata(current, attributeReduceResult) }));
		} if (current.$.name.startsWith('Constant.')) {
				previous.constant.push(GetTreeItem(current, { icon: 'constant', context: 'valueManager_and_manager' }));
		} if (current.$.name.startsWith('Catalog.')) {
			previous.catalog.push(GetTreeItem(current, {
				icon: 'catalog', context: 'object_and_manager', children: FillObjectItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('Document.')) {
			previous.document.push(GetTreeItem(current, {
				icon: 'document', context: 'object_and_manager', children: FillObjectItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('DocumentJournal.')) {
			previous.documentJournal.push(GetTreeItem(current, {
				icon: 'documentJournal', context: 'manager', children: FillDocumentJournalItemsByMetadata(current, attributeReduceResult) }));
		} if (current.$.name.startsWith('Enum.')) {
			previous.enum.push(GetTreeItem(current, {
					icon: 'enum', context: 'manager', children: FillEnumItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('Report.')) {
      previous.report.push(GetTreeItem(current, {
        icon: 'report', context: 'object_and_manager', children: FillObjectItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('DataProcessor.')) {
      previous.dataProcessor.push(GetTreeItem(current, {
        icon: 'dataProcessor', context: 'object_and_manager', children: FillObjectItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('ChartOfCharacteristicTypes.')) {
      previous.сhartOfCharacteristicTypes.push(GetTreeItem(current, {
        icon: 'chartsOfCharacteristicType', context: 'object_and_manager', children: FillObjectItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('ChartOfAccounts.')) {
      previous.chartOfAccounts.push(GetTreeItem(current, {
        icon: 'chartsOfAccount', context: 'object_and_manager', children: FillChartOfAccountsItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('ChartOfCalculationTypes.')) {
      previous.chartOfCalculationTypes.push(GetTreeItem(current, {
        icon: 'chartsOfCalculationType', context: 'object_and_manager', children: FillObjectItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('InformationRegister.')) {
			previous.informationRegister.push(GetTreeItem(current, {
				icon: 'informationRegister', context: 'recordset_and_manager', children: FillRegisterItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('AccumulationRegister.')) {
			previous.accumulationRegister.push(GetTreeItem(current, {
				icon: 'accumulationRegister', context: 'recordset_and_manager', children: FillRegisterItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('AccountingRegister.')) {
      previous.accountingRegister.push(GetTreeItem(current, {
        icon: 'accountingRegister', context: 'recordset_and_manager', children: FillRegisterItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('CalculationRegister.')) {
      previous.calculationRegister.push(GetTreeItem(current, {
        icon: 'calculationRegister', context: 'recordset_and_manager', children: FillCalculationRegisterItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('BusinessProcess.')) {
      previous.businessProcess.push(GetTreeItem(current, {
        icon: 'businessProcess', context: 'object_and_manager', children: FillObjectItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('Task.')) {
      previous.task.push(GetTreeItem(current, {
        icon: 'task', context: 'object_and_manager', children: FillTaskItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('ExternalDataSource.')) {
      previous.externalDataSource.push(GetTreeItem(current, {
        icon: 'externalDataSource', children: FillExternalDataSourceItemsByMetadata(current, attributeReduceResult) }));
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

	SearchTree(tree[0], 'commonModules')!.children = reduceResult.commonModule;
	SearchTree(tree[0], 'sessionParameters')!.children = reduceResult.sessionParameter;
	SearchTree(tree[0], 'roles')!.children = reduceResult.role;
	SearchTree(tree[0], 'commonAttributes')!.children = reduceResult.commonAttribute;
	SearchTree(tree[0], 'exchangePlans')!.children = reduceResult.exchangePlan;
	SearchTree(tree[0], 'constants')!.children = reduceResult.constant;
	SearchTree(tree[0], 'catalogs')!.children = reduceResult.catalog;

	const documents = SearchTree(tree[0], 'documents');
	documents!.children = [ ...documents!.children ?? [], ...reduceResult.document];

	SearchTree(tree[0], 'documentJournals')!.children = reduceResult.documentJournal;
	SearchTree(tree[0], 'enums')!.children = reduceResult.enum;
	SearchTree(tree[0], 'reports')!.children = reduceResult.report;
	SearchTree(tree[0], 'dataProcessors')!.children = reduceResult.dataProcessor;
	SearchTree(tree[0], 'chartsOfCharacteristicTypes')!.children = reduceResult.сhartOfCharacteristicTypes;
	SearchTree(tree[0], 'chartsOfAccounts')!.children = reduceResult.chartOfAccounts;
	SearchTree(tree[0], 'chartsOfCalculationTypes')!.children = reduceResult.chartOfCalculationTypes;
	SearchTree(tree[0], 'informationRegisters')!.children = reduceResult.informationRegister;
	SearchTree(tree[0], 'accumulationRegisters')!.children = reduceResult.accumulationRegister;
	SearchTree(tree[0], 'accountingRegisters')!.children = reduceResult.accountingRegister;
	SearchTree(tree[0], 'calculationRegisters')!.children = reduceResult.calculationRegister;
	SearchTree(tree[0], 'businessProcesses')!.children = reduceResult.businessProcess;
	SearchTree(tree[0], 'tasks')!.children = reduceResult.task;
	SearchTree(tree[0], 'externalDataSources')!.children = reduceResult.externalDataSource;
	console.timeEnd('reduce');
}

function FillObjectItemsByMetadata(versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const attributes = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.Attribute.'))
		.map(m => GetTreeItem(m, { icon: 'attribute' }));

	const tabularSection = (versionMetadata.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.TabularSection.') && !m.$.name.includes('.Attribute.'))
		.map(m => GetTreeItem(m, {
			icon: 'tabularSection',
			// TODO: undefined for children if length eq zero
			children: (versionMetadata.Metadata ?? [])
				.filter(f => f.$.name.startsWith(versionMetadata.$.name + '.TabularSection.' + m.$.name.split('.').pop()) && f.$.name.includes('.Attribute.'))
				.map(f => GetTreeItem(f, { icon: 'attribute' })) }));

	const items = [
		GetTreeItem({ $: { id: '', name: 'Реквизиты'}}, { icon: 'attribute', children: attributes.length === 0 ? undefined : attributes }),
		GetTreeItem({ $: { id: '', name: 'Табличные части'}}, { icon: 'tabularSection', children: tabularSection }),
	];

	return [ ...items, ...FillCommonItems(versionMetadata, objectData) ];
}

function FillDocumentJournalItemsByMetadata(versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const columns = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.Column.'))
		.map(m => GetTreeItem(m, { icon: 'column' }));

	const items = [
		GetTreeItem({ $: { id: '', name: 'Графы'}}, { icon: 'column', children: columns.length === 0 ? undefined : columns }),
	];

	return [ ...items, ...FillCommonItems(versionMetadata, objectData) ];
}

function FillEnumItemsByMetadata(versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const values = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith('Enum.'))
		.map(m => GetTreeItem(m, { icon: 'attribute' }));
	
	const items = [
		GetTreeItem({ $: { id: '', name: 'Значения'}}, { icon: 'attribute', children: values.length === 0 ? undefined : values }),
	];

	return [ ...items, ...FillCommonItems(versionMetadata, objectData) ];
}

function FillChartOfAccountsItemsByMetadata(versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const accountingFlags = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.AccountingFlag.'))
		.map(m => GetTreeItem(m, { icon: 'accountingFlag' }));

	const extDimensionAccountingFlag = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.ExtDimensionAccountingFlag.'))
		.map(m => GetTreeItem(m, { icon: 'extDimensionAccountingFlag' }));

  const items = [
		GetTreeItem({ $: { id: '', name: 'Признаки учета'}}, { icon: 'accountingFlag', children: accountingFlags.length === 0 ? undefined : accountingFlags }),
		GetTreeItem({ $: { id: '', name: 'Признаки учета субконто'}}, {
      icon: 'extDimensionAccountingFlag', children: extDimensionAccountingFlag.length === 0 ? undefined : extDimensionAccountingFlag }),
	];

	return [ ...items, ...FillObjectItemsByMetadata(versionMetadata, objectData) ]
    .sort((x, y) => { return x.label == "Реквизиты" ? -1 : y.label == "Реквизиты" ? 1 : 0; });
}

function FillRegisterItemsByMetadata(versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const dimensions = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.Dimension.'))
		.map(m => GetTreeItem(m, { icon: 'dimension' }));

	const resources = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.Resource.'))
		.map(m => GetTreeItem(m, { icon: 'resource' }));

	const attributes = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.Attribute.'))
		.map(m => GetTreeItem(m, { icon: 'attribute' }));

	const items = [
		GetTreeItem({ $: { id: '', name: 'Измерения'}}, { icon: 'dimension', children: dimensions.length === 0 ? undefined : dimensions }),
		GetTreeItem({ $: { id: '', name: 'Ресурсы'}}, { icon: 'resource', children: resources.length === 0 ? undefined : resources }),
		GetTreeItem({ $: { id: '', name: 'Реквизиты'}}, { icon: 'attribute', children: attributes.length === 0 ? undefined : attributes }),
	];

	return [ ...items, ...FillCommonItems(versionMetadata, objectData) ];
}

function FillCalculationRegisterItemsByMetadata(versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
  const items: TreeItem[] = [
    // TODO: Перерасчеты
	];

  return [ ...items, ...FillRegisterItemsByMetadata(versionMetadata, objectData) ];
}

function FillTaskItemsByMetadata(versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const attributes = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.AddressingAttribute.'))
		.map(m => GetTreeItem(m, { icon: 'attribute' }));

  const items = [
		GetTreeItem({ $: { id: '', name: 'Реквизиты адресации'}}, { icon: 'attribute', children: attributes.length === 0 ? undefined : attributes }),
	];

	return [ ...items, ...FillObjectItemsByMetadata(versionMetadata, objectData) ]
    .sort((x, y) => { return x.label == "Реквизиты" ? -1 : y.label == "Реквизиты" ? 1 : 0; });
}

function FillExternalDataSourceItemsByMetadata(versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
  const items: TreeItem[] = [
    // TODO:
	];

  return items;
}

function FillCommonItems(versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const commands = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.includes('.Command.'))
		.map(m => GetTreeItem(m, { icon: 'command', context: 'command' }));

	return [
		GetTreeItem({ $: { id: '', name: 'Формы'}}, { icon: 'form', children: objectData.form[versionMetadata.$.name] }),
		GetTreeItem({ $: { id: '', name: 'Команды'}}, { icon: 'command', children: commands.length === 0 ? undefined : commands }),
		GetTreeItem({ $: { id: '', name: 'Макеты'}}, { icon: 'template', children: objectData.template[versionMetadata.$.name] }),
	];
}

function GetTreeItem(element: ObjectMetadata, params?: TreeItemParams ): TreeItem {
	const treeItem = new TreeItem(element.$.id, element.$.name.split('.').pop() ?? '', params?.children);

	if (params?.icon) {
		treeItem.iconPath = getIconPath(params.icon);
	}
	if (params?.context) {
		treeItem.contextValue = params.context;
	}
	treeItem.path = params?.path ?? CreatePath(element.$.name.split('.').slice(0,2).join('.'));
	if (params?.command && params.commandTitle) {
		treeItem.command = { command: params.command, title: params.commandTitle };
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
		.replace('ExternalDataSource.', 'ExternalDataSources/');
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
	};
}

function getIconPath(icon: string): string {
	const isDark = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
	return path.join(__filename, '..', '..', 'resources', isDark ? 'dark' : 'light', icon + '.svg');
}