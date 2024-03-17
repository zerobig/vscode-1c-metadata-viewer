import { XMLParser } from 'fast-xml-parser';
import * as vscode from 'vscode';
import * as fs from 'fs';
import {
	CreatePath,
	GetTreeItem,
	TreeItem,
	getConfigPaths, 
	getObjectPaths} from './utils';
import { posix, resolve } from 'path';
import { Metadata } from './edtMetadataInterfaces';
import { ProgressLocation, window } from 'vscode';

export class Edt {
	private xmlPath: vscode.Uri;

	constructor(xmlPath: vscode.Uri) {
		this.xmlPath = xmlPath;
	}

	createTreeElements(root: TreeItem) {
		window.withProgress({
			location: ProgressLocation.Notification,
			title: "Происходит загрузка конфигурации",
			cancellable: true
		}, async (progress, _) => {
			const arrayPaths = getConfigPaths();
			const configXml = fs.readFileSync(this.xmlPath.fsPath, 'utf8');
			const parser = new XMLParser({
				ignoreAttributes: false,
				attributeNamePrefix: '$_',
				isArray: (name, jpath, isLeafNode, isAttribute) => {
					if(arrayPaths.indexOf(jpath) !== -1) return true;

					return false;
				}
			});
			const configuration = parser.parse(Buffer.from(configXml))['mdclass:Configuration'];

			let total = 0;
			arrayPaths.forEach(path => {
				total += configuration[path.split('.')[1]]?.length ?? 0;
			});

			console.time('edtDownload');
			if (configuration) {
				let count = 0;
				for (const [index, path] of arrayPaths.entries()) {
					const objectsName = path.split('.')[1];
					const objects = configuration[objectsName];

					if (objects && objects.length) {
						const treeItem = this.searchTree(root, root.id + '/' + objectsName);
						const subTree: TreeItem[] = [...treeItem?.children ?? []];

						for (const [indexOfObjects, obj] of objects.entries()) {
							count++;

							if (count % Math.round(total / 100) === 0) {
								progress.report({ increment: 1 });
							}
							
							progress.report({
								message: `
									загрузка ${indexOfObjects + 1} из ${objects.length} объектов
									${treeItem?.label?.toString().toLowerCase()}`
							});

							const subtreeItem = await this.createElement(root.id, obj);
							if (subtreeItem) {
								subTree.push(subtreeItem);
							}
						}

						treeItem!.children = subTree;
					}
				}
			}
			console.timeEnd('edtDownload');
		}); // WithProgress
	}

	async createElement(rootPath: string, objName: string) {
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

		return fs.promises.readFile(xmlPath.fsPath)
			.then(async (configXml) => {
				const arrayPaths = getObjectPaths();
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
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'subsystem', children: this.getSubsystemChildren(elementObject),
							configType: 'edt'
						});
					case 'CommonModule':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'commonModule', context: 'module', path: treeItemPath,
							configType: 'edt'
						});
					case 'SessionParameter':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'sessionParameter', configType: 'edt'
						});
					case 'Role':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'role', configType: 'edt'
						});
					case 'CommonAttribute':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'attribute', configType: 'edt'
						});
					case 'ExchangePlan':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'exchangePlan', context: 'object_and_manager', path: treeItemPath,
							children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'ExchangePlans', elementObject),
							configType: 'edt'
						});
					case 'EventSubscription':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'eventSubscription', context: 'handler', path: treeItemPath,
							configType: 'edt'
						});
					case 'ScheduledJob':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'scheduledJob', context: 'handler', path: treeItemPath,
							configType: 'edt'
						});
					case 'CommonForm':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'form', context: 'form', path: treeItemPath,
							configType: 'edt'
						});
					case 'CommonPicture':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'picture', configType: 'edt'
						});
					case 'WebService':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'ws', context: 'module', path: treeItemPath,
							children: this.fillWebServiceItemsByMetadata(),
							configType: 'edt'
						});
					case 'HTTPService':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'http', context: 'module', path: treeItemPath,
							children: this.fillHttpServiceItemsByMetadata(),
							configType: 'edt'
						});
					case 'WSReference':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'wsLink', configType: 'edt'
						});
					case 'Style':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'style', configType: 'edt'
						});
					case 'Constant':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'constant', context: 'valueManager_and_manager', path: treeItemPath,
							configType: 'edt'
						});
					case 'Catalog':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'catalog', context: 'object_and_manager_and_predefined', path: treeItemPath,
							children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'Catalogs', elementObject),
							configType: 'edt'
						});
					case 'Document':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'document', context: 'object_and_manager', path: treeItemPath,
							children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'Documents', elementObject),
							configType: 'edt'
						});
					case 'Sequence':
						return GetTreeItem(treeItemId, elementName ?? objName, { configType: 'edt' });
					case 'DocumentJournal':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'documentJournal', context: 'manager', path: treeItemPath,
							children: this.fillDocumentJournalItemsByMetadata(treeItemIdSlash, elementObject),
							configType: 'edt'
						});
					case 'Enum':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'enum', context: 'manager', path: treeItemPath,
							children: this.fillEnumItemsByMetadata(treeItemIdSlash, elementObject),
							configType: 'edt'
						});
					case 'Report':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'report', context: 'object_and_manager', path: treeItemPath,
							children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'Reports', elementObject),
							configType: 'edt'
						});
					case 'DataProcessor':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'dataProcessor', context: 'object_and_manager', path: treeItemPath,
							children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'DataProcessors', elementObject),
							configType: 'edt'
						});
					case 'ChartOfCharacteristicTypes':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'chartsOfCharacteristicType', context: 'object_and_manager_and_predefined', path: treeItemPath,
							children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'ChartsOfCharacteristicTypes', elementObject),
							configType: 'edt'
						});
					case 'ChartOfAccounts':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'chartsOfAccount', context: 'object_and_manager_and_predefined', path: treeItemPath,
							children: this.fillChartOfAccountsItemsByMetadata(treeItemIdSlash, elementObject),
							configType: 'edt'
						});
					case 'ChartOfCalculationTypes':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'chartsOfCalculationType', context: 'object_and_manager_and_predefined', path: treeItemPath,
							children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'ChartsOfCalculationTypes', elementObject),
							configType: 'edt'
						});
					case 'InformationRegister':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'informationRegister', context: 'recordset_and_manager', path: treeItemPath,
							children: this.fillRegisterItemsByMetadata(treeItemIdSlash, 'InformationRegisters', elementObject),
							configType: 'edt'
						});
					case 'AccumulationRegister':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'accumulationRegister', context: 'recordset_and_manager', path: treeItemPath,
							children: this.fillRegisterItemsByMetadata(treeItemIdSlash, 'AccumulationRegisters', elementObject),
							configType: 'edt'
						});
					case 'AccountingRegister':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'accountingRegister', context: 'recordset_and_manager', path: treeItemPath,
							children: this.fillRegisterItemsByMetadata(treeItemIdSlash, 'AccountingRegisters', elementObject),
							configType: 'edt'
						});
					case 'CalculationRegister':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'calculationRegister', context: 'recordset_and_manager', path: treeItemPath,
							children: this.fillCalculationRegisterItemsByMetadata(treeItemIdSlash, elementObject),
							configType: 'edt'
						});
					case 'BusinessProcess':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'businessProcess', context: 'object_and_manager', path: treeItemPath,
							children: this.fillObjectItemsByMetadata(treeItemIdSlash, 'BusinessProcesses', elementObject),
							configType: 'edt'
						});
					case 'Task':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'task', context: 'object_and_manager', path: treeItemPath,
							children: this.fillTaskItemsByMetadata(treeItemIdSlash, elementObject),
							configType: 'edt'
						});
					case 'ExternalDataSource':
						return GetTreeItem(treeItemId, elementName ?? objName, {
							icon: 'externalDataSource',
							children: this.fillExternalDataSourceItemsByMetadata(treeItemIdSlash, elementObject),
							configType: 'edt'
						});
				}
			});
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