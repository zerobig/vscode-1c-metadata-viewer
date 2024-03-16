export interface Metadata extends ObjectParams {
	attributes?: ObjectParams[];
	tabularSections?: TabularSections[];
	forms?: ObjectParams[];
	commands?: ObjectParams[];
	templates?: ObjectParams[];
	columns?: ObjectParams[];
	enumValues?: ObjectParams[];
	dimensions?: ObjectParams[];
	resources?: ObjectParams[];
	accountingFlags?: ObjectParams[];
	extDimensionAccountingFlags?: ObjectParams[];
	addressingAttributes?: ObjectParams[];
}

export interface ObjectParams {
	name: string;
	$_uuid: string;
}

export interface TabularSections extends ObjectParams {
	attributes?: ObjectParams[];
}