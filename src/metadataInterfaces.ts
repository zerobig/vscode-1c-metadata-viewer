export interface MetadataFile {
	ConfigDumpInfo: ConfigDumpInfo;
}

interface ConfigDumpInfo {
	ConfigVersions: ConfigVersion[];
}

interface ConfigVersion {
	Metadata: VersionMetadata[];
}

export interface VersionMetadata {
	$: ObjectParams;
	Metadata?: ObjectMetadata[];
}

interface ObjectParams {
	name: string;
	id: string;
	configVersion: string;
}

interface ObjectMetadata {
	$: AttributeParams;
}

interface AttributeParams {
	name: string;
	id: string;
}