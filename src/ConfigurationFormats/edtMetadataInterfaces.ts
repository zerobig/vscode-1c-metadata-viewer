export interface Metadata extends ObjectParams {
	attributes?: [];
	tabularSections?: [];
	forms?: [];
	commands?: [];
	templates?: [];
	columns?: [];
	enumValues?: [];
	dimensions?: [];
	resources?: [];
	accountingFlags?: [];
	extDimensionAccountingFlags?: [];
	addressingAttributes?: [];
}

export interface ObjectParams {
	name: string;
	$_uuid: string;
}
