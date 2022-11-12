export type Configuration = {
	displayName: string;
	path: string;
	id: string;
	name: string;
	synonym: string;
	comment: string;
	defaultRunMode: string;
	usePurposes: string[];
	scriptVariant: string;
	defaultRoles: string[];
	briefInformation: string;
	detailedInformation: string;
	copyright: string;
	vendorInformationAddress: string;
	configurationInformationAddress: string;
	vendor: string;
	version: string;
	updateCatalogAddress: string;
	dataLockControlMode: string;
	objectAutonumerationMode: string;
	modalityUseMode: string;
	synchronousPlatformExtensionAndAddInCallUseMode: string;
	interfaceCompatibilityMode: string;
	compatibilityMode: string;
}