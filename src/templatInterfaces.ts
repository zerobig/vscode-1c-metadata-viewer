export interface TemplateFile {
	document: TemplateDocument;
}

export interface TemplateDocument {
	rowsItem: TemplateRow[];
	columns: TemplateColumns[];
	format: TemplateFormat[];
	merge: TemplateMergeCells[];
	font: TemplateFont[];
}

interface TemplateColumns {
	id: string;
	size: number;
	columnsItem: ColumnsItem[];
}

interface ColumnsItem {
	index: number;
	column: ColumnsItemFormat
}

interface ColumnsItemFormat {
	formatIndex: number;
}

interface TemplateFormat {
	width: string;
	horizontalAlignment: string;
	bySelectedColumns: string;
	border: number;
	leftBorder: number;
	topBorder: number;
	bottomBorder: number;
	rightBorder: number;
	textPlacement: string;
	font: number;
}

interface TemplateFont {
	$_faceName: string;
	$_height: number;
	$_bold: string;
	$_italic: string;
	$_underline: string;
	$_strikeout: string;
	$_kind: string;
	$_scale: string;
}

export interface TemplateMergeCells {
	r: number;
	c: number;
	w: number;
	h: number;
}

export interface TemplateRow {
	index: number;
	row: TemplateColumn;
}

export interface TemplateColumn {
	columnsID: string;
	formatIndex: number;
	c: TemplateCell[];
}

interface TemplateCell {
	i: number;
	c: TemplateCellData;
}

interface TemplateCellData {
	f: number;
	parameter: string;
	tl: TemplateTextData;
}

interface TemplateTextData {
	[key: string]: TemplateTextData
}