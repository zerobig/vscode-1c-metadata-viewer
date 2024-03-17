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
		.replace('WSReference.', 'WSReferences/')
		.replace('StyleItem.', 'StyleItems/')
		.replace('Style.', 'Styles/')
		.replace('Constant.', 'Constants/')
		.replace('Catalog.', 'Catalogs/')
		.replace('Document.', 'Documents/')
		.replace('DocumentNumerator.', 'DocumentNumerators/')
		.replace('Sequence.', 'Sequences/')
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
	treeItem.configType = params.configType ?? 'xml';

	if (params.icon) {
		treeItem.iconPath = getIconPath(params.icon);
	}
	if (params.context) {
		treeItem.contextValue = params.context;
	}
	treeItem.path = params.path;
	if (params.command && params.commandTitle) {
		treeItem.command = {
			command: params.command,
			title: params.commandTitle,
			arguments: [...params.commandArguments ?? [], treeItem.configType] };
	}

	return treeItem;
}

function getIconPath(icon: string): string {
	const isDark = vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark;
	return path.join(__filename, '..', '..', '..', 'resources', isDark ? 'dark' : 'light', icon + '.svg');
}

export function getConfigPaths(): string[] {
	return [
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
}

export function getObjectPaths(): string[] {
	return [
		'mdclass:Subsystem.subsystems',
		'mdclass:ExchangePlan.attributes',
		'mdclass:ExchangePlan.tabularSections',
		'mdclass:ExchangePlan.tabularSections.attributes',
		'mdclass:ExchangePlan.forms',
		'mdclass:ExchangePlan.commands',
		'mdclass:ExchangePlan.templates',
		'mdclass:WebService.operations',
		'mdclass:WebService.operations.parameters',
		'mdclass:HTTPService.urlTemplates',
		'mdclass:HTTPService.urlTemplates.methods',
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
}
