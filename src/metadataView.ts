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
	constant: TreeItem[],
	catalog: TreeItem[],
	document: TreeItem[],
	enum: TreeItem[],
	report: TreeItem[],
	dataProcessor: TreeItem[],
	informationRegister: TreeItem[],
	accumulationRegister: TreeItem[],
}

type IconType = 'common' | 'subsystem' | 'commonModule' | 'sessionParameter' | 'role' | 'attribute' |
	'exchangePlan' | 'constant' | 'catalog' | 'document' | 'documentJournal' | 'enum' | 'report' |
	'dataProcessor' | 'chartsOfCharacteristicType' | 'chartsOfAccount' | 'chartsOfCalculationType' |
	'informationRegister' | 'accumulationRegister' | 'tabularSection' | 'form' | 'command' |
	'template' | 'dimension' | 'resource';

interface TreeItemParams {
	icon?: IconType,
	context?: string,
	command?: string,
	commandTitle?: string,
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
	GetTreeItem({ $: { id: 'configuration', name: 'Конфигурация' } }, { context: 'main', children: [
		GetTreeItem({ $: { id: 'common', name: 'Общие' } }, { icon: 'common', children: [
			GetTreeItem({ $: { id: 'subsystems', name: 'Подсистемы' } }, { icon: 'subsystem', children: [] }),
			GetTreeItem({ $: { id: 'commonModules', name: 'Общие модули' } }, { icon: 'commonModule', children: [] }),
			GetTreeItem({ $: { id: 'sessionParameters', name: 'Параметры сеанса' } }, { icon: 'sessionParameter', children: [] }),
			GetTreeItem({ $: { id: 'roles', name: 'Роли' } }, { icon: 'role', children: [] }),
			GetTreeItem({ $: { id: 'commonAttributes', name: 'Общие реквизиты' } }, { icon: 'attribute', children: [] }),
			GetTreeItem({ $: { id: 'exchangePlans', name: 'Планы обмена' } }, { icon: 'exchangePlan', children: [] }),
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
		GetTreeItem({ $: { id: 'accountingRegisters', name: 'Регистры бухгалтерии', } }, { children: [] }),
		GetTreeItem({ $: { id: 'calculationRegisters', name: 'Регистры расчета', } }, { children: [] }),
		GetTreeItem({ $: { id: 'businessProcesses', name: 'Бизнес-процессы', } }, { children: [] }),
		GetTreeItem({ $: { id: 'tasks', name: 'Задачи', } }, { children: [] }),
		GetTreeItem({ $: { id: 'externalDataSources', name: 'Внешние источники данных', } }, { children: [] }),
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
			previous.form[objectName].push(GetTreeItem(current, { icon: 'form', context: 'form' }));
		} else if (current.$.name.includes('.Template.') && !current.$.name.endsWith('.Template')) {
			if (!previous.template[objectName]) {
				previous.template[objectName] = [];
			}
			previous.template[objectName].push(GetTreeItem(current, { icon: 'template' }));
		}
		return previous;
	}, { form: {}, template: {} });

	const reduceResult = versionMetadata.reduce<MetadataObjects>((previous, current) => {
		if (!current.Metadata && current.$.name.startsWith('CommonModule.') && !current.$.name.endsWith('.Module')) {
			previous.commonModule.push(GetTreeItem(current, { icon: 'commonModule', context: 'module' }));
		} else if (!current.Metadata &&
			current.$.name.startsWith('Constant.') &&
			!current.$.name.endsWith('ManagerModule') &&
			!current.$.name.endsWith('ValueManagerModule')) {
				previous.constant.push(GetTreeItem(current, { icon: 'constant', context: 'valueManager_and_manager' }));
		} else if (current.Metadata && current.$.name.startsWith('Catalog.')) {
			previous.catalog.push(GetTreeItem(current, {
				icon: 'catalog', context: 'object_and_manager', children: FillObjectItemsByMetadata(current, attributeReduceResult ) }));
		} else if (current.Metadata && current.$.name.startsWith('Document.')) {
			previous.document.push(GetTreeItem(current, {
				icon: 'document', context: 'object_and_manager', children: FillObjectItemsByMetadata(current, attributeReduceResult ) }));
		} else if (current.$.name.startsWith('Enum.') &&
			!current.$.name.includes('.Form.') &&
			!current.$.name.includes('.Template.') &&
			!current.$.name.endsWith('.ManagerModule') &&
			!current.$.name.includes('.EnumValue.')) {
				previous.enum.push(GetTreeItem(current, {
					icon: 'enum', children: FillEnumItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('Report.') &&
			!current.$.name.includes('.Form.') &&
			!current.$.name.includes('.Template.') &&
			!current.$.name.includes('.Command.') &&
			!current.$.name.endsWith('.Help') &&
			!current.$.name.endsWith('.ManagerModule') &&
			!current.$.name.endsWith('.ObjectModule')) {
				previous.report.push(GetTreeItem(current, {
					icon: 'report', children: FillObjectItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.$.name.startsWith('DataProcessor.') &&
			!current.$.name.includes('.Form.') &&
			!current.$.name.includes('.Template.') &&
			!current.$.name.includes('.Command.') &&
			!current.$.name.endsWith('.Help') &&
			!current.$.name.endsWith('.ManagerModule') &&
			!current.$.name.endsWith('.ObjectModule')) {
				previous.dataProcessor.push(GetTreeItem(current, {
					icon: 'dataProcessor', children: FillObjectItemsByMetadata(current, attributeReduceResult) }));
		} else if (current.Metadata && current.$.name.startsWith('InformationRegister')) {
			previous.informationRegister.push(GetTreeItem(current, {
				icon: 'informationRegister', context: 'recordset_and_manager', children: FillRegisterItemsByMetadata(current, attributeReduceResult ) }));
		} else if (current.Metadata && current.$.name.startsWith('AccumulationRegister')) {
			previous.accumulationRegister.push(GetTreeItem(current, {
				icon: 'accumulationRegister', context: 'recordset_and_manager', children: FillRegisterItemsByMetadata(current, attributeReduceResult ) }));
		}
		return previous;
	}, { commonModule: [], constant: [], catalog: [], document: [], enum: [], report: [], dataProcessor: [], informationRegister: [], accumulationRegister: [] });

	SearchTree(tree[0], 'commonModules')!.children = reduceResult.commonModule;
	SearchTree(tree[0], 'constants')!.children = reduceResult.constant;
	SearchTree(tree[0], 'catalogs')!.children = reduceResult.catalog;

	const documents = SearchTree(tree[0], 'documents');
	documents!.children = [ ...documents!.children ?? [], ...reduceResult.document];

	SearchTree(tree[0], 'enums')!.children = reduceResult.enum;
	SearchTree(tree[0], 'reports')!.children = reduceResult.report;
	SearchTree(tree[0], 'dataProcessors')!.children = reduceResult.dataProcessor;
	SearchTree(tree[0], 'informationRegisters')!.children = reduceResult.informationRegister;
	SearchTree(tree[0], 'accumulationRegisters')!.children = reduceResult.accumulationRegister;
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
			children: (versionMetadata.Metadata ?? [])
				.filter(f => f.$.name.startsWith(versionMetadata.$.name + '.TabularSection.' + m.$.name.split('.').pop()) && f.$.name.includes('.Attribute.'))
				.map(f => GetTreeItem(f, { icon: 'attribute' })) }))

	const commands = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.includes('.Command.'))
		.map(m => GetTreeItem(m, { icon: 'command', context: 'command' }));

	return [
		GetTreeItem({ $: { id: '', name: 'Реквизиты'}}, { icon: 'attribute', children: attributes.length === 0 ? undefined : attributes }),
		GetTreeItem({ $: { id: '', name: 'Табличные части'}}, { icon: 'tabularSection', children: tabularSection }),
		GetTreeItem({ $: { id: '', name: 'Формы'}}, { icon: 'form', children: objectData.form[versionMetadata.$.name] }),
		GetTreeItem({ $: { id: '', name: 'Команды'}}, { icon: 'command', children: commands.length === 0 ? undefined : commands }),
		GetTreeItem({ $: { id: '', name: 'Макеты'}}, { icon: 'template', children: objectData.template[versionMetadata.$.name] }),
	];
}

function FillEnumItemsByMetadata(versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const values = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith('Enum.'))
		.map(m => GetTreeItem(m, { icon: 'attribute' }));
	
	const commands = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.includes('.Command.'))
		.map(m => GetTreeItem(m, { icon: 'command', context: 'command' }));

	return [
		GetTreeItem({ $: { id: '', name: 'Значения'}}, { icon: 'attribute', children: values.length === 0 ? undefined : values }),
		GetTreeItem({ $: { id: '', name: 'Формы'}}, { icon: 'form', children: objectData.form[versionMetadata.$.name] }),
		GetTreeItem({ $: { id: '', name: 'Команды'}}, { icon: 'command', children: commands.length === 0 ? undefined : commands }),
		GetTreeItem({ $: { id: '', name: 'Макеты'}}, { icon: 'template', children: objectData.template[versionMetadata.$.name] }),
	];
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

	const commands = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.includes('.Command.'))
		.map(m => GetTreeItem(m, { icon: 'command', context: 'command' }));

	return [
		GetTreeItem({ $: { id: '', name: 'Измерения'}}, { icon: 'dimension', children: dimensions.length === 0 ? undefined : dimensions }),
		GetTreeItem({ $: { id: '', name: 'Ресурсы'}}, { icon: 'resource', children: resources.length === 0 ? undefined : resources }),
		GetTreeItem({ $: { id: '', name: 'Реквизиты'}}, { icon: 'attribute', children: attributes.length === 0 ? undefined : attributes }),
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
	treeItem.path = CreatePath(element.$.name.split('.').slice(0,2).join('.'));
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

function CreatePath(name: string): string {
	return name
		.replace('Constant.', 'Constants/')
		.replace('Catalog.', 'Catalogs/')
		.replace('Document.', 'Documents/')
		.replace('Report.', 'Reports/')
		.replace('DataProcessor.', 'DataProcessors/')
		.replace('InformationRegister.', 'InformationRegisters/')
		.replace('AccumulationRegister.', 'AccumulationRegisters/');
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