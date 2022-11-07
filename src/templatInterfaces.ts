export interface TemplateFile {
	document: TemplateDocument;
}

export interface TemplateDocument {
	rowsItem: TemplateRow[];
	columns: TemplateColumns[];
	format: TemplateFormat[];
	merge: TemplateMergeCells[];
	font: [];
}

interface TemplateColumns {
	id: string[];
	size: string[];
	columnsItem: ColumnsItem[];
}

interface ColumnsItem {
	index: string[];
	column: ColumnsItemFormat[]
}

interface ColumnsItemFormat {
	formatIndex: string[];
}

interface TemplateFormat {
	width: string[];
	horizontalAlignment: string[];
	bySelectedColumns: string[];
	border: string[];
	leftBorder: string[];
	topBorder: string[];
	bottomBorder: string[];
	rightBorder: string[];
	textPlacement: string[];
	font: string[];
}

export interface TemplateMergeCells {
	r: number[];
	c: number[];
	w: number[];
	h: number[];
}

export interface TemplateRow {
	index: number;
	row: TemplateColumn[];
}

export interface TemplateColumn {
	columnsID: string[];
	formatIndex: number;
	c: TemplateCell[];
}

interface TemplateCell {
	i: string[];
	c: TemplateCellData[];
}

interface TemplateCellData {
	f: TemplateFormat[];
	parameter: string[];
	tl: TemplateTextData[];
}

interface TemplateTextData {
	[key: string]: TemplateTextData[]
}