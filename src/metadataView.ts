import * as vscode from 'vscode';
import * as xml2js from 'xml2js';
import { posix } from 'path';
import * as path from 'path';
import { MetadataFile, VersionMetadata } from './metadataInterfaces';

interface MetadataDictionaries {
	 form: { [key: string]: TreeItem[] },
	 command: { [key: string]: TreeItem[] },
	 template: { [key: string]: TreeItem[] },
}

interface MetadataObjects {
	commonModule: TreeItem[],
	constant: TreeItem[],
	catalog: TreeItem[],
	document: TreeItem[],
	enum: TreeItem[],
}

export class TreeItem extends vscode.TreeItem {
	id: string;
	children: TreeItem[] | undefined;
	path?: string;
  
	constructor(id: string, label: string, iconPath?: string, contextValue?: string, path?: string, children?: TreeItem[]) {
		super(
			label,
			children === undefined ?
				vscode.TreeItemCollapsibleState.None :
				vscode.TreeItemCollapsibleState.Collapsed);
		this.id = id;
		this.iconPath = iconPath,
		this.contextValue = contextValue;
		this.path = path;
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
	new TreeItem('configuration', 'Конфигурация', undefined, 'main', undefined, [
		new TreeItem('common', 'Общие', getIconPath('common'), undefined, undefined, [
			new TreeItem('subsystems', 'Подсистемы', getIconPath('subsystem'), undefined, undefined, []),
			new TreeItem('commonModules', 'Общие модули', getIconPath('commonModule'), undefined, undefined, []),
			new TreeItem('sessionParameters', 'Параметры сеанса', getIconPath('sessionParameter'), undefined, undefined, []),
			new TreeItem('roles', 'Роли', getIconPath('role'), undefined, undefined, []),
			new TreeItem('commonAttributes', 'Общие реквизиты', getIconPath('attribute'), undefined, undefined, []),
			new TreeItem('exchangePlans', 'Планы обмена', getIconPath('exchangePlan'), undefined, undefined, []),
		]),
		new TreeItem('constants', 'Константы', getIconPath('constant'), undefined, undefined, []),
		new TreeItem('catalogs', 'Справочники', getIconPath('catalog'), undefined, undefined, []),
		new TreeItem('documents', 'Документы', getIconPath('document'), undefined, undefined, [
			new TreeItem('documentNumerator', 'Нумераторы', undefined, undefined, undefined, []),
			// TODO: id
			new TreeItem('', 'Последовательности', undefined, undefined, undefined, []),
		]),
		new TreeItem('documentJournal', 'Журналы документов', undefined, undefined, undefined, []),
		new TreeItem('enums', 'Перечисления', getIconPath('enum'), undefined, undefined, []),
		new TreeItem('reports', 'Отчеты', getIconPath('report'), undefined, undefined, []),
		new TreeItem('dataProcessors', 'Обработки', getIconPath('dataProcessor'), undefined, undefined, []),
		// TODO: id
		new TreeItem('', 'Планы видов характеристик', undefined, undefined, undefined, []),
		new TreeItem('', 'Планы счетов', undefined, undefined, undefined, []),
		new TreeItem('', 'Планы видов расчета', undefined, undefined, undefined, []),
		new TreeItem('informationRegisters', 'Регистры сведений', getIconPath('informationRegister'), undefined, undefined, []),
		new TreeItem('', 'Регистры накопления', undefined, undefined, undefined, []),
		new TreeItem('', 'Регистры бухгалтерии', undefined, undefined, undefined, []),
		new TreeItem('', 'Регистры расчета', undefined, undefined, undefined, []),
		new TreeItem('businessProcesse', 'Бизнес-процессы', undefined, undefined, undefined, []),
		new TreeItem('tasks', 'Задачи', undefined, undefined, undefined, []),
		new TreeItem('', 'Внешние источники данных', undefined, undefined, undefined, []),
	]),
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
			previous.form[objectName].push(new TreeItem(
				current.$.id,
				current.$.name.split('.').pop() ?? '',
				getIconPath('form'),
				'form',
				CreatePath(objectName)
			));
		} else if (current.$.name.includes('.Template.') && !current.$.name.endsWith('.Template')) {
			if (!previous.template[objectName]) {
				previous.template[objectName] = [];
			}
			previous.template[objectName].push(new TreeItem(
				current.$.id,
				current.$.name.split('.').pop() ?? '',
				getIconPath('template')
			));
		}
		return previous;
	}, { form: {}, command: {}, template: {} });

	const reduceResult = versionMetadata.reduce<MetadataObjects>((previous, current) => {
		if (!current.Metadata && current.$.name.startsWith('CommonModule.') && !current.$.name.endsWith('.Module')) {
			previous.commonModule.push(new TreeItem(
				current.$.id,
				current.$.name.replace('CommonModule.', ''),
				getIconPath('commonModule'),
				'module'));
		} else if (!current.Metadata && current.$.name.startsWith('Constant.') && !current.$.name.endsWith('ValueManagerModule')) {
			previous.constant.push(new TreeItem(
				current.$.id,
				current.$.name.replace('Constant.', ''),
				getIconPath('constant')));
		} else if (current.Metadata && current.$.name.startsWith('Catalog.')) {
			previous.catalog.push(new TreeItem(
				current.$.id,
				current.$.name.replace('Catalog.', ''),
				getIconPath('catalog'),
				'object_and_manager',
				CreatePath(current.$.name),
				FillObjectItemsByMetadata(current, attributeReduceResult )));
		} else if (current.Metadata && current.$.name.startsWith('Document.')) {
			previous.document.push(new TreeItem(
				current.$.id,
				current.$.name.replace('Document.', ''),
				getIconPath('document'),
				'object_and_manager',
				CreatePath(current.$.name),
				FillObjectItemsByMetadata(current, attributeReduceResult)));
		} else if (current.$.name.startsWith('Enum.') &&
			!current.$.name.includes('.Form.') &&
			!current.$.name.includes('.Template.') &&
			!current.$.name.endsWith('.ManagerModule') &&
			!current.$.name.includes('.EnumValue.')) {
				previous.enum.push(new TreeItem(
					current.$.id,
					current.$.name.replace('Enum.', ''),
					getIconPath('enum'),
					undefined,
					undefined,
					FillEnumItemsByMetadata(current, attributeReduceResult)));
		}
		return previous;
	}, { commonModule: [], constant: [], catalog: [], document: [], enum: []});

	SearchTree(tree[0], 'commonModules')!.children = reduceResult.commonModule;
	SearchTree(tree[0], 'constants')!.children = reduceResult.constant;
	SearchTree(tree[0], 'catalogs')!.children = reduceResult.catalog;

	const documents = SearchTree(tree[0], 'documents');
	documents!.children = [ ...documents!.children ?? [], ...reduceResult.document];

	SearchTree(tree[0], 'enums')!.children = reduceResult.enum;
	console.timeEnd('reduce');
}

function FillObjectItemsByMetadata(versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const attributes = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.Attribute.'))
		.map(m => new TreeItem(m.$.id, m.$.name.replace(versionMetadata.$.name + '.Attribute.', ''), getIconPath('attribute')));

	const tabularSection = (versionMetadata.Metadata ?? [])
		.filter(m => m.$.name.startsWith(versionMetadata.$.name + '.TabularSection.') && !m.$.name.includes('.Attribute.'))
		.map(m => new TreeItem(
			m.$.id,
			m.$.name.replace(versionMetadata.$.name + '.TabularSection.', ''),
			getIconPath('tabularSection'),
			undefined,
			undefined,
			(versionMetadata.Metadata ?? [])
				.filter(f => f.$.name.startsWith(versionMetadata.$.name + '.TabularSection.' + m.$.name.split('.').pop()) && f.$.name.includes('.Attribute.'))
				.map(f => new TreeItem(
					f.$.id,
					f.$.name.split('.').pop() ?? '',
					getIconPath('attribute'),
				))));

	const commands = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.includes('.Command.'))
		.map(m => new TreeItem(m.$.id, m.$.name.replace(versionMetadata.$.name + '.Command.', ''), getIconPath('command'), 'command', CreatePath(versionMetadata.$.name)));

	return [
		new TreeItem('', 'Реквизиты', getIconPath('attribute'), undefined, undefined, attributes),
		new TreeItem('', 'Табличные части', getIconPath('tabularSection'), undefined, undefined, tabularSection),
		new TreeItem('', 'Формы', getIconPath('form'), undefined, undefined, objectData.form[versionMetadata.$.name]),
		new TreeItem('', 'Команды', getIconPath('command'), undefined, undefined, commands),
		new TreeItem('', 'Макеты', getIconPath('template'), undefined, undefined, objectData.template[versionMetadata.$.name]),
	];
}

function FillEnumItemsByMetadata(versionMetadata: VersionMetadata, objectData: MetadataDictionaries): TreeItem[] {
	const values = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.startsWith('Enum.'))
		.map(m => new TreeItem(m.$.id, m.$.name.replace(versionMetadata.$.name + '.EnumValue.', ''), getIconPath('attribute')));
	const commands = (versionMetadata
		.Metadata ?? [])
		.filter(m => m.$.name.includes('.Command.'))
		.map(m => new TreeItem(m.$.id, m.$.name.replace(versionMetadata.$.name + '.Command.', ''), getIconPath('command'), 'command', CreatePath(versionMetadata.$.name)));

	return [
		new TreeItem('', 'Значения', getIconPath('attribute'), undefined, undefined, values),
		new TreeItem('', 'Формы', getIconPath('form'), undefined, undefined, objectData.form[versionMetadata.$.name]),
		new TreeItem('', 'Команды', getIconPath('command'), undefined, undefined, commands),
		new TreeItem('', 'Макеты', getIconPath('template'), undefined, undefined, objectData.template[versionMetadata.$.name]),
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

function CreatePath(name: string): string {
	return name
		.replace('Catalog.', 'Catalogs/')
		.replace('Document.', 'Documents/');
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