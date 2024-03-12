import { XMLParser } from 'fast-xml-parser';
import * as vscode from 'vscode';
import { CreatePath, GetTreeItem, TreeItem } from '../metadataView';
import { posix } from 'path';

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
		const xmlPath = folderUri.with({ path: posix.join(
			rootPath,
			CreatePath(objName),
			objName.split('.')[1] + '.mdo'
		) });

		vscode.workspace.fs.readFile(xmlPath)
			.then(configXml => {
				const parser = new XMLParser({
					ignoreAttributes: false,
					attributeNamePrefix: '$_',
				});
				const element = parser.parse(Buffer.from(configXml));
				const elementObject = element[Object.keys(element)[1]];
				const elementName = elementObject.name;

				switch (objName.split('.')[0]) {
					case 'Subsystem':
						subTree.push(GetTreeItem('', elementName ?? objName, {
							icon: 'subsystem', children: this.getSubsystemChildren(elementObject)
						}));

						break;
					case 'CommonModule':
						subTree.push(GetTreeItem('', elementName ?? objName, {
							icon: 'commonModule', context: 'module'
						}));

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
}