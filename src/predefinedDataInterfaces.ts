export interface PredefinedDataFile {
	PredefinedData: PredefinedData;
}

export interface PredefinedData {
	Item: PredefinedDataItem[];
}

export interface PredefinedDataItem {
	ChildItems: PredefinedData;
	Code: string;
	Description: string;
	IsFolder: boolean;
	Name: string;
}