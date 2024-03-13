import { XMLParser } from 'fast-xml-parser';
import * as vscode from 'vscode';
import { CreatePath, GetTreeItem, TreeItem } from './utils';
import { posix } from 'path';
import { Metadata } from './edtMetadataInterfaces';

export class Edt {
	private xmlPath: vscode.Uri;

	constructor(xmlPath: vscode.Uri) {
		this.xmlPath = xmlPath;
	}

	createTreeElements(root: TreeItem) {
    vscode.workspace.fs.readFile(this.xmlPath)
			.then(configXml => {
				const arrayPaths = [
					'mdclass:Configuration.subsystems',
					'mdclass:Configuration.commonModules',
					'mdclass:Configuration.sessionParameters',
					'mdclass:Configuration.roles',
					'mdclass:Configuration.commonAttributes',
					'mdclass:Configuration.exchangePlans',
					'mdclass:Configuration.filterCriteria',
					'mdclass:Configuration.eventSubscriptions',
					'mdclass:Configuration.scheduledJobs',
					'mdclass:Configuration.functionalOptions',
					'mdclass:Configuration.functionalOptionsParameters',
					'mdclass:Configuration.definedTypes',
					'mdclass:Configuration.settingsStorages',
					'mdclass:Configuration.commonCommands',
					'mdclass:Configuration.commandGroups',
					'mdclass:Configuration.commonForms',
					'mdclass:Configuration.commonTemplates',
					'mdclass:Configuration.commonPictures',
					'mdclass:Configuration.xdtoPackages',
					'mdclass:Configuration.webServices',
					'mdclass:Configuration.httpServices',
					'mdclass:Configuration.wsReferences',
					'mdclass:Configuration.styleItems',
					'mdclass:Configuration.styles',
					//'mdclass:Configuration.languages',
					'mdclass:Configuration.constants',
					'mdclass:Configuration.catalogs',
					'mdclass:Configuration.documents',
					'mdclass:Configuration.documentNumerators',
					'mdclass:Configuration.sequences',
					'mdclass:Configuration.documentJournals',
					'mdclass:Configuration.enums',
					'mdclass:Configuration.reports',
					'mdclass:Configuration.dataProcessors',
					'mdclass:Configuration.chartsOfCharacteristicTypes',
					'mdclass:Configuration.chartsOfAccounts',
					'mdclass:Configuration.chartsOfCalculationTypes',
					'mdclass:Configuration.informationRegisters',
					'mdclass:Configuration.accomulationRegisters',
					'mdclass:Configuration.accountingRegisters',
					'mdclass:Configuration.calculationRegisters',
					'mdclass:Configuration.businessProcesses',
					'mdclass:Configuration.tasks',
					'mdclass:Configuration.externalDataSources',
				];
				const parser = new XMLParser({
					ignoreAttributes: false,
					attributeNamePrefix: '$_',
					isArray: (name, jpath, isLeafNode, isAttribute) => {
						if(arrayPaths.indexOf(jpath) !== -1) return true;

						return false;
					}
				});
				const configuration = parser.parse(Buffer.from(configXml))['mdclass:Configuration'];

				if (configuration) {
					arrayPaths.forEach((path) => {
						const objectsName = path.split('.')[1];
						const objects = configuration[objectsName];

						if (objects && objects.length) {
							const subTree: TreeItem[] = [];

							objects.forEach((obj: any) => {
								this.createElement(subTree, root.id, obj);
							});

							this.searchTree(root, root.id + '/' + objectsName)!.children = subTree;
						}
					});
				}
			});
	}

	createElement(subTree: TreeItem[], rootPath: string, objName: string) {
		const workspaceFolders = vscode.workspace.workspaceFolders;
		if (!workspaceFolders) {
			return;
		}
		const folderUri = workspaceFolders[0].uri;

		const objectPath = CreatePath(objName);
		const treeItemIdSlash = rootPath + '/';

		const xmlPath = folderUri.with({ path: posix.join(
			rootPath,
			objectPath,
			objName.split('.')[1] + '.mdo'
		) });

		vscode.workspace.fs.readFile(xmlPath)
			.then(configXml => {
				const arrayPaths = [
					'mdclass:Subsystem.subsystems',
					'mdclass:Catalog.attributes',
					'mdclass:Catalog.tabularSections',
					'mdclass:Catalog.tabularSections.attributes',
					'mdclass:Catalog.forms',
					'mdclass:Catalog.commands',
					'mdclass:Catalog.templates',
					'mdclass:Document.attributes',
					'mdclass:Document.tabularSections',
					'mdclass:Document.tabularSections.attributes',
					'mdclass:Document.forms',
					'mdclass:Document.commands',
					'mdclass:Document.templates',
				];
				const parser = new XMLParser({
					ignoreAttributes: false,
					attributeNamePrefix: '$_',
					isArray: (name, jpath, isLeafNode, isAttribute) => {
						if(arrayPaths.indexOf(jpath) !== -1) return true;

						return false;
					}
				});
				const element = parser.parse(Buffer.from(configXml));
				const elementObject = element[Object.keys(element)[1]];
				const elementName = elementObject.name;

				const treeItemId = treeItemIdSlash + elementObject.$_uuid;
				const treeItemPath = `${treeItemIdSlash}${CreatePath(objectPath)}`;
		
				switch (objName.split('.')[0]) {
					case 'Subsystem':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'subsystem', children: this.getSubsystemChildren(elementObject)
						}));

						break;
					case 'CommonModule':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'commonModule', context: 'module', path: treeItemPath,
						}));

						break;
					case 'SessionParameter':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, { icon: 'sessionParameter' }));

						break;
					case 'Role':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, { icon: 'role' }));

						break;
					case 'CommonAttribute':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, { icon: 'attribute' }));

						break;
					case 'ExchangePlan':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'exchangePlan', context: 'object_and_manager', path: treeItemPath,
							children: this.fillObjectItemsByMetadata(treeItemIdSlash, elementObject)
						}));

						break;
					case 'EventSubscription':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'eventSubscription', context: 'handler', path: treeItemPath,
						}));

						break;
					case 'ScheduledJob':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'scheduledJob', context: 'handler', path: treeItemPath,
						}));

						break;
					case 'CommonForm':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'form', context: 'form', path: treeItemPath,
						}));

						break;
					case 'CommonPicture':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, { icon: 'picture' }));

						break;
					case 'WebService':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'ws', context: 'module', path: treeItemPath,
							children: this.fillWebServiceItemsByMetadata()
						}));

						break;
					case 'HTTPService':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'http', context: 'module', path: treeItemPath,
							children: this.fillHttpServiceItemsByMetadata()
						}));

						break;
					case 'WSReference':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, { icon: 'wsLink' }));

						break;
					case 'Style':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, { icon: 'style' }));

						break;
					case 'Constant':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'constant', context: 'valueManager_and_manager', path: treeItemPath,
						}));

						break;
					case 'Catalog':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'catalog', context: 'object_and_manager_and_predefined', path: treeItemPath,
							children: this.fillObjectItemsByMetadata(treeItemIdSlash, elementObject)
						}));

						break;
					case 'Document':
						subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'document', context: 'object_and_manager', path: treeItemPath,
							children: this.fillObjectItemsByMetadata(treeItemIdSlash, elementObject)
						}));

						break;
					case 'DocumentJournal':

						break;
					case 'Enum':

						break;
					case 'Report':

						break;
					case 'DataProcessor':

						break;
					case 'ChartOfCharacteristicTypes':

						break;
					case 'ChartOfAccounts':

						break;
					case 'ChartOfCalculationTypes':

						break;
					case 'InformationRegister':

						break;
					case 'AccumulationRegister':

						break;
					case 'AccountingRegister':

						break;
					case 'CalculationRegister':

						break;
					case 'BusinessProcess':

						break;
					case 'Task':

						break;
					case 'ExternalDataSource':

						break;
				}
			});
	}

	searchTree(element: TreeItem, matchingId: string): TreeItem | null {
		if(element.id === matchingId) {
			return element;
		} else if (element.children != null) {
			let result = null;
			for(let i = 0; result == null && i < element.children.length; i++) {
				result = this.searchTree(element.children[i], matchingId);
			}
			return result;
		}
		return null;
	}

	getSubsystemChildren(obj: any): TreeItem[] | undefined {
		return undefined;
	}

	fillObjectItemsByMetadata(idPrefix: string, metadata: Metadata) {
		const attributes = metadata.attributes?.
			map((attr: any) => GetTreeItem(idPrefix + attr.$_uuid, attr.name, { icon: 'attribute' }));
		const tabularSection = metadata.tabularSections?.
			map((tabularSection: any) => GetTreeItem(idPrefix + tabularSection.$_uuid, tabularSection.name, { icon: 'tabularSection',
				children: tabularSection.attributes?.
					map((tsAttr: any) => GetTreeItem(idPrefix + tsAttr.$_uuid, tsAttr.name, { icon: 'attribute' }))}));

		const items = [
			GetTreeItem('', 'Реквизиты', { icon: 'attribute', children: attributes?.length === 0 ? undefined : attributes }),
			GetTreeItem('', 'Табличные части', { icon: 'tabularSection', children: tabularSection }),
		]

		return [ ...items, ...this.fillCommonItems(idPrefix, metadata) ];
	}

	fillWebServiceItemsByMetadata() {
		return undefined;
	}

	fillHttpServiceItemsByMetadata() {
		return undefined;
	}

	fillCommonItems(idPrefix: string, metadata: Metadata) {
		return [
			GetTreeItem('', 'Формы', {
				icon: 'form',
				children: metadata.forms?.map((form: any) => GetTreeItem(idPrefix + form.$_uuid, form.name, {
					icon: 'form',
					context: 'form',
					path: '// TODO:'
				}))
			}),
			GetTreeItem('', 'Команды', {
				icon: 'command',
				children: metadata.commands?.map((form: any) => GetTreeItem(idPrefix + form.$_uuid, form.name, {
					icon: 'command',
					context: 'command',
					path: '// TODO:'
				}))
			}),
			GetTreeItem('', 'Макеты', {
				icon: 'template',
				children: metadata.templates?.map((template: any) => GetTreeItem(idPrefix + template.$_uuid, template.name, {
					icon: 'template',
          command: 'metadataViewer.showTemplate',
          commandTitle: 'Show template',
          commandArguments: [ '// TODO:' ],
					path: '// TODO:'
				}))
			}),
		];
	}
}