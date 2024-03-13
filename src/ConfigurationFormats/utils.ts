import * as vscode from 'vscode';
import * as path from 'path';

type IconType = 'common' | 'subsystem' | 'commonModule' | 'sessionParameter' | 'role' | 'attribute' |
	'exchangePlan' | 'constant' | 'catalog' | 'document' | 'documentJournal' | 'enum' | 'report' |
	'dataProcessor' | 'chartsOfCharacteristicType' | 'chartsOfAccount' | 'chartsOfCalculationType' |
	'informationRegister' | 'accumulationRegister' | 'tabularSection' | 'form' | 'command' |
	'template' | 'dimension' | 'resource' | 'column' | 'task' | 'businessProcess' | 'externalDataSource' |
	'accountingRegister' | 'calculationRegister' | 'filterCriteria' | 'eventSubscription' | 'scheduledJob' |
  'accountingFlag' | 'extDimensionAccountingFlag' | 'http' | 'ws' | 'wsLink' | 'operation' | 'parameter' |
  'urlTemplate' | 'picture' | 'style';

interface TreeItemParams {
	icon?: IconType,
	context?: string,
	command?: string,
	commandTitle?: string,
  commandArguments?: any[],
  path?: string,
	children?: TreeItem[],
	configType?: 'edt' | 'xml',
}

export class TreeItem extends vscode.TreeItem {
	id: string;
	children: TreeItem[] | undefined;
	path?: string;
  parentId = '';
  isConfiguration = false;
	configType: 'edt' | 'xml' = 'xml';
  
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

// TODO: Ужасная функция!!!1 Первая очередь на рефакторинг!
export function CreatePath(name: string): string {
	return name
		.replace('Subsystem.', 'Subsystems/')
		.replace('CommonModule.', 'CommonModules/')
		.replace('SessionParameter.', 'SessionParameters/')
		.replace('Role.', 'Roles/')
		.replace('CommonAttribute.', 'CommonAttributes/')
		.replace('ExchangePlan.', 'ExchangePlans/')
		.replace('FilterCriterion.', 'FilterCriteria/')
    .replace('EventSubscription.', 'EventSubscriptions/')
    .replace('ScheduledJob.', 'ScheduledJobs/')
    .replace('FunctionalOption.', 'FunctionalOptions/')
    .replace('FunctionalOptionsParameter.', 'FunctionalOptionsParameters/')
    .replace('DefinedType.', 'DefinedTypes/')
    .replace('SettingsStorage.', 'SettingsStorages/')
    .replace('CommonCommand.', 'CommonCommands/')
    .replace('CommandGroup.', 'CommandGroups/')
    .replace('CommonForm.', 'CommonForms/')
    .replace('CommonTemplate.', 'CommonTemplates/')
    .replace('CommonPicture.', 'CommonPictures/')
		.replace('WebService.', 'WebServices/')
		.replace('HTTPService.', 'HTTPServices/')
		.replace('StyleItem.', 'StyleItems/')
		.replace('Style.', 'Styles/')
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

export function GetTreeItem(id: string, name: string, params: TreeItemParams ): TreeItem {
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
	treeItem.configType = params.configType ?? 'xml';

	return treeItem;
}

function getIconPath(icon: string): string {
	const isDark = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
	return path.join(__filename, '..', '..', '..', 'resources', isDark ? 'dark' : 'light', icon + '.svg');
}
