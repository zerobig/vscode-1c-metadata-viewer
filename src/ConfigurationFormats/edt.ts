import { XMLParser } from 'fast-xml-parser';
import * as vscode from 'vscode';
import * as fs from 'fs';
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

				console.time('edtDownload');
				if (configuration) {
					arrayPaths.forEach((path) => {
						const objectsName = path.split('.')[1];
						const objects = configuration[objectsName];

						if (objects && objects.length) {
							const treeItem = this.searchTree(root, root.id + '/' + objectsName);
							const subTree: TreeItem[] = [...treeItem?.children ?? []];

							objects.forEach((obj: any) => {
								this.createElement(subTree, root.id, obj);
							});

							treeItem!.children = subTree;
						}
					});
				}
				console.timeEnd('edtDownload');
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

		const configXml = fs.readFileSync(xmlPath.fsPath);
		const arrayPaths = [
			'mdclass:Subsystem.subsystems',
			'mdclass:ExchangePlan.attributes',
			'mdclass:ExchangePlan.tabularSections',
			'mdclass:ExchangePlan.tabularSections.attributes',
			'mdclass:ExchangePlan.forms',
			'mdclass:ExchangePlan.commands',
			'mdclass:ExchangePlan.templates',
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
			'mdclass:DocumentJournal.columns',
			'mdclass:DocumentJournal.forms',
			'mdclass:DocumentJournal.commands',
			'mdclass:DocumentJournal.templates',
			'mdclass:Enum.enumValues',
			'mdclass:Enum.forms',
			'mdclass:Enum.commands',
			'mdclass:Enum.templates',
			'mdclass:Report.attributes',
			'mdclass:Report.tabularSections',
			'mdclass:Report.tabularSections.attributes',
			'mdclass:Report.forms',
			'mdclass:Report.commands',
			'mdclass:Report.templates',
			'mdclass:DataProcessor.attributes',
			'mdclass:DataProcessor.tabularSections',
			'mdclass:DataProcessor.tabularSections.attributes',
			'mdclass:DataProcessor.forms',
			'mdclass:DataProcessor.commands',
			'mdclass:DataProcessor.templates',
			'mdclass:ChartOfCharacteristicTypes.attributes',
			'mdclass:ChartOfCharacteristicTypes.tabularSections',
			'mdclass:ChartOfCharacteristicTypes.tabularSections.attributes',
			'mdclass:ChartOfCharacteristicTypes.forms',
			'mdclass:ChartOfCharacteristicTypes.commands',
			'mdclass:ChartOfCharacteristicTypes.templates',
			'mdclass:ChartOfAccounts.attributes',
			'mdclass:ChartOfAccounts.accountingFlag',
			'mdclass:ChartOfAccounts.extDimensionAccountingFlag',
			'mdclass:ChartOfAccounts.tabularSections',
			'mdclass:ChartOfAccounts.tabularSections.attributes',
			'mdclass:ChartOfAccounts.forms',
			'mdclass:ChartOfAccounts.commands',
			'mdclass:ChartOfAccounts.templates',
			'mdclass:ChartOfCalculationTypes.attributes',
			'mdclass:ChartOfCalculationTypes.tabularSections',
			'mdclass:ChartOfCalculationTypes.tabularSections.attributes',
			'mdclass:ChartOfCalculationTypes.forms',
			'mdclass:ChartOfCalculationTypes.commands',
			'mdclass:ChartOfCalculationTypes.templates',
			'mdclass:InformationRegister.resources',
			'mdclass:InformationRegister.dimensions',
			'mdclass:InformationRegister.attributes',
			'mdclass:InformationRegister.forms',
			'mdclass:InformationRegister.commands',
			'mdclass:InformationRegister.templates',
			'mdclass:AccumulationRegister.resources',
			'mdclass:AccumulationRegister.forms',
			'mdclass:AccumulationRegister.commands',
			'mdclass:AccountingRegister.resources',
			'mdclass:AccountingRegister.forms',
			'mdclass:AccountingRegister.commands',
			'mdclass:CalculationRegister.resources',
			'mdclass:CalculationRegister.attributes',
			'mdclass:CalculationRegister.recalculations',
			'mdclass:CalculationRegister.forms',
			'mdclass:CalculationRegister.commands',
			'mdclass:BusinessProcess.attributes',
			'mdclass:BusinessProcess.tabularSections',
			'mdclass:BusinessProcess.tabularSections.attributes',
			'mdclass:BusinessProcess.forms',
			'mdclass:BusinessProcess.commands',
			'mdclass:BusinessProcess.templates',
			'mdclass:Task.addressingAttributes',
			'mdclass:Task.attributes',
			'mdclass:Task.tabularSections',
			'mdclass:Task.tabularSections.attributes',
			'mdclass:Task.forms',
			'mdclass:Task.commands',
			'mdclass:Task.templates',
			//ExternalDataSource
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
					icon: 'subsystem', children: this.getSubsystemChildren(elementObject),
					configType: 'edt'
				}));

				break;
			case 'CommonModule':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'commonModule', context: 'module', path: treeItemPath,
					configType: 'edt'
				}));

				break;
			case 'SessionParameter':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'sessionParameter', configType: 'edt'
				}));

				break;
			case 'Role':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'role', configType: 'edt'
				}));

				break;
			case 'CommonAttribute':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'attribute', configType: 'edt'
				}));

				break;
			case 'ExchangePlan':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'exchangePlan', context: 'object_and_manager', path: treeItemPath,
					children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'ExchangePlans', elementObject),
					configType: 'edt'
				}));

				break;
			case 'EventSubscription':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'eventSubscription', context: 'handler', path: treeItemPath,
					configType: 'edt'
				}));

				break;
			case 'ScheduledJob':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'scheduledJob', context: 'handler', path: treeItemPath,
					configType: 'edt'
				}));

				break;
			case 'CommonForm':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'form', context: 'form', path: treeItemPath,
					configType: 'edt'
				}));

				break;
			case 'CommonPicture':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'picture', configType: 'edt'
				}));

				break;
			case 'WebService':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'ws', context: 'module', path: treeItemPath,
					children: this.fillWebServiceItemsByMetadata(),
					configType: 'edt'
				}));

				break;
			case 'HTTPService':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'http', context: 'module', path: treeItemPath,
					children: this.fillHttpServiceItemsByMetadata(),
					configType: 'edt'
				}));

				break;
			case 'WSReference':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'wsLink', configType: 'edt'
				}));

				break;
			case 'Style':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'style', configType: 'edt'
				}));

				break;
			case 'Constant':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'constant', context: 'valueManager_and_manager', path: treeItemPath,
					configType: 'edt'
				}));

				break;
			case 'Catalog':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'catalog', context: 'object_and_manager_and_predefined', path: treeItemPath,
					children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'Catalogs', elementObject),
					configType: 'edt'
				}));

				break;
			case 'Document':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'document', context: 'object_and_manager', path: treeItemPath,
					children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'Documents', elementObject),
					configType: 'edt'
				}));

				break;
			case 'Sequence':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, { configType: 'edt' }));

				break;
			case 'DocumentJournal':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'documentJournal', context: 'manager', path: treeItemPath,
					children: this.fillDocumentJournalItemsByMetadata(treeItemIdSlash, elementObject),
					configType: 'edt'
				}));

				break;
			case 'Enum':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'enum', context: 'manager', path: treeItemPath,
					children: this.fillEnumItemsByMetadata(treeItemIdSlash, elementObject),
					configType: 'edt'
				}));

				break;
			case 'Report':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'report', context: 'object_and_manager', path: treeItemPath,
					children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'Reports', elementObject),
					configType: 'edt'
				}));

				break;
			case 'DataProcessor':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'dataProcessor', context: 'object_and_manager', path: treeItemPath,
					children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'DataProcessors', elementObject),
					configType: 'edt'
				}));

				break;
			case 'ChartOfCharacteristicTypes':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'chartsOfCharacteristicType', context: 'object_and_manager_and_predefined', path: treeItemPath,
					children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'ChartsOfCharacteristicTypes', elementObject),
					configType: 'edt'
				}));

				break;
			case 'ChartOfAccounts':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'chartsOfAccount', context: 'object_and_manager_and_predefined', path: treeItemPath,
					children: this.fillChartOfAccountsItemsByMetadata(treeItemIdSlash, elementObject),
					configType: 'edt'
				}));

				break;
			case 'ChartOfCalculationTypes':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'chartsOfCalculationType', context: 'object_and_manager_and_predefined', path: treeItemPath,
					children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'ChartsOfCalculationTypes', elementObject),
					configType: 'edt'
				}));

				break;
			case 'InformationRegister':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'informationRegister', context: 'recordset_and_manager', path: treeItemPath,
					children: this.fillRegisterItemsByMetadata(treeItemIdSlash, 'InformationRegisters', elementObject),
					configType: 'edt'
				}));

				break;
			case 'AccumulationRegister':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'accumulationRegister', context: 'recordset_and_manager', path: treeItemPath,
					children: this.fillRegisterItemsByMetadata(treeItemIdSlash, 'AccumulationRegisters', elementObject),
					configType: 'edt'
				}));

				break;
			case 'AccountingRegister':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'accountingRegister', context: 'recordset_and_manager', path: treeItemPath,
					children: this.fillRegisterItemsByMetadata(treeItemIdSlash, 'AccountingRegisters', elementObject),
					configType: 'edt'
				}));

				break;
			case 'CalculationRegister':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'calculationRegister', context: 'recordset_and_manager', path: treeItemPath,
					children: this.fillCalculationRegisterItemsByMetadata(treeItemIdSlash, elementObject),
					configType: 'edt'
				}));

				break;
			case 'BusinessProcess':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'businessProcess', context: 'object_and_manager', path: treeItemPath,
					children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'BusinessProcesses', elementObject),
					configType: 'edt'
				}));

				break;
			case 'Task':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'task', context: 'object_and_manager', path: treeItemPath,
					children: this.fillTaskItemsByMetadata(treeItemIdSlash, elementObject),
					configType: 'edt'
				}));

				break;
			case 'ExternalDataSource':
				subTree.push(GetTreeItem(treeItemId, elementName ?? objName, {
					icon: 'externalDataSource',
					children: this.fillExternalDataSourceItemsByMetadata(treeItemIdSlash, elementObject),
					configType: 'edt'
				}));

				break;
		}
	}

	searchTree(element: TreeItem, matchingId: string): TreeItem | null {
		if(element.id === matchingId) {
			return element;
		} else if (element.children != null && element.children.length > 0) {
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

	fillObjectItemsByMetadata(idPrefix: string, metadataType: string, metadata: Metadata) {
		const attributes = metadata.attributes?.
			map((attr) => GetTreeItem(idPrefix + attr.$_uuid, attr.name, { icon: 'attribute' }));
		const tabularSection = metadata.tabularSections?.
			map((tabularSection) => GetTreeItem(idPrefix + tabularSection.$_uuid, tabularSection.name, { icon: 'tabularSection',
				children: tabularSection.attributes?.
					map((tsAttr) => GetTreeItem(idPrefix + tsAttr.$_uuid, tsAttr.name, { icon: 'attribute' }))}));

		const items = [
			GetTreeItem('', 'Реквизиты', { icon: 'attribute', children: attributes?.length === 0 ? undefined : attributes }),
			GetTreeItem('', 'Табличные части', { icon: 'tabularSection', children: tabularSection }),
		];

		return [ ...items, ...this.fillCommonItems(idPrefix, metadataType, metadata) ];
	}

	fillWebServiceItemsByMetadata() {
		return undefined;
	}

	fillHttpServiceItemsByMetadata() {
		return undefined;
	}

	fillCommonItems(idPrefix: string, metadataType: string, metadata: Metadata) {
		return [
			GetTreeItem('', 'Формы', {
				icon: 'form',
				children: metadata.forms?.map((form) => GetTreeItem(idPrefix + form.$_uuid, form.name, {
					icon: 'form',
					context: 'form',
					path: `${idPrefix}${metadataType}/${metadata.name}/Forms/${form.name}`,
					configType: 'edt',
				}))
			}),
			GetTreeItem('', 'Команды', {
				icon: 'command',
				children: metadata.commands?.map((command) => GetTreeItem(idPrefix + command.$_uuid, command.name, {
					icon: 'command',
					context: 'command',
					path: `${idPrefix}${metadataType}/${metadata.name}/Commands/${command.name}`,
					configType: 'edt',
				}))
			}),
			GetTreeItem('', 'Макеты', {
				icon: 'template',
				children: metadata.templates?.map((template) => {
					const path = `${idPrefix}${metadataType}/${metadata.name}/Templates/${template.name}`;

					return GetTreeItem(idPrefix + template.$_uuid, template.name, {
						icon: 'template',
						command: 'metadataViewer.showTemplate',
						commandTitle: 'Show template',
						commandArguments: [ path ],
						path: path,
						configType: 'edt',
					});
				})
			}),
		];
	}

	fillDocumentJournalItemsByMetadata(idPrefix: string, metadata: Metadata) {
		const items = [
			GetTreeItem('', 'Графы', { icon: 'column', children: metadata.columns?.
				map((column) => GetTreeItem(idPrefix + column.$_uuid, column.name, {
					icon: 'template'
				}))
			}),
		];

		return [ ...items, ...this.fillCommonItems(idPrefix, 'DocumentJournals', metadata) ];
	}

	fillEnumItemsByMetadata(idPrefix: string, metadata: Metadata) {
		const items = [
			GetTreeItem('', 'Значения', { icon: 'attribute', children: metadata.enumValues?.
				map((enumValue) => GetTreeItem(idPrefix + enumValue.$_uuid, enumValue.name, {
					icon: 'attribute'
				}))
			}),
		];

		return [ ...items, ...this.fillCommonItems(idPrefix, 'Enums', metadata) ];
	}

	fillChartOfAccountsItemsByMetadata(idPrefix: string, metadata: Metadata) {
		const items = [
			GetTreeItem('', 'Признаки учета', { icon: 'accountingFlag', children: metadata.accountingFlags?.
				map((accountingFlag) => GetTreeItem(idPrefix + accountingFlag.$_uuid, accountingFlag.name, {
					icon: 'accountingFlag'
				}))
			}),
			GetTreeItem('', 'Признаки учета субконто', { icon: 'extDimensionAccountingFlag',
				children: metadata.extDimensionAccountingFlags?.
					map((extDimensionAccountingFlag) => GetTreeItem(idPrefix + extDimensionAccountingFlag.$_uuid, extDimensionAccountingFlag.name, {
						icon: 'extDimensionAccountingFlag'
					}))
			}),
		];
	
		return [ ...items, ...this.fillObjectItemsByMetadata(idPrefix, 'ChartsOfAccounts', metadata) ]
			.sort((x, y) => { return x.label == "Реквизиты" ? -1 : y.label == "Реквизиты" ? 1 : 0; });
	}

	fillRegisterItemsByMetadata(idPrefix: string, metadataType: string, metadata: Metadata) {
		const items = [
			GetTreeItem('', 'Измерения', { icon: 'dimension', children: metadata.dimensions?.
				map((dimension) => GetTreeItem(idPrefix + dimension.$_uuid, dimension.name, { icon: 'dimension' }))
			}),
			GetTreeItem('', 'Ресурсы', { icon: 'resource', children: metadata.resources?.
				map((resource) => GetTreeItem(idPrefix + resource.$_uuid, resource.name, { icon: 'resource' }))
			}),
			GetTreeItem('', 'Реквизиты', { icon: 'attribute', children: metadata.attributes?.
				map((attr) => GetTreeItem(idPrefix + attr.$_uuid, attr.name, { icon: 'attribute' }))
			}),
		];
	
		return [ ...items, ...this.fillCommonItems(idPrefix, metadataType, metadata) ];
	}

	fillCalculationRegisterItemsByMetadata(idPrefix: string, metadata: Metadata) {
		const items: TreeItem[] = [
			// TODO: Перерасчеты
		];
	
		return [ ...items, ...this.fillRegisterItemsByMetadata(idPrefix, 'CalculationRegisters', metadata) ];
	}

	fillTaskItemsByMetadata(idPrefix: string, metadata: Metadata) {
		const items = [
			GetTreeItem('', 'Реквизиты адресации', { icon: 'attribute', children: metadata.addressingAttributes?.
				map((attr) => GetTreeItem(idPrefix + attr.$_uuid, attr.name, { icon: 'attribute' }))
			}),
		];
	
		return [ ...items, ...this.fillObjectItemsByMetadata(idPrefix, 'Tasks', metadata) ]
			.sort((x, y) => { return x.label == "Реквизиты" ? -1 : y.label == "Реквизиты" ? 1 : 0; });
	}

	fillExternalDataSourceItemsByMetadata(idPrefix: string, metadata: Metadata) {
		const items: TreeItem[] = [
			// TODO:
		];
	
		return items;
	}
}