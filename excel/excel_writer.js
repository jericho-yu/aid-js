import xlsx from 'xlsx';
import http from 'http';
import url from 'url';
import collect from 'collect.js';

export class Writer {
	constructor(filename) {
		if (!filename) {
			throw new Error('Filename cannot be empty');
		}
		this.filename = filename;
		this.workbook = xlsx.utils.book_new();
		this.sheetName = '';
	}

	getFilename() {
		return this.filename;
	}

	setFilename(filename) {
		this.filename = filename;
		return this;
	}

	createSheet(sheetName) {
		if (!sheetName) {
			throw new Error('Sheet name cannot be empty');
		}
		this.sheetName = sheetName;
		xlsx.utils.book_append_sheet(this.workbook, xlsx.utils.aoa_to_sheet([]), sheetName);
		return this;
	}

	activeSheetByName(sheetName) {
		if (!sheetName) {
			throw new Error('Sheet name cannot be empty');
		}
		this.sheetName = sheetName;
		return this;
	}

	activeSheetByIndex(sheetIndex) {
		const sheetNames = this.workbook.SheetNames;
		if (sheetIndex < 0 || sheetIndex >= sheetNames.length) {
			throw new Error('Sheet index out of range');
		}
		this.sheetName = sheetNames[sheetIndex];
		return this;
	}

	setSheetName(sheetName) {
		const sheet = this.workbook.Sheets[this.sheetName];
		this.workbook.SheetNames[this.workbook.SheetNames.indexOf(this.sheetName)] = sheetName;
		this.sheetName = sheetName;
		return this;
	}

	setColumnWidthByIndex(col, width) {
		this.setColumnsWidthByIndex(col, col, width);
		return this;
	}

	setColumnWidthByText(col, width) {
		this.setColumnsWidthByText(col, col, width);
		return this;
	}

	setColumnsWidthByIndex(startCol, endCol, width) {
		const sheet = this.workbook.Sheets[this.sheetName];
		for (let i = startCol; i <= endCol; i++) {
			const colLetter = xlsx.utils.encode_col(i);
			if (!sheet['!cols']) sheet['!cols'] = [];
			sheet['!cols'][i] = { wch: width };
		}
		return this;
	}

	setColumnsWidthByText(startCol, endCol, width) {
		const startColIndex = xlsx.utils.decode_col(startCol);
		const endColIndex = xlsx.utils.decode_col(endCol);
		return this.setColumnsWidthByIndex(startColIndex, endColIndex, width);
	}

	setRows(excelRows) {
		collect(excelRows).each(row => this.addRow(row));
		return this;
	}

	addRow(excelRow) {
		const sheet = this.workbook.Sheets[this.sheetName];
		const rowIndex = sheet['!ref'] ? xlsx.utils.decode_range(sheet['!ref']).e.r + 1 : 0;
		const row = collect(excelRow.cells).map(cell => cell.content).toArray();
		xlsx.utils.sheet_add_aoa(sheet, [row], { origin: -1 });
		return this;
	}

	setTitleRow(titles, rowNumber) {
		const sheet = this.workbook.Sheets[this.sheetName];
		xlsx.utils.sheet_add_aoa(sheet, [titles], { origin: { r: rowNumber - 1, c: 0 } });
		return this;
	}

	async save() {
		if (!this.filename) {
			throw new Error('Filename is not set');
		}
		xlsx.writeFile(this.workbook, this.filename);
	}

	async download(response) {
		response.setHeader('Content-Type', 'application/octet-stream');
		response.setHeader('Content-Disposition', `attachment; filename=${url.parse(this.filename).pathname}`);
		response.setHeader('Content-Transfer-Encoding', 'binary');
		response.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
		const buffer = xlsx.write(this.workbook, { bookType: 'xlsx', type: 'buffer' });
		response.end(buffer);
	}

	getExcelizeFile() {
		return this.workbook;
	}
}

// module.exports = Writer;