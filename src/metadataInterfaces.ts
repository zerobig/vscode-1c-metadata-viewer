export interface MetadataFile {
	ConfigDumpInfo: ConfigDumpInfo;
	MetaDataObject: MetaDataObject;
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

export interface ObjectParams {
	name: string;
	id: string;
	configVersion: string;
}

export interface ObjectMetadata {
	$: AttributeParams;
}

interface AttributeParams {
	name: string;
	id: string;
}

///////////////////////////////////////////////////////////////////////////////

interface MetaDataObject {
	EventSubscription: EventSubscriptionMetadata[];
	ScheduledJob: ScheduledJobMetadata[];
}

interface EventSubscriptionMetadata {
	Properties: EventSubscriptionMetadataProperties[];
}

interface ScheduledJobMetadata {
	Properties: ScheduledJobMetadataProperties[];
}

interface EventSubscriptionMetadataProperties {
	Handler: string[];
}

interface ScheduledJobMetadataProperties {
	MethodName: string[];
}