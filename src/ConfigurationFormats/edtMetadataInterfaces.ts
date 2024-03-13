export interface Metadata extends ObjectParams {
	attributes?: [];
	tabularSections?: [];
	forms?: [];
	commands?: [];
	templates?: [];
}

export interface ObjectParams {
	$_name: string;
	$_uuid: string;
}
