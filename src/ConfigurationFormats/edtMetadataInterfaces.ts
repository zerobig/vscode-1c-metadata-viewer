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
}

export interface ObjectParams {
	$_name: string;
	$_uuid: string;
}
