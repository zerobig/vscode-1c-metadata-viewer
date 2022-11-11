export interface MetadataFile {
	ConfigDumpInfo: ConfigDumpInfo;
	MetaDataObject: MetaDataObject;
}

interface ConfigDumpInfo {
	ConfigVersions: ConfigVersion;
}

interface ConfigVersion {
	Metadata: VersionMetadata[];
}

export interface VersionMetadata extends ObjectParams {
	Metadata?: ObjectMetadata[];
}

export interface ObjectParams {
	$_name: string;
	$_id: string;
	$_configVersion: string;
}

export interface ObjectMetadata {
	$_name: string;
	$_id: string;
}

///////////////////////////////////////////////////////////////////////////////

interface MetaDataObject {
	EventSubscription: EventSubscriptionMetadata;
	ScheduledJob: ScheduledJobMetadata;
}

interface EventSubscriptionMetadata {
	Properties: EventSubscriptionMetadataProperties;
}

interface ScheduledJobMetadata {
	Properties: ScheduledJobMetadataProperties;
}

interface EventSubscriptionMetadataProperties {
	Handler: string;
}

interface ScheduledJobMetadataProperties {
	MethodName: string;
}