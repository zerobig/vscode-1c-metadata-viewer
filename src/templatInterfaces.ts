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
	tl: [];
}